define([
	"dojo/_base/declare", // declare
	"dojo/_base/lang" // mixin
], function (declare, lang) {

	/**
	 * @class
	 * @name rishson.control.Response
	 * @description This class is used to wrap any server response.
	 */
	return declare('rishson.control.Response', null, {

		/**
		 * @field
		 * @name rishson.control.Request.isOk
		 * @type {boolean}
		 * @description is the response OK. This equates to HTTP status code 200.
		 */
		isOk: false,

		/**
		 * @field
		 * @name rishson.control.Request.isConflicted
		 * @type {boolean}
		 * @description is the response indicating a conflicted server state. This equates to HTTP status code 409.
		 */
		isConflicted: false,

		/**
		 * @field
		 * @name rishson.control.Request.isInvalid
		 * @type {boolean}
		 * @description is the response indicating that the request was invalid. This equates to HTTP status code 400.
		 * This is a bit of a judgement call. Technically this should probably be mapped to 403, section 10.4.4 of RFC 2119
		 * states that: "403 Forbidden The server understood the request, but is refusing to fulfill it. Authorization will
		 * not help and the request SHOULD NOT be repeated. If the request method was not HEAD and the server wishes to make
		 * public why the request has not been fulfilled, it SHOULD describe the reason for the refusal in the entity.
		 * If the server does not wish to make this    information available to the client, the status code 404 (Not Found)
		 * can be used instead."
		 * However, convention (O'Reiley RESTful Web Services) tends to map invalid to 400 (BAD REQUEST) rather than 403.
		 */
		isInvalid: false,

		/**
		 * @field
		 * @name rishson.control.Request.isUnauthorised
		 * @type {boolean}
		 * @description is the response indicating that the request was not authorised. This equates to HTTP status code 403.
		 */
		isUnauthorised: false,

		/**
		 * @field
		 * @name rishson.control.Request.payload
		 * @type {object}
		 * @description the contents of the server response.
		 */
		payload: null,


		/**
		 * @field
		 * @name rishson.control.Response.mappedStatusCodes
		 * @static
		 * @type {Array.<number>}
		 * @description The status codes that are handled in a rishson.control.Response.
		 */
		mappedStatusCodes: [200, 400, 403, 409],

		/**
		 * @constructor
		 * @param {Object} response the server response
		 * @param {boolean} wasRestRequest was the server request a REST request
		 * @param {Object} ioArgs the HTTP response header
		 */
		constructor: function (response, wasRestRequest, ioArgs) {

			//@todo remove {}&& prefix if added - should we be allowing comment-filtered anymore or is it an antipattern?
			if (wasRestRequest) {
				this._createFromRestResponse(response, ioArgs);
			} else {
				//service responses should not have a blank payload
				if (!response.payload) {
					console.error('Invalid server response. No payload.');
					throw ('Invalid server response. No payload.');
				}
				lang.mixin(this, response);
			}
		},

		/**
		 * @function
		 * @name rishson.control.Response._createFromRestResponse
		 * @param {Object} response
		 * @param {Object }ioArgs
		 * @private
		 */
		_createFromRestResponse: function (response, ioArgs) {

			switch (ioArgs.xhr.status) {
			case 200:
				this.isOk = true;
				break;
			case 400:
				this.isInvalid = true;
				break;
			case 403:
				this.isUnauthorised = true;
				break;
			case 409:
				this.isConflicted = true;
				break;
			}

			//if the rest response just has data in its body, then make it a payload. If a payload is specified in the
			//response already then just add to this class.
			if (response) {
				this.payload = response.payload || response;
			}
		}

	});
});