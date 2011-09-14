dojo.provide('rishson.enterprise.control.Transport');

/**
 * @class
 * @name rishson.enterprise.control.Transport
 * @description Interface - all Transport implementations must provide implementations for all of these functions
 */
dojo.declare('rishson.enterprise.control.Transport', null, {

    /**
     * @field
     * @name rishson.enterprise.Transport.sidParamName
     * @type {String}
     * @description the name of the parameter to use for passing the CSRF mitigation token to the server
     */
    sidParamName : 'sid',

    /**
     * @field
     * @name rishson.enterprise.Transport._sessionId
     * @type {String}
     * @description Mitigate CSRF attacks using Double Cookie Submission technique
     * Get the id of the current browser session from this domain's cookies
     */
     _sessionId : dojo.cookie("JSESSIONID"),

    /**
     * @field
     * @name rishson.enterprise.Transport.handleResponseFunc
     * @type {Function}
     * @description this function will be called when the Transport implementation receives a valid server response
     */
    handleResponseFunc : null,

    /**
     * @field
     * @name rishson.enterprise.Transport.handleErrorFunc
     * @type {Function}
     * @description this function will be called when the Transport implementation receives an error server response
     */
    handleErrorFunc : null,

    /**
     * @function
     * @name rishson.enterprise.Transport.addResponseFunctions
     * @description adds response functions to the Transport.
     * @param {Function} responseFunc this function will be called to handle a valid response
     * @param {Function} errorFunc this function will be called to handle a response that contains an error
     */
    addResponseFunctions : function (responseFunc, errorFunc) {
        this.handleResponseFunc = responseFunc;
        this.handleErrorFunc = errorFunc;
    },

    /**
     * @function
     * @name rishson.enterprise.Transport.send
     * @description Issues the provided <code>rishson.enterprise.control.Request</code> in an asynchronous manner
     * This function will call rishson.enterprise.control.ControlLayer.handleError if an error occurred during the send.
     * @param {rishson.enterprise.control.Request} request to send to the server
     */
    send : function (request) {
        console.error('Send must be implemented by derived Transport implementations.');
    },

    /**
     * @function
     * @name rishson.enterprise.Transport.createBasePostParams
     * @description Creates the basic POST params object, including all params from the Request and a security
     * token from the browser sessionID to mitigate CSRF attacks
     * @param {rishson.enterprise.control.Request} request to send to the server
     * @return {Object} simple map object with the basic set of POST params in tag : value format
     */
    createBasePostParams : function (request) {
        var postParams = request.getParams();
        postParams.push(this.sidParamName, this._sessionId);    //add CSRF token to all requests
        return postParams;
    }


});