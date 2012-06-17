define([
	"dojo/_base/declare",	// declare
	"dojo/_base/lang",	// mixin
	"rishson/control/Request",	//mixin
	"rishson/util/ObjectValidator"	//validate
], function (declare, lang, Request, ObjectValidator) {

	return declare('rishson.control.RestRequest', Request, {

		/**
		 * @field
		 * @name rishson.control.ServiceRequest.service
		 * @type {string}
		 * @description the service name to call
		 */
		service: null,

		/**
		 * @field
		 * @name rishson.control.ServiceRequest.verb
		 * @type {string}
		 * @description the REST verb to use when making the call
		 * Can be delete, get, post or put
		 */
		verb: null,

		/**
		 * @field
		 * @name rishson.control.ServiceRequest.VERBS
		 * @type {object{string: string}}
		 * @description the list of accepted REST verbs. This is class level rather than instance level.
		 * Can be delete, get, post or put.
		 */
		VERBS : {get: 'Get', post: 'Post', 'delete': 'Delete', put: 'Put'},

		/**
		 * @constructor
		 * @param {{service: string, method: string}} params Must contain the following:
		 *  service {string} the name of a service to call
		 *  method {string} the name of a service method to call
		 */
		constructor: function (params) {
			var criteria = [],
				validator = new ObjectValidator(criteria);

			criteria.push({paramName: 'service', paramType: 'string'});
			criteria.push({paramName: 'verb', paramType: 'string'});

			if (validator.validate(params)) {
				lang.mixin(this, params);
				this.type = "rest";
			} else {
				validator.logErrorToConsole(params, 'Invalid RestRequest construction.');
				throw ('Invalid RestRequest construction.');
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
			return this.service;
		}
	});
});