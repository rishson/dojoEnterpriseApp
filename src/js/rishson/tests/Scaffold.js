define([
	"dojo/_base/declare",
	"rishson/control/Dispatcher",
	"rishson/control/LoginResponse",
	"rishson/control/MockTransport",
	"rishson/control/ServiceRequest"
], function (declare, Dispatcher, LoginResponse, MockTransport, ServiceRequest) {

	return declare('tests.Scaffold', null, {

		createDispatcher: function (testNamespace) {
			var params = {};
			if(testNamespace) {
				params.namespace  = testNamespace;
			}
			var mockTransport = new MockTransport(params),
				validLoginResponse = new LoginResponse({grantedAuthorities: ['perm1', 'perm2'],
					apps: [{
						'id': 'someId',
						'caption': 'someCaption',
						'description': 'someDescription',
						'iconClass': 'someIconClass',
						'baseUrl': 'someBaseUrl',
						'grantedAuthorities': ['perm1']
					}], username: 'andy', returnRequest: true}, true, {xhr: {status: 200}});

			return new Dispatcher(mockTransport, validLoginResponse);
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