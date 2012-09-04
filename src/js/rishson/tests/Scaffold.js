define([
	"dojo/_base/declare",
	"rishson/control/Dispatcher",
	"rishson/control/Response",
	"rishson/control/MockTransport",
	"rishson/control/ServiceRequest"
], function (declare, Dispatcher, Response, MockTransport, ServiceRequest) {

	return declare('tests.Scaffold', null, {

		createDispatcher: function (testNamespace) {
			var params = {},
				validRequest = {
					callback: function () {}, //needs to be a function
					callbackScope: this, //needs to be an object
					service: 'hello', //needs to be a string
					method: 'world'    //needs to be a string
				},
				validResponse = new Response({grantedAuthorities: ['perm1', 'perm2'],
					username: 'someUsername',
					returnRequest: true,
					apps: [{
						id: 'someId',
						caption: 'someCaption',
						description: 'someDescription',
						iconClass: 'someIconClass',
						baseUrl: 'someBaseUrl',
						grantedAuthorities: ['perm1'],
						module: 'someModule',
						websocket: false
					}]
					}, true, {xhr: {status: 200}}),
				mockTransport,
				dispatcher;

			if (testNamespace) {
				params.namespace  = testNamespace;
			}
			mockTransport = new MockTransport(params);
			dispatcher = new Dispatcher(mockTransport);
			dispatcher.handleResponse(validRequest, validResponse);	//bypass sending an actual request
			return dispatcher;
		},

		createLogoutRequest: function () {
			return new ServiceRequest({callback: function () {},
				callbackScope: this,
				service: 'userService',
				method: 'logout',
				params: [
					{username: 'andy'}
				]
				});
		},

		createRequest: function () {
			return new ServiceRequest({callback: function () {},
				callbackScope: this,
				service: 'userService',
				method: 'logout',
				params: [
					{username: 'andy'}
				]
				});
		}
	});
});