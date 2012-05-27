define([
	"doh",
	"dojo/_base/lang",
	"dojo/topic",
	"dojo/cookie",
	"rishson/tests/Scaffold",
	"rishson/control/Dispatcher",
	"rishson/control/MockTransport",
	"rishson/control/Request",
	"rishson/control/ServiceRequest",
	"rishson/control/RestRequest"
], function (doh, lang, topic, cookie, Scaffold, Dispatcher, MockTransport, Request, ServiceRequest, RestRequest) {

	doh.register("Dispatcher tests", [
		{
			name: "Dispatcher tests",
			setUp: function () {
				cookie("JSESSIONID", '1234567890');
				//control layer initialisation - create a valid Transport implementation
				mockTransport = new MockTransport();
				validRequest = {
					callback: function () {}, //needs to be a function
					callbackScope: this, //needs to be an object
					service: 'hello', //needs to be a string
					method: 'world'    //needs to be a string
				};
				validLoginResponse = {
					returnRequest: true,
					serviceRegistry: [],
					grantedAuthorities: []
				};
			},
			runTest: function () {
				var constructorFailed = false;
				try {
					//invalid construction - no params passed to constructor
					var dispatcher = new Dispatcher();
				} catch (e) {
					constructorFailed = true;
				}
				doh.assertTrue(constructorFailed);
				constructorFailed = false;

				try {
					//invalid construction - transport is null
					dispatcher = new Dispatcher(null, validLoginResponse);
				} catch (e) {
					constructorFailed = true;
				}
				doh.assertTrue(constructorFailed);
				constructorFailed = false;

				try {
					//invalid construction - validLoginResponse is null
					dispatcher = new Dispatcher(mockTransport, null);
				} catch (e) {
					constructorFailed = true;
				}
				doh.assertTrue(constructorFailed);
				constructorFailed = false;

				try {
					//invalid construction - validLoginResponse is not populated
					dispatcher = new Dispatcher(mockTransport, {});
				} catch (e) {
					constructorFailed = true;
				}
				doh.assertTrue(constructorFailed);
				constructorFailed = false;

				try {
					//invalid construction - validLoginResponse.grantedAuthorities is null
					dispatcher = Dispatcher(mockTransport, {returnRequest: false,
						serviceRegistry: [],
						grantedAuthorities: null});
				} catch (e) {
					constructorFailed = true;
				}
				doh.assertTrue(constructorFailed);
				constructorFailed = false;

				try {
					//invalid construction - validLoginResponse.serviceRegistry is null
					dispatcher = new Dispatcher(mockTransport, {returnRequest: false,
						serviceRegistry: null,
						grantedAuthorities: []});
				} catch (e) {
					constructorFailed = true;
				}
				doh.assertTrue(constructorFailed);
				constructorFailed = false;

				try {
					//invalid construction - misnamed param in the loginResponse 'returnFred'
					dispatcher = new Dispatcher(mockTransport, {returnFred: false,
						serviceRegistry: null,
						grantedAuthorities: []});
				} catch (e) {
					constructorFailed = true;
				}
				doh.assertTrue(constructorFailed);
				constructorFailed = false;

				try {
					//valid construction - validLoginResponse.logoutRequest is null and is optional
					dispatcher = new Dispatcher(mockTransport, {serviceRegistry: [],
						grantedAuthorities: []});
				} catch (e) {
					constructorFailed = true;
				}
				doh.assertFalse(constructorFailed);
				constructorFailed = false;

				//valid construction
				try{
					dispatcher = new Dispatcher(mockTransport, validLoginResponse);
				} catch (e) {
					constructorFailed = true;
				}
				doh.assertFalse(constructorFailed);	//the constructor should have run successfully

				//check that the transport has been decorated with handler functions
				//for some reason the compare on the hitched function does not work so will need to compare the results
				//the functions
				//doh.assertEqual(lang.hitch(dispatcher, dispatcher.handleResponse), mockTransport.handleResponseFunc);
				//doh.assertEqual(lang.hitch(dispatcher, dispatcher.handleError), mockTransport.handleErrorFunc);
			},
			tearDown: function () {
			}
		},
		{
			name: "Web service request tests",
			setUp: function () {
				//control layer initialisation
				var scaffold = new Scaffold();
				dispatcher = scaffold.createDispatcher();

				myCallback = function (response, request) {
					console.group("Data received in callback");
					console.debug(response);
					console.groupEnd();
					doh.assertTrue(response.payload.testData === 'someValue');
					doh.assertTrue(response.isOk);
					if (!request) {
						doh.assertTrue(false, "Request not returned in callback");
					}
				};
			},
			runTest: function () {
				try {
					//example of a valid WebService call to call a method specifically designed to test a dispatcher
					var someServiceCall = new ServiceRequest({service: 'testService',
						method: 'dispatcherTestMethod',
						params: [
							{testData: 'someValue', status: 200}
						],
						callback: myCallback,
						callbackScope: this});

					dispatcher.send(someServiceCall);
				}
				catch (e) {
					doh.assertTrue(false, 'Unexpected error occurred sending callback based ServiceRequest for 200'); //we should not be here
					console.debug(e);
				}

				//test the use of topics instead of callbacks for the response handling
				try {
					//example of a valid WebService call to call a method specifically designed to test a dispatcher
					someServiceCall = new ServiceRequest({service: 'testService',
						method: 'dispatcherTestMethod',
						params: [
							{testData: 'someValue', status: 200}
						],
						topic: '/test/dispatcher/service/200'});

					topic.subscribe('/test/dispatcher/service/200', function (response, request) {
						console.group("Data received in topic");
						console.debug(response);
						console.groupEnd();
						doh.assertTrue(response.payload.testData === 'someValue');
						doh.assertTrue(response.isOk);
						doh.assertFalse(response.isInvalid);
						doh.assertFalse(response.isUnauthorised);
						doh.assertFalse(response.isConflicted);
						if (!request) {
							doh.assertTrue(false, "Request not returned in callback");
						}
					});
					dispatcher.send(someServiceCall);
				}
				catch (e) {
					doh.assertTrue(false, 'Unexpected error occurred sending topic based ServiceRequest for 200'); //we should not be here
				}

				try {
					//example of a valid WebService call to call a method specifically designed to test a dispatcher
					someServiceCall = new ServiceRequest({service: 'testService',
						method: 'dispatcherTestMethod',
						params: [
							{testData: 'someValue', status: 400}
						],
						topic: '/test/dispatcher/service/400'});

					topic.subscribe('/test/dispatcher/service/400', function (response, request) {
						console.group("Data received in topic");
						console.debug(response);
						console.groupEnd();
						doh.assertTrue(response.payload.testData === 'someValue');
						doh.assertFalse(response.isOk);
						doh.assertTrue(response.isInvalid);
						doh.assertFalse(response.isUnauthorised);
						doh.assertFalse(response.isConflicted);
						if (!request) {
							doh.assertTrue(false, "Request not returned in callback");
						}
					});
					dispatcher.send(someServiceCall);
				}
				catch (e) {
					doh.assertTrue(false, 'Unexpected error occurred sending topic based ServiceRequest for 400'); //we should not be here
				}

				try {
					//example of a valid WebService call to call a method specifically designed to test a dispatcher
					someServiceCall = new ServiceRequest({service: 'testService',
						method: 'dispatcherTestMethod',
						params: [
							{testData: 'someValue', status: 403}
						],
						topic: '/test/dispatcher/service/403'});

					topic.subscribe('/test/dispatcher/service/403', function (response, request) {
						console.group("Data received in topic");
						console.debug(response);
						console.groupEnd();
						doh.assertTrue(response.payload.testData === 'someValue');
						doh.assertFalse(response.isOk);
						doh.assertFalse(response.isInvalid);
						doh.assertTrue(response.isUnauthorised);
						doh.assertFalse(response.isConflicted);
						if (!request) {
							doh.assertTrue(false, "Request not returned in callback");
						}
					});
					dispatcher.send(someServiceCall);
				}
				catch (e) {
					doh.assertTrue(false, 'Unexpected error occurred sending topic based ServiceRequest for 403'); //we should not be here
				}

				try {
					//example of a valid WebService call to call a method specifically designed to test a dispatcher
					someServiceCall = new ServiceRequest({service: 'testService',
						method: 'dispatcherTestMethod',
						params: [
							{testData: 'someValue', status: 409}
						],
						topic: '/test/dispatcher/service/409'});

					topic.subscribe('/test/dispatcher/service/409', function (response, request) {
						console.group("Data received in topic");
						console.debug(response);
						console.groupEnd();
						doh.assertTrue(response.payload.testData === 'someValue');
						doh.assertFalse(response.isOk);
						doh.assertFalse(response.isInvalid);
						doh.assertFalse(response.isUnauthorised);
						doh.assertTrue(response.isConflicted);
						if (!request) {
							doh.assertTrue(false, "Request not returned in callback");
						}
					});
					dispatcher.send(someServiceCall);
				}
				catch (e) {
					doh.assertTrue(false, 'Unexpected error occurred sending topic based ServiceRequest for 409'); //we should not be here
				}

				try {
					//example of a valid WebService call to call a method specifically designed to test a dispatcher
					someServiceCall = new ServiceRequest({service: 'testService',
						method: 'dispatcherTestMethod',
						params: [
							{testData: 'someValue', status: 123}
						],
						topic: '/test/dispatcher/service/123'});

					dispatcher.send(someServiceCall);
				}
				catch (e) {
					var shouldErrorOn123Service = true;
				}
				doh.assertTrue(shouldErrorOn123Service, "Unexpected acceptance of status 123 for Service response.");
			},
			tearDown: function () {
			}
		},
		{
			name: "Rest service GET tests",
			setUp: function () {
				//control layer initialisation
				var scaffold = new Scaffold();
				dispatcher = scaffold.createDispatcher();

				myCallback = function (response) {
					console.group("Data received in callback");
					console.debug(response);
					console.groupEnd();
					doh.assertTrue(response.payload.testData === 'someValue');
					doh.assertTrue(response.isOk);
				};
			},
			runTest: function () {
				try {
					//example of a valid rest call to call a method specifically designed to test a dispatcher
					var someServiceCall = new RestRequest({service: 'testService',
						verb: 'get',
						params: [
							{testData: 'someValue', status: 200}
						],
						callback: myCallback,
						callbackScope: this});

					dispatcher.send(someServiceCall);
				}
				catch (e) {
					doh.assertTrue(false, 'Unexpected error occurred sending callback based RestRequest for GET'); //we should not be here
				}

				//test the use of topics instead of callbacks for the response handling
				try {
					//example of a valid rest call to call a method specifically designed to test a dispatcher
					someServiceCall = new RestRequest({service: 'testService',
						verb: 'get',
						params: [
							{testData: 'someValue', status: 200}
						],
						topic: '/test/dispatcher/200'});

					topic.subscribe('/test/dispatcher/200', function (response, request) {
						console.group("Data received in topic");
						console.debug(response);
						console.groupEnd();
						doh.assertTrue(response.payload.testData === 'someValue');
						doh.assertTrue(response.isOk);
						doh.assertEqual(someServiceCall, request);	//check that the request is passed back unmodified
					});
					dispatcher.send(someServiceCall);
				}
				catch (e) {
					doh.assertTrue(false, 'Unexpected error occurred sending topic based RestRequest for GET'); //we should not be here
				}

				try {
					//example of a valid rest call to call a method specifically designed to test a dispatcher
					someServiceCall = new RestRequest({service: 'testService',
						verb: 'get',
						params: [
							{testData: 'someValue', status: 123}
						],
						topic: '/test/dispatcher/123'});

					dispatcher.send(someServiceCall);
				}
				catch (e) {
					var shouldErrorOn123 = true;
				}
				doh.assertTrue(shouldErrorOn123, "Unexpected acceptance of status 123 for REST response for GET");

				try {
					//example of a valid rest call to call a method specifically designed to test a dispatcher
					someServiceCall = new RestRequest({service: 'testService',
						verb: 'get',
						params: [
							{testData: 'someValue', status: 400}
						],
						topic: '/test/dispatcher/400'});

					topic.subscribe('/test/dispatcher/400', function (response) {
						console.group("Data received in topic");
						console.debug(response);
						console.groupEnd();
						doh.assertTrue(response.payload.testData === 'someValue');
						doh.assertFalse(response.isOk);
						doh.assertTrue(response.isInvalid);
						doh.assertFalse(response.isUnauthorised);
						doh.assertFalse(response.isConflicted);
					});
					dispatcher.send(someServiceCall);
				}
				catch (e) {
					doh.assertTrue(false, 'Unexpected error testing 400 status for GET'); //we should not be here
				}

				try {
					//example of a valid rest call to call a method specifically designed to test a dispatcher
					someServiceCall = new RestRequest({service: 'testService',
						verb: 'get',
						params: [
							{testData: 'someValue', status: 403}
						],
						topic: '/test/dispatcher/403'});

					topic.subscribe('/test/dispatcher/403', function (response) {
						console.group("Data received in topic");
						console.debug(response);
						console.groupEnd();
						doh.assertTrue(response.payload.testData === 'someValue');
						doh.assertFalse(response.isOk);
						doh.assertFalse(response.isInvalid);
						doh.assertTrue(response.isUnauthorised);
						doh.assertFalse(response.isConflicted);
					});
					dispatcher.send(someServiceCall);
				}
				catch (e) {
					doh.assertTrue(false, 'Unexpected error testing 403 status for GET'); //we should not be here
				}

				try {
					//example of a valid rest call to call a method specifically designed to test a dispatcher
					someServiceCall = new RestRequest({service: 'testService',
						verb: 'get',
						params: [
							{testData: 'someValue', status: 409}
						],
						topic: '/test/dispatcher/409'});

					topic.subscribe('/test/dispatcher/409', function (response) {
						console.group("Data received in topic");
						console.debug(response);
						console.groupEnd();
						doh.assertTrue(response.payload.testData === 'someValue');
						doh.assertFalse(response.isOk);
						doh.assertFalse(response.isInvalid);
						doh.assertFalse(response.isUnauthorised);
						doh.assertTrue(response.isConflicted);
					});
					dispatcher.send(someServiceCall);
				}
				catch (e) {
					doh.assertTrue(false, 'Unexpected error testing 409 status for GET'); //we should not be here
				}
			},
			tearDown: function () {
			}
		},
		{
			name: "Rest service DELETE tests",
			setUp: function () {
				//control layer initialisation
				var scaffold = new Scaffold();
				dispatcher = scaffold.createDispatcher();

				myCallback = function (response) {
					console.group("Data received in callback");
					console.debug(response);
					console.groupEnd();
					doh.assertFalse(response.payload);
					doh.assertTrue(response.isOk);
				};
			},
			runTest: function () {
				try {
					//example of a valid rest call to call a method specifically designed to test a dispatcher
					var someServiceCall = new RestRequest({service: 'testService',
						verb: 'delete',
						params: [
							{testData: 'someValue', status: 200}
						],
						callback: myCallback,
						callbackScope: this});

					dispatcher.send(someServiceCall);
				}
				catch (e) {
					doh.assertTrue(false, 'Unexpected error occurred sending callback based RestRequest for DELETE'); //we should not be here
				}

				//test the use of topics instead of callbacks for the response handling
				try {
					//example of a valid rest call to call a method specifically designed to test a dispatcher
					someServiceCall = new RestRequest({service: 'testService',
						verb: 'delete',
						params: [
							{testData: 'someValue', status: 200}
						],
						topic: '/test/dispatcher/delete/200'});

					topic.subscribe('/test/dispatcher/delete/200', function (response, request) {
						console.group("Data received in topic");
						console.debug(response);
						console.groupEnd();
						doh.assertFalse(response.payload);
						doh.assertTrue(response.isOk);
						doh.assertEqual(someServiceCall, request);	//check that the request is passed back unmodified
					});
					dispatcher.send(someServiceCall);
				}
				catch (e) {
					doh.assertTrue(false, 'Unexpected error occurred sending topic based RestRequest for DELETE'); //we should not be here
				}

				try {
					//example of a valid rest call to call a method specifically designed to test a dispatcher
					someServiceCall = new RestRequest({service: 'testService',
						verb: 'delete',
						params: [
							{testData: 'someValue', status: 123}
						],
						topic: '/test/dispatcher/delete/123'});

					dispatcher.send(someServiceCall);
				}
				catch (e) {
					var shouldErrorOn123 = true;
				}
				doh.assertTrue(shouldErrorOn123, "Unexpected acceptance of status 123 for REST response for DELETE");

				try {
					//example of a valid rest call to call a method specifically designed to test a dispatcher
					someServiceCall = new RestRequest({service: 'testService',
						verb: 'delete',
						params: [
							{testData: 'someValue', status: 400}
						],
						topic: '/test/dispatcher/delete/400'});

					topic.subscribe('/test/dispatcher/delete/400', function (response) {
						console.group("Data received in topic");
						console.debug(response);
						console.groupEnd();
						doh.assertFalse(response.payload);
						doh.assertFalse(response.isOk);
						doh.assertTrue(response.isInvalid);
						doh.assertFalse(response.isUnauthorised);
						doh.assertFalse(response.isConflicted);
					});
					dispatcher.send(someServiceCall);
				}
				catch (e) {
					doh.assertTrue(false, 'Unexpected error testing 400 status for DELETE'); //we should not be here
				}

				try {
					//example of a valid rest call to call a method specifically designed to test a dispatcher
					someServiceCall = new RestRequest({service: 'testService',
						verb: 'delete',
						params: [
							{testData: 'someValue', status: 403}
						],
						topic: '/test/dispatcher/delete/403'});

					topic.subscribe('/test/dispatcher/delete/403', function (response) {
						console.group("Data received in topic");
						console.debug(response);
						console.groupEnd();
						doh.assertFalse(response.payload);
						doh.assertFalse(response.isOk);
						doh.assertFalse(response.isInvalid);
						doh.assertTrue(response.isUnauthorised);
						doh.assertFalse(response.isConflicted);
					});
					dispatcher.send(someServiceCall);
				}
				catch (e) {
					doh.assertTrue(false, 'Unexpected error testing 403 status for DELETE'); //we should not be here
				}

				try {
					//example of a valid rest call to call a method specifically designed to test a dispatcher
					someServiceCall = new RestRequest({service: 'testService',
						verb: 'delete',
						params: [
							{testData: 'someValue', status: 409}
						],
						topic: '/test/dispatcher/delete/409'});

					topic.subscribe('/test/dispatcher/delete/409', function (response) {
						console.group("Data received in topic");
						console.debug(response);
						console.groupEnd();
						doh.assertFalse(response.payload);
						doh.assertFalse(response.isOk);
						doh.assertFalse(response.isInvalid);
						doh.assertFalse(response.isUnauthorised);
						doh.assertTrue(response.isConflicted);
					});
					dispatcher.send(someServiceCall);
				}
				catch (e) {
					doh.assertTrue(false, 'Unexpected error testing 409 status for DELETE'); //we should not be here
				}
			},
			tearDown: function () {
			}
		},
		{
			name: "Rest service PUT tests",
			setUp: function () {
				//control layer initialisation
				var scaffold = new Scaffold();
				dispatcher = scaffold.createDispatcher();

				myCallback = function (response) {
					console.group("Data received in callback");
					console.debug(response);
					console.groupEnd();
					doh.assertFalse(response.payload);
					doh.assertTrue(response.isOk);
				};
			},
			runTest: function () {
				try {
					//example of a valid rest call to call a method specifically designed to test a dispatcher
					var someServiceCall = new RestRequest({service: 'testService',
						verb: 'put',
						params: [
							{testData: 'someValue', status: 200}
						],
						callback: myCallback,
						callbackScope: this});

					dispatcher.send(someServiceCall);
				}
				catch (e) {
					doh.assertTrue(false, 'Unexpected error occurred sending callback based RestRequest for PUT'); //we should not be here
				}

				//test the use of topics instead of callbacks for the response handling
				try {
					//example of a valid rest call to call a method specifically designed to test a dispatcher
					someServiceCall = new RestRequest({service: 'testService',
						verb: 'put',
						params: [
							{testData: 'someValue', status: 200}
						],
						topic: '/test/dispatcher/put/200'});

					topic.subscribe('/test/dispatcher/put/200', function (response, request) {
						console.group("Data received in topic");
						console.debug(response);
						console.groupEnd();
						doh.assertFalse(response.payload);
						doh.assertTrue(response.isOk);
						doh.assertEqual(someServiceCall, request);	//check that the request is passed back unmodified
					});
					dispatcher.send(someServiceCall);
				}
				catch (e) {
					doh.assertTrue(false, 'Unexpected error occurred sending topic based RestRequest for PUT'); //we should not be here
				}

				try {
					//example of a valid rest call to call a method specifically designed to test a dispatcher
					someServiceCall = new RestRequest({service: 'testService',
						verb: 'put',
						params: [
							{testData: 'someValue', status: 123}
						],
						topic: '/test/dispatcher/put/123'});

					dispatcher.send(someServiceCall);
				}
				catch (e) {
					var shouldErrorOn123 = true;
				}
				doh.assertTrue(shouldErrorOn123, "Unexpected acceptance of status 123 for REST response for PUT");

				try {
					//example of a valid rest call to call a method specifically designed to test a dispatcher
					someServiceCall = new RestRequest({service: 'testService',
						verb: 'put',
						params: [
							{testData: 'someValue', status: 400}
						],
						topic: '/test/dispatcher/put/400'});

					topic.subscribe('/test/dispatcher/put/400', function (response) {
						console.group("Data received in topic");
						console.debug(response);
						console.groupEnd();
						doh.assertFalse(response.payload);
						doh.assertFalse(response.isOk);
						doh.assertTrue(response.isInvalid);
						doh.assertFalse(response.isUnauthorised);
						doh.assertFalse(response.isConflicted);
					});
					dispatcher.send(someServiceCall);
				}
				catch (e) {
					doh.assertTrue(false, 'Unexpected error testing 400 status for PUT'); //we should not be here
				}

				try {
					//example of a valid rest call to call a method specifically designed to test a dispatcher
					someServiceCall = new RestRequest({service: 'testService',
						verb: 'put',
						params: [
							{testData: 'someValue', status: 403}
						],
						topic: '/test/dispatcher/put/403'});

					topic.subscribe('/test/dispatcher/put/403', function (response) {
						console.group("Data received in topic");
						console.debug(response);
						console.groupEnd();
						doh.assertFalse(response.payload);
						doh.assertFalse(response.isOk);
						doh.assertFalse(response.isInvalid);
						doh.assertTrue(response.isUnauthorised);
						doh.assertFalse(response.isConflicted);
					});
					dispatcher.send(someServiceCall);
				}
				catch (e) {
					doh.assertTrue(false, 'Unexpected error testing 403 status for PUT'); //we should not be here
				}

				try {
					//example of a valid rest call to call a method specifically designed to test a dispatcher
					someServiceCall = new RestRequest({service: 'testService',
						verb: 'put',
						params: [
							{testData: 'someValue', status: 409}
						],
						topic: '/test/dispatcher/put/409'});

					topic.subscribe('/test/dispatcher/put/409', function (response) {
						console.group("Data received in topic");
						console.debug(response);
						console.groupEnd();
						doh.assertFalse(response.payload);
						doh.assertFalse(response.isOk);
						doh.assertFalse(response.isInvalid);
						doh.assertFalse(response.isUnauthorised);
						doh.assertTrue(response.isConflicted);
					});
					dispatcher.send(someServiceCall);
				}
				catch (e) {
					doh.assertTrue(false, 'Unexpected error testing 409 status for PUT'); //we should not be here
				}
			},
			tearDown: function () {
			}
		},
		{
			name: "Rest service POST tests",
			setUp: function () {
				//control layer initialisation
				var scaffold = new Scaffold();
				dispatcher = scaffold.createDispatcher();

				myCallback = function (response) {
					console.group("Data received in callback");
					console.debug(response);
					console.groupEnd();
					doh.assertTrue(response.payload);
					doh.assertTrue(response.isOk);
				};
			},
			runTest: function () {
				try {
					//example of a valid rest call to call a method specifically designed to test a dispatcher
					var someServiceCall = new RestRequest({service: 'testService',
						verb: 'post',
						params: [
							{testData: 'someValue', status: 200}
						],
						callback: myCallback,
						callbackScope: this});

					dispatcher.send(someServiceCall);
				}
				catch (e) {
					doh.assertTrue(false, 'Unexpected error occurred sending callback based RestRequest for POST'); //we should not be here
				}

				//test the use of topics instead of callbacks for the response handling
				try {
					//example of a valid rest call to call a method specifically designed to test a dispatcher
					someServiceCall = new RestRequest({service: 'testService',
						verb: 'post',
						params: [
							{testData: 'someValue', status: 200}
						],
						topic: '/test/dispatcher/post/200'});

					topic.subscribe('/test/dispatcher/post/200', function (response, request) {
						console.group("Data received in topic");
						console.debug(response);
						console.groupEnd();
						doh.assertTrue(response.payload);
						doh.assertTrue(response.isOk);
						doh.assertEqual(someServiceCall, request);	//check that the request is passed back unmodified
					});
					dispatcher.send(someServiceCall);
				}
				catch (e) {
					doh.assertTrue(false, 'Unexpected error occurred sending topic based RestRequest for POST'); //we should not be here
				}

				try {
					//example of a valid rest call to call a method specifically designed to test a dispatcher
					someServiceCall = new RestRequest({service: 'testService',
						verb: 'post',
						params: [
							{testData: 'someValue', status: 123}
						],
						topic: '/test/dispatcher/post/123'});

					dispatcher.send(someServiceCall);
				}
				catch (e) {
					var shouldErrorOn123 = true;
				}
				doh.assertTrue(shouldErrorOn123, "Unexpected acceptance of status 123 for REST response for POST");

				try {
					//example of a valid rest call to call a method specifically designed to test a dispatcher
					someServiceCall = new RestRequest({service: 'testService',
						verb: 'post',
						params: [
							{testData: 'someValue', status: 400}
						],
						topic: '/test/dispatcher/post/400'});

					topic.subscribe('/test/dispatcher/post/400', function (response) {
						console.group("Data received in topic");
						console.debug(response);
						console.groupEnd();
						doh.assertTrue(response.payload);
						doh.assertFalse(response.isOk);
						doh.assertTrue(response.isInvalid);
						doh.assertFalse(response.isUnauthorised);
						doh.assertFalse(response.isConflicted);
					});
					dispatcher.send(someServiceCall);
				}
				catch (e) {
					doh.assertTrue(false, 'Unexpected error testing 400 status for POST'); //we should not be here
				}

				try {
					//example of a valid rest call to call a method specifically designed to test a dispatcher
					someServiceCall = new RestRequest({service: 'testService',
						verb: 'post',
						params: [
							{testData: 'someValue', status: 403}
						],
						topic: '/test/dispatcher/post/403'});

					topic.subscribe('/test/dispatcher/post/403', function (response) {
						console.group("Data received in topic");
						console.debug(response);
						console.groupEnd();
						doh.assertTrue(response.payload);
						doh.assertFalse(response.isOk);
						doh.assertFalse(response.isInvalid);
						doh.assertTrue(response.isUnauthorised);
						doh.assertFalse(response.isConflicted);
					});
					dispatcher.send(someServiceCall);
				}
				catch (e) {
					doh.assertTrue(false, 'Unexpected error testing 403 status for POST'); //we should not be here
				}

				try {
					//example of a valid rest call to call a method specifically designed to test a dispatcher
					someServiceCall = new RestRequest({service: 'testService',
						verb: 'post',
						params: [
							{testData: 'someValue', status: 409}
						],
						topic: '/test/dispatcher/post/409'});

					topic.subscribe('/test/dispatcher/post/409', function (response) {
						console.group("Data received in topic");
						console.debug(response);
						console.groupEnd();
						doh.assertTrue(response.payload);
						doh.assertFalse(response.isOk);
						doh.assertFalse(response.isInvalid);
						doh.assertFalse(response.isUnauthorised);
						doh.assertTrue(response.isConflicted);
					});
					dispatcher.send(someServiceCall);
				}
				catch (e) {
					doh.assertTrue(false, 'Unexpected error testing 409 status for POST'); //we should not be here
				}
			},
			tearDown: function () {
			}
		}

	]);
});