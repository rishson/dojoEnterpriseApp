define([
	"dojo/_base/declare", // declare
	"dojo/_base/lang", // mixin, hitch
	"dojo/_base/xhr", // get, put, post, delete
	"dojo/json", // stringify
	"rishson/control/Response",
	"rishson/control/Transport",
	"rishson/util/ObjectValidator"
], function (declare, lang, xhr, json, Response, Transport, ObjectValidator) {

	/**
	 * @class
	 * @name rishson.control.XhrTransport
	 * @description An implementation of <code>rishson.control.Transport</code> that uses XHR calls to a server
	 */
	return declare('rishson.control.XhrTransport', Transport, {

		/**
		 * @field
		 * @name rishson.control.XhrTransport.baseUrl
		 * @type {string}
		 * @description a URL that usually specifies the domain and a global context, e.g. http://www.mydomain.com:myport/mycontext
		 */
		baseUrl: null,

		/**
		 * @field
		 * @name rishson.control.XhrTransport.requestTimeout
		 * @type {number}
		 * @description the number of milliseconds that a <code>rishson.control.Request</code> can take before the call is aborted.
		 */
		requestTimeout: 5000, //defaults to 5 seconds


		/**
		 * @constructor
		 * @param {{baseUrl: string}} params Must contain the following:
		 * baseUrl {string} root and context of the web application. e.g. http://www.mydomain.com:myport/mycontext
		 */
		constructor: function (params) {
			var criteria = [
					{paramName: 'baseUrl', paramType: 'string'}
				],
				validator = new ObjectValidator(criteria);

			if (validator.validate(params)) {
				lang.mixin(this, params);
			} else {
				validator.logErrorToConsole(params, 'Invalid XhrTransport construction.');
				throw ('Invalid XhrTransport construction.');
			}
		},

		/**
		 * @function
		 * @name rishson.control.XhrTransport.send
		 * @override Transport.send
		 * @param {rishson.control.Request} request to send to the server
		 * @description Issues the provided <code>rishson.control.Request</code> in an asynchronous manner
		 */
		send: function (request) {
			var postParams = json.stringify(this.createBasePostParams(request)),
				xhrFunction, //default to post as this is used for service requests as well as rest
				xhrParams;

			//do autoincrement sendID if required
			//profiling can be enabled here

			//Can't use 'then' in Dojo 1.6 if you need the ioArgs. See #12126 on dojo trac
			xhrParams = {
				url: this.baseUrl + request.toUrl(),
				content: postParams,
				handleAs: "json",
				headers: {'Content-Type': "application/json"},
				timeout: this.requestTimeout,
				load: lang.hitch(this, function (response, ioArgs) {
					var wrappedResponse = new Response(response,
						request.type === 'rest',
						ioArgs);
					this.handleResponseFunc(request, wrappedResponse);
				}),
				error: function (response, ioArgs) {
					var wrappedResponse = new Response(response,
						request.type === 'rest',
						ioArgs);
					//do we think that this 'error' is a valid response, e.g. a 400 REST response?
					if (wrappedResponse.mappedStatusCodes.indexOf(ioArgs.xhr.status) > -1) {
						this.handleResponseFunc(request, wrappedResponse);
					} else {
						/* Unhandled error - something went wrong in the XHR request/response that we dont cope with.
						 * This can happen for a timeout or an unhandled status code.
						 * It's OK to send the error to the console as this does not pose a security risk.
						 * The failure is freely available using http traffic monitoring so we are not 'leaking' information
						 */
						console.error(response);
						this.handleErrorFunc(request, response);
						//you could do further processing such as put the transport in a retry or quiescent state
					}
				}
			};

			if (request.type === 'rest') {
				xhrFunction = xhr[request.verb]; // get, put, post, or delete
				if (request.verb === 'put') {
					xhrParams.putData = postParams;
					delete (xhrParams.content);
				} else if (request.verb === 'post') {
					xhrParams.postData = postParams;
					delete (xhrParams.content);
				}
			}
			xhrFunction(xhrParams); //returns a deferred
		}
	});
});