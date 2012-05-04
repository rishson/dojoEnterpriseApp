define([
	"dojo/_base/declare", // declare
	"dojo/_base/lang", // mixin
	"dojo/_base/array", // forEach
	"dojo/cookie"
], function (declare, lang, arrayUtil, cookie) {

	/**
	 * @class
	 * @name rishson.control.Transport
	 * @description Interface - all Transport implementations must provide implementations for all of these functions
	 */
	return declare('rishson.control.Transport', null, {

		/**
		 * @field
		 * @name rishson.Transport.sidParamName
		 * @type {string}
		 * @description the name of the parameter to use for passing the CSRF mitigation token to the server
		 */
		sidParamName: 'sid',

		/**
		 * @field
		 * @name rishson.Transport._sessionId
		 * @type {string}
		 * @description Mitigate CSRF attacks using Double Cookie Submission technique
		 * Get the id of the current browser session from this domain's cookies
		 */
		_sessionId: cookie("JSESSIONID"),

		/**
		 * @field
		 * @name rishson.Transport.handleResponseFunc
		 * @type {function}
		 * @description this function will be called when the Transport implementation receives a valid server response
		 */
		handleResponseFunc: null,

		/**
		 * @field
		 * @name rishson.Transport.handleErrorFunc
		 * @type {function}
		 * @description this function will be called when the Transport implementation receives an error server response
		 */
		handleErrorFunc: null,

		/**
		 * @function
		 * @name rishson.Transport.addResponseFunctions
		 * @description adds response functions to the Transport.
		 * @param {function} responseFunc this function will be called to handle a valid response
		 * @param {function} errorFunc this function will be called to handle a response that contains an error
		 */
		addResponseFunctions: function (responseFunc, errorFunc) {
			this.handleResponseFunc = responseFunc;
			this.handleErrorFunc = errorFunc;
		},

		/**
		 * @function
		 * @name rishson.Transport.send
		 * @description Issues the provided <code>rishson.control.Request</code> in an asynchronous manner
		 * This function will call rishson.control.ControlLayer.handleError if an error occurred during the send.
		 * @param {rishson.control.Request} request to send to the server
		 */
		send: function (request) {
			console.error('Send must be implemented by derived Transport implementations.');
		},

		/**
		 * @function
		 * @name rishson.Transport.createBasePostParams
		 * @description Creates the basic POST params object, including all params from the Request and a security
		 * token from the browser sessionID to mitigate CSRF attacks
		 * @param {rishson.control.Request} request to send to the server
		 * @return {Object} simple map object with the basic set of POST params in tag : value format
		 */
		createBasePostParams: function (request) {
			var postContent = {},
				postParams = request.getParams() || {};	//allow for empty request content, e.g. a REST DELETE

			//if we have managed to resolve the current sessionId, then this can be used in double-cookie submission.
			if (this._sessionId) {
				postParams[this.sidParamName] = this._sessionId;    //add CSRF taken to all requests
			}

			//unwrap the param objects into a single object
			arrayUtil.forEach(postParams, function (param) {
				lang.mixin(postContent, param);
			});
			return postContent;
		}
	});

});