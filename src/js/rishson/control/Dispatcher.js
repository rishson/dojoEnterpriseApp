define([
	"rishson/Globals",
	"rishson/util/ObjectValidator",	//validate
	"dojo/_base/lang", // mixin, hitch
	"dojo/_base/array", // indexOf, forEach
	"dojo/_base/declare", // declare
	"dojo/topic", // publish/subscribe
	"dojox/rpc/Service"	//constructor
], function (Globals, ObjectValidator, lang, arrayUtil, declare, topic, Service) {

	/**
	 * @class
	 * @name rishson.control.Dispatcher
	 * @description This class is the conduit for all client server communication.
	 */
	return declare('rishson.control.Dispatcher', null, {

		/**
		 * @field
		 * @name rishson.control.Dispatcher.transport
		 * @type {rishson.control.Transport}
		 * @description an implementation of rishson.control.Transport
		 */
		transport: null,

		/**
		 * @field
		 * @name rishson.control.Dispatcher.serviceRegistry
		 * @type {Array}
		 * @description an array of dojox.RpcService(s). This is populated from a list of SMD definitions
		 */
		serviceRegistry: null,

		/**
		 * @field
		 * @name rishson.control.Dispatcher.grantedAuthorities
		 * @type {Array}
		 * @description an array of permission to grant to the currently logged on user. Permissions will be coerced to
		 * lower case.
		 */
		grantedAuthorities: null,

		/**
		 * @field
		 * @name rishson.control.Dispatcher.returnRequest
		 * @type {boolean}
		 * @description should the Request be returned to the callee when a Response is created
		 */
		returnRequest: false,

		/**
		 * @field
		 * @name rishson.control.Dispatcher._topicNamespace
		 * @type {string}
		 * @private
		 * @description This namespace is prepended to every topic
		 */
		_topicNamespace: Globals.TOPIC_NAMESPACE,

		/**
		 * @constructor
		 * @param {rishson.control.Transport} transport an implementation of rishson.control.Transport
		 * @param {rishson.control.LoginResponse} validLoginResponse object of bootstrap properties
		 */
		constructor: function (transport, validLoginResponse) {
			var criteria = [
					{paramName: 'transport', paramType: 'object'}//,
					// TODO: validLoginResponse should be moved from here due to dispatcher firing validLoginResponse is set.
					//{paramName: 'validLoginResponse', paramType: 'object', moduleName: 'rishson.control.LoginResponse'}
				],
				validator = new ObjectValidator(criteria),
				params = {'transport': transport, 'validLoginResponse': validLoginResponse},
				unwrappedParams,
				index;

			//collect up the params and validate
			if (validator.validate(params)) {
				//unwrap the object contents for validation and to do a mixin
				unwrappedParams = {'transport': transport,
					'serviceRegistry': validLoginResponse.serviceRegistry,
					'grantedAuthorities': validLoginResponse.grantedAuthorities};

				lang.mixin(this, unwrappedParams);

				//this is optional so should not be included in the criteria validation
				if (validLoginResponse.returnRequest) {
					this.returnRequest = true;
				}

				//convert authorities to lower case so we can do case-insensitive search for authorities
				arrayUtil.forEach(this.grantedAuthorities, function (authority) {
					if (lang.isString(authority)) {
						authority = authority.toLowerCase();
					} else {
						//remove invalid permissions that are not strings
						console.error("Invalid authority passed to Dispatcher: " + authority);
						index = arrayUtil.indexOf(authority);
						this.grantedAuthorities.splice(index, 1);
					}
				}, this);

				//decorate the transport with the response and error handling functions in this class (need hitching)
				this.transport.addResponseFunctions(lang.hitch(this, this.handleResponse),
					lang.hitch(this, this.handleError));

				//listen out for other classes wanting to send requests to the server
				topic.subscribe(Globals.SEND_REQUEST, lang.hitch(this, "send"));
			} else {
				validator.logErrorToConsole(params, 'Invalid params passed to the Dispatcher.');
				throw ('Invalid params passed to the Controller.');
			}
		},

		/**
		 * @function
		 * @name rishson.control.Dispatcher.send
		 * @param {rishson.control.Request} request to send to the server
		 * @param {string} appId the id of an application making the request - optional
		 * @description Issues the provided <code>rishson.control.Request</code> in an asynchronous manner
		 * This function delegates the actual sending of the Request to the injected Transport implementation.
		 * rishson.control.Dispatcher.handleRequest will be called for valid responses.
		 * rishson.control.Dispatcher.handleError will be called if an error occurred during the send.
		 */
		send: function (request, appId) {
			this.transport.send(request, appId);
			//auditing, analytics etc can be enabled here
		},

		/**
		 * @function
		 * @name rishson.control.Dispatcher.handleResponse
		 * @param {Object} request an object that is the original request to the server
		 * @param {rishson.control.Response} response an object that is the server response
		 * @description Handles a valid response from a transport.
		 */
		handleResponse: function (request, response) {
			var scopedCallback,
				topicData,
				apps;

			// If the response object has apps, grantedAuthorities and username then it is the loginResponse Object
			// TODO: not sure if this should look for payload in this way. It is pretty horrific.
			if (response.payload && response.payload.apps && response.payload.grantedAuthorities && response.payload.username) {
				apps = this._setupApplicationUrls(response.payload.apps);
				this.transport.bindApplicationUrls(apps);
			}

			//if the request has a topic specified then publish the response to the topic
			if (request.topic) {
				topicData = [request.topic, response];
				//return the original request along with the response if required
				if (this.returnRequest) {
					topicData.push(request);
				}
				//dojo/topic's publish doesn't take an array, so send arguments in series
				topic.publish.apply(topic, topicData);
			} else {
				//call the request's provided callback with the response - but hitch it's scope first if needs be
				if (request.callbackScope) {
					scopedCallback = lang.hitch(request.callbackScope, request.callback);
				} else {
					scopedCallback = request.callback;  //if no scope is specified then assume the callback must already be scoped
				}

				//return the original request along with the response if required
				if (this.returnRequest) {
					scopedCallback(response, request);
				} else {
					scopedCallback(response);
				}
			}
		},

		/**
		 * @function
		 * @name rishson.control.Dispatcher.handleError
		 * @param {Object} request an object that is the original reuest to the server
		 * @param {Object} err an object that is the server error response
		 * @description Handles an unexpected (runtime) error response from a transport.
		 */
		handleError: function (request, err) {
			//our generic error handling code goes here
			//if required, dump analytics to server
			//send error to console - might need to remove sensitive data
			throw "Error occured during server call: " + err;
			//raise error as event
		},

		/**
		 * @function
		 * @name rishson.control.Dispatcher.hasGrantedAuthority
		 * @description Checks to see if a user has a granted authority
		 */
		hasGrantedAuthority: function (authority) {
			return arrayUtil.indexOf(this.grantedAuthorities, authority.toLowerCase()) >= 0;
		},

		/**
		 * @function
		 * @private
		 * @name rishson.control.Dispatcher._instantiateServiceRegistry
		 * @description convert all the given SMDs into dojox.rpc.Service instances.
		 */
		_instantiateServiceRegistry: function () {
			var serviceArr = [];
			arrayUtil.forEach(this.serviceRegistry, function (SMD) {
				try {
					serviceArr.push(new Service(SMD));
				} catch (e) {
					console.error("Invalid SMD definition: " + SMD);
				}
			}, this);
			this.serviceRegistry = serviceArr;	//swap in the service registry
		},

		/**
		 * @function
		 * @private
		 * @name rishson.control.Dispatcher._validateServices
		 * @description Call the validation function for all services.
		 * Each service should have a pre-defined test function (__validate) that can be called to validate that the service is up.
		 */
		_validateServices: function () {
			arrayUtil.forEach(this.serviceRegistry, function (service) {
				try {
					//call the test function
					//service.__validate();
				} catch (e) {
					console.error("Invalid SMD definition: " + service);
				}
			}, this);
			//this.serviceRegistry = serviceArr;	//swap in the service registry
		},

		/**
		 * @function
		 * @name rishson.control.Dispatcher._setupApplicationUrls
		 * @description Subscribe to request/send events for child applications from loginResponse.
		 * @param {object} apps a list of application objects
		 * @return {object} the list of apps with all but the name and baseUrl removed
		 * @private
		 */
		_setupApplicationUrls: function (apps) {
			var i = 0,
				l = apps.length,
				topicPrefix = '/request/send',
				appId,
				url,
				appObj = {};

			for  (i; i < l; i += 1) {
				appId = apps[i].id;
				//create a tag value entry on the appObj where the key is the application id and the value the baseUrl
				appObj[appId] = apps[i].baseUrl;
				url = '/' + appId + topicPrefix;
				topic.subscribe(url, lang.hitch(this, function _send (appId, request) {
					this.send(request, appId);
				}, appId));
			}
			return appObj;
		}
	});
});