define([
	"dojo/_base/declare",
	"../control/Dispatcher",
	"rishson/control/MockTransport",
	"rishson/control/ServiceRequest"
], function (declare, Dispatcher, MockTransport, ServiceRequest) {

	return declare('tests.Scaffold', null, {

		createDispatcher: function () {
			var mockTransport = new MockTransport(),
				validLoginResponse = {serviceRegistry: [],
					grantedAuthorities: [],
					returnRequest: true};

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