define([
	"dojo/_base/declare", // declare
	"dojo/_base/lang", // mixin
	"rishson/control/Request",
	"rishson/util/ObjectValidator"
], function (declare, lang, Request, ObjectValidator) {

	return declare('rishson.control.ServiceRequest', Request, {

		/**
		 * @field
		 * @name rishson.control.ServiceRequest.service
		 * @type {string}
		 * @description the service name to call
		 */
		service: null,

		/**
		 * @field
		 * @name rishson.control.ServiceRequest.method
		 * @type {string}
		 * @description the method on the service to call
		 */
		method: null,

		/**
		 * @constructor
		 * @param {{service: string, method: string}} params Must contain the following:
		 * service {string} the name of a service to call
		 * method {string} the name of a service method to call
		 */
		constructor: function (params) {
			var criteria = [],
				validator = new ObjectValidator(criteria);

			criteria.push({paramName: 'service', paramType: 'string'});
			criteria.push({paramName: 'method', paramType: 'string'});

			if (validator.validate(params)) {
				lang.mixin(this, params);
				this.type = "service";
			} else {
				validator.logErrorToConsole(params, 'Invalid ServiceRequest construction.');
				throw ('Invalid ServiceRequest construction.');
			}
		},

		/**
		 * @function
		 * @override rishson.control.Request.toUrl
		 * @name rishson.control.ServiceRequest.toUrl
		 * @return {string}
		 * @description Returns the URL part of the request
		 */
		toUrl: function () {
			return this.service + "/" + this.method;
		}
	});
});