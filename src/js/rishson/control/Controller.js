define([
    "rishson/Globals",
    "rishson/util/ObjectValidator",
    "rishson/view/AppContainer", // LOGOUT topic string
    "dojo/_base/lang", // mixin, hitch
    "dojo/_base/array", // indexOf, forEach
    "dojo/_base/declare", // declare
    "dojo/topic", // publish/subscribe
    "dojox/rpc/Service"
], function(Globals, ObjectValidator, AppContainer, lang, arrayUtil, declare, topic, Service){

    /**
     * @class
     * @name rishson.control.Controller
     * @description This class is the conduit for all client server communication.
     */
    return declare('rishson.control.Controller', null, {
    
        /**
         * @field
         * @name rishson.control.Controller.transport
         * @type {rishson.control.Transport}
         * @description an implementation of rishson.control.Transport
         */
        transport : null,
    
        /**
         * @field
         * @name rishson.control.Controller.logoutRequest
         * @type {rishson.control.Request}
         * @description a Request to send to the server when a user wants to logout
         */
        logoutRequest : null,
    
        /**
         * @field
         * @name rishson.control.Controller.serviceRegistry
         * @type {Array}
         * @description an array of dojox.RpcService(s). THis is populated from a list of SMD definitions
         */
        serviceRegistry : null,
    
        /**
         * @field
         * @name rishson.control.Controller.grantedAuthorities
         * @type {Array}
         * @description an array of permission to grant to the currently logged on user. Permissions willbe coerced to 
       * lower case.
         */
        grantedAuthorities : null,
    
        /**
         * @field
         * @name rishson.control.Controller.returnRequest
         * @type {Boolean}
         * @description should the Request be returned to the callee when a Response is created
         */
        returnRequest : false,
    
        /**
         * @field
         * @name rishson.widget._Widget._topicNamespace
         * @type {String}
         * @private
         * @description This namespace is prepended to every topic
         */
        _topicNamespace : Globals.TOPIC_NAMESPACE,
    
        /**
         * @field
         * @name rishson.widget._Widget.subList
         * @type {Object}
         * @description Object that contains the list of topics that any derived widget can listen out for
         */
        //@todo make this private with get/set so that contents can only be added to
        subList : null,
    
        /**
         * @constructor
         * @param {Object} transport an implementation of rishson.control.Transport
         */
        constructor : function (transport, validLoginResponse) {
            /*validLoginResponse should be in the form:
                {logoutRequest: rishson.control.Request,
                serviceRegistry : [SMD Objects],
                grantedAuthorities : [Authority Objects]}
            */
            var criteria = [{paramName : 'transport', paramType : 'object'},
                {paramName : 'validLoginResponse', paramType : 'criteria', criteria :
                    [{paramName : 'logoutRequest', paramType : 'object'},
                    {paramName : 'serviceRegistry', paramType : 'array'},
                    {paramName : 'grantedAuthorities', paramType : 'array'}]
                }];
            var validator = new ObjectValidator(criteria);
    
            //collect up the params and validate
            var params = {'transport' : transport, 'validLoginResponse' : validLoginResponse};
            if(validator.validate(params)) {
                //unwrap the object contents for validation and to do a mixin
                var unwrappedParams = {'transport' : transport,
                'logoutRequest': validLoginResponse.logoutRequest,
                'serviceRegistry': validLoginResponse.serviceRegistry,
                'grantedAuthorities': validLoginResponse.grantedAuthorities};
                
                this.subList = {};
                
                lang.mixin(this, unwrappedParams);

				var testParams = {username : 'Rishson',
					footerText : '&copy; 2011 Rishson Enterprises.'};

				this.throwaway = new rishson.view.AppContainer(testParams);

                //this is optional so should not be included in the criteria validation
                if(validLoginResponse.returnRequest) {
                  this.returnRequest = true;			
                }
                
                //convert authorities to lower case so we can do case-insensitive search for authorities
                arrayUtil.forEach(this.grantedAuthorities, function(authority){
                    if(lang.isString(authority)){				
                        authority = authority.toLowerCase();
                    }
                    else {
                        //remove invalid permissions that are not strings
                        console.error("Invalid authority passed to Controller: " + authority);
                        this.grantedAuthorities.splice(index, 1);				
                    }	
                }, this);
                
                //decorate the transport with the response and error handling functions in this class (need hitching)
                this.transport.addResponseFunctions(lang.hitch(this, this.handleResponse),
                    lang.hitch(this.handleError));
                
                //listen out for other classes wanting to send requests to the server
                topic.subscribe(Globals.SEND_REQUEST, lang.hitch(this, "send"));
            }
            else {
                validator.logErrorToConsole(params, 'Invalid params passed to the Controller.');
                throw ('Invalid params passed to the Controller.');
            }
        },
        
         /**
         * @function
         * @name rishson.control.Controller.registerWidget
         * @description When this is called, the COntroller will seeif it has wirings for the widget and will create
         * the relevant pubs and subs.
         * This behaviour is in a separate function so that teh COntroller can be used withour reference to the AppContainer
         * @param {rishson.widget._Widget} a widgets that derrives from _Widget
         */
        
        registerWidget : function(widget) {
            if(widget.declaredClass === this.throwaway.declaredClass){
                //listen out for events from the AppContainer
                topic.subscribe(this.throwaway.pubList.LOGOUT, lang.hitch(this, "_handleLogout"));
            }
        },
        
        
         /**
         * @function
         * @name rishson.control.Controller.send
         * @description Issues the provided <code>rishson.control.Request</code> in an asynchronous manner
         * This function delegates the actual sending of the Request to the injected Transport implementation.
         * rishson.control.Controller.handleRequest will be called for valid responses.
         * rishson.control.Controller.handleError will be called if an error occurred during the send.
         * @param {rishson.control.Request} request to send to the server
         */
        send : function (request) {
            this.transport.send(request);
            //auditing, analytics etc can be enabled here
        },
    
        /**
         * @function
         * @name rishson.control.Controller.handleResponse
         * @description Handles a valid response from a transport.
         * @param {Object} request an object that is the original request to the server
         * @param {rishson.control.Response} response an object that is the server response
         */
        handleResponse : function (request, response) {
            var scopedCallback;
    
            //if the request has a topic specified then publish the response to the topic
            if(request.topic) {
                var topicData = [request.topic, response];
                //return the original request along with the response if required
                if(this.returnRequest) {
                    topicData.push(request);
                }
                //dojo/topic's publish doesn't take an array, so send arguments in series
                topic.publish.apply(topic, topicData);
            }
            else{
                //call the request's provide callback with the response - but hitch it's scope first if needs be
                if (request.callbackScope) {
                    scopedCallback = lang.hitch(request.callbackScope, request.callback);
                }
                else {
                    scopedCallback = request.callback;  //if no scope is specified then assume the callback must already be scoped
                }
                
                //return the original request along with the response if required
                if(this.returnRequest) {
                        scopedCallback(response, request);
                }
                else {
                  scopedCallback(response);		
                }
            }
        },
    
        /**
         * @function
         * @name rishson.control.Controller.handleError
         * @description Handles an unexpected (runtime) error response from a transport.
         * @param {Object} request an object that is the original reuest to the server
         * @param {Object} err an object that is the server error response
         */
        handleError : function (request, err) {
            //our generic error handling code goes here
            //if required, dump analytics to server
            //send error to console - might need to remove sensitive data
            throw "Error occured during server call: " + err;
            //raise error as event
        },
    
        /**
         * @function
         * @name rishson.control.Controller.hasGrantedAuthority
         * @description Handles an user logout request.
         */
        hasGrantedAuthority : function(authority) {
            return arrayUtil.indexOf(this.grantedAuthorities, authority.toLowerCase()) >= 0;
        },
    
        /**
         * @function
         * @private
         * @name rishson.control.Controller._instantiateServiceRegistry
         * @description convert all the given SMDs into dojox.rpc.Service instances.
         */
        _instantiateServiceRegistry : function() {
            var serviceArr = [];		
            arrayUtil.forEach(this.serviceRegistry, function(SMD) {
              try {
                serviceArr.push(new Service(SMD));		
              }
              catch(e) {
                console.error("Invalid SMD definition: " + SMD);	
              }
            }, this);
            this.serviceRegistry = serviceArr;	//swap in the service registry
        },
    
        /**
         * @function
         * @private
         * @name rishson.control.Controller._validateServices
         * @description Call the validation function for all services.
         * Each service should have a pre-defined test function (__validate) that can be called to validate that the service is up.
         */
        _validateServices : function() {
            arrayUtil.forEach(this.serviceRegistry, function(service) {
                try {
                //call the test function
                  //service.__validate();  
                }
                catch(e) {
                console.error("Invalid SMD definition: " + SMD);	
                }
            }, this);
            this.serviceRegistry = serviceArr;	//swap in the service registry
        },
    
    
        /**
         * @function
         * @name rishson.control.Controller._handleLogout
         * @private
         * @description Handles an user logout request.
         */
        _handleLogout : function() {
            this.send(this.logoutRequest);
        }
    
    });
});