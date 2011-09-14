dojo.provide('rishson.enterprise.control.ServiceRequest');

dojo.require('rishson.enterprise.util.ObjectValidator');

dojo.declare('rishson.enterprise.control.ServiceRequest', [rishson.enterprise.control.Request], {

    /**
     * @field
     * @name rishson.enterprise.control.ServiceRequest.service
     * @type {String}
     * @description the service name to call
     */
    service : null,

    /**
     * @field
     * @name rishson.enterprise.control.ServiceRequest.method
     * @type {String}
     * @description the method on the service to call
     */
    method : null,

    /**
     * @constructor
     * @param {Object} params Must contain the following:
     *  service {String} the name of a service to call
     *  method {String} the name of a service method to call
     */
    constructor : function (params) {
        var criteria = [];
        var validator = new rishson.enterprise.util.ObjectValidator(criteria);
        criteria.push({paramName : 'service', paramType : 'string'});
        criteria.push({paramName : 'method', paramType : 'string'});

        if (validator.validate(params)) {
            dojo.mixin(this, params);
        }
        else {
            validator.logErrorToConsole(params, 'Invalid ServiceRequest construction.');
            throw('Invalid ServiceRequest construction.');
        }
    },

    /**
     * @function
     * @override Request
     * @name rishson.enterprise.control.ServiceRequest.toUrl
     * @description Returns the URL part of the request
     */
    toUrl : function () {
        return this.service + "/" + this.method;
    }

});