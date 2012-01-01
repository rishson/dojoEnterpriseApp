define([
    "dojo/_base/declare", // declare
    "dojo/_base/lang", // mixin
    "rishson/control/Request",
    "rishson/util/ObjectValidator"
], function(declare, lang, Request, ObjectValidator){

    return declare('rishson.control.RestRequest', Request, {
    
        /**
         * @field
         * @name rishson.control.ServiceRequest.service
         * @type {String}
         * @description the service name to call
         */
        service : null,
    
        /**
         * @field
         * @name rishson.control.ServiceRequest.verb
         * @type {String}
         * @description the REST verb to use when making the call
       * Can be delete, get, post or put
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
            var validator = new ObjectValidator(criteria);
    
            if (validator.validate(params)) {
                lang.mixin(this, params);
          this.type = "rest";
            }
            else {
                validator.logErrorToConsole(params, 'Invalid RestRequest construction.');
                throw('Invalid RestRequest construction.');
            }
        },
    
        /**
         * @function
         * @override Request
         * @name rishson.control.ServiceRequest.toUrl
         * @description Returns the URL part of the request
         */
        toUrl : function () {
            return this.service;
        }
    
    });
});