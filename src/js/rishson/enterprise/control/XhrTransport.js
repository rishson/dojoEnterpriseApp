dojo.provide('rishson.enterprise.control.XhrTransport');

dojo.require('rishson.enterprise.control.Response');
dojo.require('rishson.enterprise.control.Transport');
dojo.require('rishson.enterprise.util.ObjectValidator');

/**
 * @class
 * @name rishson.enterprise.control.XhrTransport
 * @description An implementation of <code>rishson.enterprise.control.Transport</code> that uses XHR calls to a server
 */
dojo.declare('rishson.enterprise.control.XhrTransport', [rishson.enterprise.control.Transport], {

    /**
     * @field
     * @name rishson.enterprise.control.XhrTransport.baseUrl
     * @type {String}
     * @description a URL that usually specifies the domain and a global context, e.g. http://www.mydomain.com:myport/mycontext
     */
    baseUrl : null,

    /**
     * @field
     * @name rishson.enterprise.control.XhrTransport.requestTimeout
     * @type {Number}
     * @description the number of milliseconds that a <code>rishson.enterprise.control.Request</code> can take before the call is aborted.
     */
    requestTimeout : 5000,  //defaults to 5 seconds


	/**
     * @field
     * @name rishson.enterprise.control.XhrTransport.mappedStatusCodes
	 * @private
     * @type {Array}
     * @description The non 200 series statusCodes that are handled in a rishson.enterprise.control.Response.
     */
	_mappedStatusCodes : [400, 403, 409],

    /**
     * @constructor
     * @param {Object} params Must contain the following:
     *  baseUrl {String} root and context of the web application. e.g. http://www.mydomain.com:myport/mycontext
     */
    constructor : function (params) {
        var criteria = [{paramName : 'baseUrl', paramType : 'string'}];
        var validator = new rishson.enterprise.util.ObjectValidator(criteria);

        if (validator.validate(params)) {
            dojo.mixin(this, params);
        }
        else {
            validator.logErrorToConsole(params, 'Invalid XhrTransport construction.');
            throw('Invalid XhrTransport construction.');
        }
    },

    /**
     * @function
     * @name rishson.enterprise.control.XhrTransport.send
     * @description Issues the provided <code>rishson.enterprise.control.Request</code> in an asynchronous manner
     * @override Transport.send
     * @param {rishson.enterprise.control.Request} request to send to the server
     */
    send : function (request) {	
        var postParams = dojo.toJson(this.createBasePostParams(request));
        //do autoincrement sendID if required
        //profiling can be enabled here

		//default to post as this is used for service requests as well as rest
		var xhrFunction;

  	   //Can't use 'then' in Dojo 1.6 if you need the ioArgs. See #12126 on dojo trac
        var xhrParams = {
		    url: this.baseUrl + request.toUrl(),
		    content : postParams,
		    handleAs: "json",
            headers : {'Content-Type' : "application/json"},
		    timeout : this.requestTimeout,
            load : dojo.hitch(this, function(response, ioargs){	
			    var wrappedResponse = new rishson.enterprise.control.Response(response,
				    request.type === 'rest',
				    ioargs);
                this.handleResponseFunc(request, wrappedResponse);
            }),
            error : function(err, ioArgs){
				if(this._mappedStatusCodes.indexOf(ioArgs.statusCode) > -1) {
					var wrappedResponse = new rishson.enterprise.control.Response(response,
					    request.type === 'rest',
					    ioargs);
	                this.handleResponseFunc(request, wrappedResponse);
				}
				else {
	                //unhandled error - something went wrong in the XHR request/response that we dont cope with
    	            //Its OK to send the error to the console as this does not pose a security risk.	
    	            //the failure is freely available using http traffic monitoring so we are not 'leaking' information
    	            console.error(err);

    	            this.handleErrorFunc(request, response);
    	            //you could do further processing such as put the transport in a retry or quiescent state
				}
            }
        };

		if(request.type === 'rest'){
			switch (request.verb) {
				case 'get' :
					xhrFunction = dojo.xhrGet;
					break;
				case 'put' :
					xhrFunction = dojo.xhrPut;				
                    xhrParams.putData = postParams;
                    delete(xhrParams.content);
 					break;
				case 'delete' :
					xhrFunction = dojo.xhrDelete;
					break;
                case 'post' :
					xhrFunction = dojo.xhrPost;
                    xhrParams.postData = postParams;
                    delete(xhrParams.content);
					break;
			}			
		}

		var def = xhrFunction(xhrParams);

        /*def.then(function(response, ioargs){
            //all server responses implement a top level object that indicates if the response is a success or error
            //in this case, an error is a known server error state - not an unexpected runtime error.            

			var wrappedResponse = new rishson.enterprise.control.Response(response, 
				request.type === 'rest',
				ioargs);
            this.handleResponseFunc(request, wrappedResponse);
        },
        function(err){
            //unexpected error - something went wrong in the XHR request/response
            //Its OK to send the error to the console as this does not pose a security risk.
            //the failure is freely available using http traffic monitoring so we are not 'leaking' information
            console.error(err);
			
            this.handleErrorFunc(request, response);
            //you could do further processing such as put the transport in a retry or quiescent state
        });*/
    }

});
