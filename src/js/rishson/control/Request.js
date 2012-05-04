define([
	"dojo/_base/declare", // declare
	"dojo/_base/lang", // mixin
	"rishson/util/ObjectValidator"
], function (declare, lang, ObjectValidator) {
	/**
	 * @class
	 * @name rishson.control.Request
	 * @description This class should be extended by all derived server request classes.
	 */
	return declare('rishson.control.Request', null, {

		/**
		 * @field
		 * @name rishson.control.Request.params
		 * @type {Array}
		 * @description An array that contains the parameters to send to the server.
		 */
		params: null,

		/**
		 * @field
		 * @name rishson.control.Request.callback
		 * @type {Function}
		 * @description A function to call when the server response has returned.
		 */
		callback: null,

		/**
		 * @field
		 * @name rishson.control.Request.callbackScope
		 * @type {Function}
		 * @description The scope in which to call the callback.
		 */
		callbackScope: null,

		/**
		 * @field
		 * @name rishson.control.Request.topic
		 * @type {string}
		 * @description The name of a topic to publish the response to when it has returned from the server.
		 */
		topic: null,

		/**
		 * @field
		 * @name rishson.control.Request.type
		 * @type {string}
		 * @description The type of the request, REST, WebService etc..
		 */
		type: null,

		/**
		 * @constructor
		 * @param {{callback: function|Object}} params Must contain either of the following:
		 *  callback {function} a function to call when a Response is returned from the server in response to this Request
		 *  callbackScope {Object} a scope in which to call the callback function
		 *  or
		 *  topic {string} the name of a topic to publish to when the server returns a response
		 */
		constructor: function (params) {
			//see if the request contains a callback
			var criteria = [],
				validator = new ObjectValidator(criteria);

			criteria.push({paramName: 'callback', paramType: 'function'});
			criteria.push({paramName: 'callbackScope', paramType: 'object'});

			if (validator.validate(params)) {
				lang.mixin(this, params);
			} else {
				//see if the request contains a topic
				criteria = [];
				criteria.push({paramName: 'topic', paramType: 'string'});
				validator = new ObjectValidator(criteria);

				if (validator.validate(params)) {
					lang.mixin(this, params);
				} else {
					validator.logErrorToConsole(params, 'Invalid Request construction.');
					throw ('Invalid Request construction.');
				}
			}
			this.params = [];
		},

		/**
		 * @function
		 * @name rishson.control.Request.toUrl
		 * @description Converts the <code>rishson.control.Request</code> derived class into a String representing a URL.
		 */
		toUrl: function () {
			throw ('toUrl must be implemented in derived classes');
		},

		/**
		 * @function
		 * @name rishson.control.Request.setParam
		 * @param {object} param params to set
		 * @description sets a param on the request
		 */
		setParam: function (param) {
			this.params.push(param);
		},

		/**
		 * @function
		 * @name rishson.control.Request.getParams
		 * @return {object} parameter object
		 * @description returns the params to be posted to the server
		 */
		getParams: function () {
			return this.params;
		}
	});
});