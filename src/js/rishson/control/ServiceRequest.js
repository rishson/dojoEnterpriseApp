define([
    "dojo/_base/declare", // declare
    "dojo/_base/lang", // mixin
    "rishson/control/Request",
    "rishson/util/ObjectValidator"
], function(declare, lang, Request, ObjectValidator){

    return declare('rishson.control.ServiceRequest', Request, {
    
        /**
         * @field
         * @name rishson.control.ServiceRequest.service
         * @type {String}
         * @description the service name to call
         */
        service : null,
    
        /**
         * @field
         * @name rishson.control.ServiceRequest.method
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
            criteria.push({paramName : 'service', paramType : 'string'});
            criteria.push({paramName : 'method', paramType : 'string'});
            var validator = new ObjectValidator(criteria);
    
            if (validator.validate(params)) {
                lang.mixin(this, params);
                this.type = "service";        
            }
            else {
                validator.logErrorToConsole(params, 'Invalid ServiceRequest construction.');
                throw('Invalid ServiceRequest construction.');
            }
        },
    
        /**
         * @function
         * @override Request
         * @name rishson.control.ServiceRequest.toUrl
         * @description Returns the URL part of the request
         */
        toUrl : function () {
            return this.service + "/" + this.method;
        }
    
    });
});