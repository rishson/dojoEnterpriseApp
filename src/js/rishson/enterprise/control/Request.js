dojo.provide('rishson.enterprise.control.Request');

/**
 * @class
 * @name rishson.enterprise.control.Request
 * @description This class should be extended by all derived server request classes.
 */
dojo.declare('rishson.enterprise.control.Request', null, {

    /**
     * @field
     * @name rishson.enterprise.control.Request.params
     * @type {Array}
     * @description An array that contains the parameters to send to the server.
     */
    params : [],

    /**
     * @field
     * @name rishson.enterprise.control.Request.callback
     * @type {Function}
     * @description A function to call when the server response has returned.
     */
    callback : null,

    /**
     * @field
     * @name rishson.enterprise.control.Request.callbackScope
     * @type {Function}
     * @description The scope in which to call the callback.
     */
    callbackScope : null,

    /**
     * @constructor
     * @param {Object} params Must contain the following:
     *  callback {Function} a function to call when a Response is returned from the server in response to this Request
     *  callbackScope {Object} a scope in which to call the callback function
     */
    constructor : function (params) {
        var criteria = {validationCriteria : []};
        criteria.validationCriteria.push({paramName : 'callback', paramType : 'function'});
        criteria.validationCriteria.push({paramName : 'callbackScope', paramType : 'object'});
        var validator = new rishson.enterprise.util.ObjectValidator(criteria);

        if (validator.validate(params)) {
            dojo.mixin(this, params);
        }
        else {
            validator.logErrorToConsole(params, 'Invalid Request construction.');
            throw('Invalid Request construction.');
        }
    },

    /**
     * @function
     * @name rishson.enterprise.control.Request.toUrl
     * @description Converts the <code>rishson.enterprise.control.Request</code> derived class into a String representing a URL.
     */
    toUrl : function () {
        throw('toUrl must be implemented in derived classes');
    },

    /**
     * @function
     * @name rishson.enterprise.control.Request.setParam
     * @description sets a param on the request
     */
    setParam : function (param) {
        this.params.push(param);
    },

    /**
     * @function
     * @name rishson.enterprise.control.Request.getParams
     * @description returns the params to be posted to the server
     */
    getParams : function () {
        return this.params;
    }
    
});