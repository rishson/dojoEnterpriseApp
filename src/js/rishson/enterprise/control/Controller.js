dojo.provide('rishson.enterprise.control.Controller');

dojo.require('rishson.enterprise.Globals');
dojo.require('rishson.enterprise.util.ObjectValidator');

/**
 * @class
 * @name rishson.enterprise.control.Controller
 * @description This class is the conduit for all client server communication.
 */
dojo.declare('rishson.enterprise.control.Controller', null, {

    /**
     * @field
     * @name rishson.enterprise.control.Controller.transport
     * @type {rishson.enterprise.control.Transport}
     * @description an implementation of rishson.enterprise.control.Transport
     */
    transport : null,

    /**
     * @field
     * @name rishson.enterprise.control.Controller.logoutRequest
     * @type {rishson.enterprise.control.Request}
     * @description a Request to send to the server when a user wants to logout
     */
    logoutRequest : null,

    /**
     * @field
     * @name rishson.enterprise.widget._Widget._topicNamespace
     * @type {String}
     * @private
     * @description This namespace is prepended to every topic
     */
    _topicNamespace : rishson.enterprise.Globals.TOPIC_NAMESPACE,

    /**
     * @field
     * @name rishson.enterprise.widget._Widget.subList
     * @type {Object}
     * @description Object that contains the list of topics that any derived widget can listen out for
     */
    //@todo make this private with get/set so that contents can only be added to
    subList : {SEND_REQUEST : this._topicNamespace + '/send/request'},

    /**
     * @constructor
     * @param {Object} transport an implementation of rishson.enterprise.control.Transport
     */
    constructor : function (transport) {
        var criteria = [{paramName : 'transport', paramType : 'object'}];
        var validator = new rishson.enterprise.util.ObjectValidator(criteria);

        var wrappedParams = {transport : transport};   //wrap transport into an object, so we can validate and mixin
        if (validator.validate(wrappedParams)) {
            dojo.mixin(this, wrappedParams);

            //decorate the transport with the response and error handling functions in this class
            this.transport.addResponseFunctions(this.handleResponse, this.handleError);

            //listen out for other classes wanting to send requests to the server
            dojo.subscribe(this.subList.SEND_REQUEST, this, this.send);

            //listen out for user level events
            dojo.subscribe(rishson.enterprise.Globals.TOPIC_USER_LOGOUT, this, this.handleLogout);
        }
        else {
            validator.logErrorToConsole(params, 'Invalid Transport implementation passed to the Controller.');
            throw ('Invalid Transport implementation passed to the Controller.');
        }
    },

     /**
     * @function
     * @name rishson.enterprise.control.Controller.send
     * @description Issues the provided <code>rishson.enterprise.control.Request</code> in an asynchronous manner
     * This function delegates the actual sending of the Request to the injected Transport implementation.
     * rishson.enterprise.control.Controller.handleRequest will be called for valid responses.
     * rishson.enterprise.control.Controller.handleError will be called if an error occurred during the send.
     * @param {rishson.enterprise.control.Request} request to send to the server
     */
    send : function (request) {
        this.transport.send(request);
        //auditing, analytics etc can be enabled here
    },

    /**
     * @function
     * @name rishson.enterprise.control.Controller.handleResponse
     * @description Handles a valid response from a transport.
     * @param {Object} response an object that is the server response
     */
    handleResponse : function (request, response) {
        var scopedCallback;
        if (request.scope) {
            scopedCallback = dojo.hitch(request.scope, request.callback);
        }
        else {
            scopedCallback = request.callback;  //if no scope is specified then assume the callback must already be scoped
        }

        if(! response.payload) {
            console.error('Invalid server response. No envelope specified') ;
        }
        else {
            scopedCallback(response.payload);
        }
    },

    /**
     * @function
     * @name rishson.enterprise.control.Controller.handleError
     * @description Handles an unexpected (runtime) error response from a transport.
     * @param {Object} response an object that is the server error response
     */
    handleError : function (request, response) {
        //our generic error handling code goes here
        //if required, dump analytics to server
        //send error to console - might need to remove sensitive data
        //raise error as event
    },

    /**
     * @function
     * @name rishson.enterprise.control.Controller._handleLogout
     * @private
     * @description Handles an user logout request.
     */
    handleLogout : function() {
        this.send(this.logoutRequest);
    }

});