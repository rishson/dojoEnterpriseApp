dojo.provide('rishson.enterprise.control.RestRequest');

dojo.require('rishson.enterprise.control.Request');
dojo.require('rishson.enterprise.util.ObjectValidator');

dojo.declare('rishson.enterprise.control.RestRequest', [rishson.enterprise.control.Request], {

    /**
     * @field
     * @name rishson.enterprise.control.ServiceRequest.service
     * @type {String}
     * @description the service name to call
     */
    service : null,

    /**
     * @field
     * @name rishson.enterprise.control.ServiceRequest.verb
     * @type {String}
     * @description the REST verb to use when making the call
     */
    verb : null,

    /**
     * @constructor
     * @param {Object} params Must contain the following:
     *  service {String} the name of a service to call
     *  method {String} the name of a service method to call
     */
    constructor : function (params) {
        var criteria = [];
        criteria.push({paramName : 'service', paramType : 'string'});
        criteria.push({paramName : 'verb', paramType : 'string'});
        var validator = new rishson.enterprise.util.ObjectValidator(criteria);

        if (validator.validate(params)) {
            dojo.mixin(this, params);
        }
        else {
            validator.logErrorToConsole(params, 'Invalid RestRequest construction.');
            throw('Invalid RestRequest construction.');
        }
    },

    /**
     * @function
     * @override Request
     * @name rishson.enterprise.control.ServiceRequest.toUrl
     * @description Returns the URL part of the request
     */
    toUrl : function () {
        return this.service;
    }

});