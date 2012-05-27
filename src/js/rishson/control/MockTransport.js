define([
	"dojo/io/script", // get
	"rishson/control/Response",
	"rishson/control/Transport",
	"rishson/util/ObjectValidator",
	"dojo/_base/declare", // declare
	"dojo/_base/lang", // mixin
	"dojo/_base/array", // indexOf
	"dojo/_base/xhr", // get, etc.
	"require" // context-sensitive require
], function (script, Response, Transport, ObjectValidator, declare, lang, arrayUtil, xhr, require) {

	/**
	 * @class
	 * @name rishson.control.MockTransport
	 * @description An implementation of <code>rishson.control.Transport</code> that mocks XHR calls to a server
	 * and returns canned data from a test directory instead
	 */
	return declare('rishson.control.MockTransport', Transport, {

		/**
		 * @field
		 * @name rishson.control.MockTransport.requestTimeout
		 * @type {number}
		 * @description the number of milliseconds that a <code>rishson.control.Request</code> can take before the call
		 * is aborted.
		 */
		requestTimeout: 5000, //defaults to 5 seconds

		/**
		 * @field
		 * @name rishson.control.MockTransport.namespace
		 * @type {string}
		 * @description Namespace where the test .
		 */
		namespace: '../tests/data/',

		/**
		 * @constructor
		 * @param {object} params
		 */
		constructor: function (params) {
			lang.mixin(this, params);
		},

		/**
		 * @function
		 * @name rishson.control.MockTransport.send
		 * @override Transport.send
		 * @param {rishson.control.Request} request to send to the server
		 * @description Issues the provided <code>rishson.control.Request</code> in an asynchronous manner
		 */
		send: function (request) {
			var testFuncName = 'processRequest', //name of the function to call on the TestMethod module
				self = this, //maintain self-reference for inside require callback
			/*get the full namespace of the module to provide the response
			 The namespace is in the form test.data.[typeOfResponse].[request.url]
			 e.g. for a service request:
			 test.data.serviceResponses.someService.SomeMethod
			 for a rest service:
			 test.data.restResponses.someService.SomeEndpoint
			 */
				namespace = this.namespace,
				indexOfClassName,
				testMethodClass,
				methodParams,
				mockResponse,
				wrappedResponse;

			if (request.declaredClass === 'rishson.control.ServiceRequest') {
				namespace += 'serviceResponses/' + request.toUrl();
			} else if (request.declaredClass === 'rishson.control.RestRequest') {
				namespace += 'restResponses/' + request.toUrl() + '/' + request.verb;
			} else {
				throw ('Unknown request type supplied: ' + request.declaredClass);
			}

			//capitalise the module name
			indexOfClassName = namespace.lastIndexOf('/') + 1;
			namespace = namespace.slice(0, indexOfClassName) +
				namespace.charAt(indexOfClassName).toUpperCase() + namespace.slice(indexOfClassName + 1);

			//get the TestModule
			require([namespace], function (TestModule) {
				testMethodClass = new TestModule(); //create an instance of the TestMethod class
				methodParams = self.createBasePostParams(request);
				mockResponse = testMethodClass[testFuncName](methodParams);	//call the test method

				if (request.type === 'rest') {
					wrappedResponse = new Response(mockResponse.payload, true, mockResponse.ioArgs);

					if (arrayUtil.indexOf(wrappedResponse.mappedStatusCodes, mockResponse.ioArgs.xhr.status) === -1) {
						self.handleErrorFunc(request, wrappedResponse);
					} else {
						self.handleResponseFunc(request, wrappedResponse);
					}
				} else {
					try {
						wrappedResponse = new Response(mockResponse, false, mockResponse.ioArgs);
						self.handleResponseFunc(request, wrappedResponse);
					} catch (err) {
						self.handleErrorFunc(request, wrappedResponse);
					}
				}
			});
		}
	});
});