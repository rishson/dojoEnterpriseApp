dojo.provide('rishson.enterprise.control.Controller');

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
     * @constructor
     * @param {Object} params Must contain the following:
     *  transport {Object} an implementation of rishson.enterprise.control.Transport
     */
    constructor : function (params) {
        var criteria = [{paramName : 'transport', paramType : 'object'}];
        var validator = new rishson.enterprise.util.ObjectValidator(criteria);

        if (validator.validate(params)) {
            dojo.mixin(this, params);

            //decorate the transport with the response and error handling functions in this class
            this.transport.addResponseFunctions(this.handleResponse, this.handleError);
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
     * @name rishson.enterprise.control.Transport.handleResponse
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
     * @name rishson.enterprise.control.Transport.handleError
     * @description Handles an unexpected (runtime) error response from a transport.
     * @param {Object} response an object that is the server error response
     */
    handleError : function (request, response) {
        //our generic error handling code goes here
        //if required, dump analytics to server
        //send error to console - might need to remove sensitive data
        //raise error as event
    }
    
});