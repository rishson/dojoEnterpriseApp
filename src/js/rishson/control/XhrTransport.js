define([
	"dojo/_base/declare", // declare
	"dojo/_base/lang", // mixin, hitch
	"dojo/_base/xhr", // get, put, post, delete
	"dojo/json", // stringify
	"rishson/control/Response", //constructor
	"rishson/control/Transport", //mixin
	"rishson/util/ObjectValidator", //validate
	"dojo/io/script"    //jsonp
], function (declare, lang, xhr, json, Response, Transport, ObjectValidator, script) {
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
		send: function (request, appId) {
			var xhrFunction = xhr.post, //default to post as this is used for service requests as well as rest
				xhrParams,
				jsonpCallback, // Callback to run if jsonp.
				url;

			//do autoincrement sendID if required
			//profiling can be enabled here

			//if an app is specified in the send, then get the application specific url
			if (appId) {
				url = this.apps[appId] + request.toUrl();
			} else {
				url = this.baseUrl + request.toUrl();
			}

			//Can't use 'then' in Dojo 1.6 if you need the ioArgs. See #12126 on dojo trac
			xhrParams = {
				url: url,
				handleAs: "json",
				headers: {'Content-Type': "application/json"}, //default to json for SOAP
				timeout: this.requestTimeout
			};

			//REST or SOAP call
			if (request.type !== 'jsonp') {
				xhrParams.load = lang.hitch(this, function (response, ioArgs) {
					var wrappedResponse = new Response(response,
						request.type === 'rest',
						ioArgs);
					this.handleResponseFunc(request, wrappedResponse);
				});
				xhrParams.error = lang.hitch(this, function (response, ioArgs) {
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
				});
				if (request.type === 'rest') {
					xhrFunction = xhr[request.verb]; // get, put, post, or delete
					switch (request.verb) {
					case 'put':
						xhrParams.putData = json.stringify(this.createBasePostParams(request));
						break;
					case 'post':
						xhrParams.putData = json.stringify(this.createBasePostParams(request));
						break;
					case 'get':
						xhrParams.headers["Content-Type"] = "text/html";
						break;
					case 'delete':
						xhrParams.headers["Content-Type"] = "text/html";
						break;
					}
				} else {
					xhrParams.content = json.stringify(this.createBasePostParams(request));  //for SOAP
				}
			} else {//JSONP call
				//to get round cross domain restrictions we use jsonp
				//note: jsonp does not support the regular verbs used in REST
				//@todo - we may need to write a clear up callback function after calling Window[jsonpCallback]
				//	to tidy up the global scope

				//assign io,script.get = jsonp method
				xhrFunction = function (xhrParams) {
					script.get(xhrParams);
				};

				//create a unique callback name in the Window (global space)
				//we need to make this in the global scope since jsonp needs to call a method visible in this scope
				jsonpCallback = 'callback' + new Date().getTime();

				//create the actual function
				window[jsonpCallback] = lang.hitch(this, function (response) {
					this.handleResponseFunc(request, response);
				});

				if (xhrParams.url.indexOf('?') !== -1) {
					xhrParams.url = xhrParams.url + '&callback=window.' + jsonpCallback;
				} else {
					xhrParams.url = xhrParams.url + '?callback=window.' + jsonpCallback;
				}
			}
			xhrFunction(xhrParams); //returns a deferred
		}
	});
});