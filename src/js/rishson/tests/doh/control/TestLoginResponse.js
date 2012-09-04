define([
	"doh",
	"rishson/control/LoginResponse",
	"rishson/control/Response"
], function (doh, LoginResponse, Response) {

	doh.register("LoginResponse tests", [
		{
			name: "Constructor test1",
			setUp: function () {
				constructorFailed = false;
				response = {};
			},
			runTest: function () {
				try {
					//invalid construction - no params passed to constructor
					response = new LoginResponse();
				}
				catch (e) {
					constructorFailed = true;
				}
				doh.assertTrue(constructorFailed);
			},
			tearDown: function () {
			}
		},
		{
			name: "Constructor test2",
			setUp: function () {
				constructorFailed = false;
			},
			runTest: function () {
				try {
					//invalid construction - empty object passed to constructor
					response = new LoginResponse({});
				}
				catch (e) {
					constructorFailed = true;
				}
				doh.assertTrue(constructorFailed);
			},
			tearDown: function () {
			}
		},
		{
			name: "Constructor test3",
			setUp: function () {
				constructorFailed = false;
				testResponse = new Response({grantedAuthorities: ['perm1', 'perm2'],
					username: null,
					returnRequest: true,
					apps: [{
						id: 'someId',
						caption: 'someCaption',
						description: 'someDescription',
						iconClass: 'someIconClass',
						baseUrl: 'someBaseUrl',
						grantedAuthorities: ['perm1'],
						module: 'someModule'
					}]
				}, true, {xhr: {status: 200}});
			},
			runTest: function () {
				try {
					//invallid construction - username is null
					response = new LoginResponse(testResponse);
				}
				catch (e) {
					constructorFailed = true;
				}
				doh.assertTrue(constructorFailed);
			},
			tearDown: function () {
			}
		},
		{
			name: "Constructor test4",
			setUp: function () {
				constructorFailed = false;
				testResponse = new Response({grantedAuthorities: null,
					username: null,
					returnRequest: true,
					apps: [{
						id: 'someId',
						caption: 'someCaption',
						description: 'someDescription',
						iconClass: 'someIconClass',
						baseUrl: 'someBaseUrl',
						grantedAuthorities: ['perm1'],
						module: 'someModule'
					}]
				}, true, {xhr: {status: 200}});
			},
			runTest: function () {
				try {
					//invalid construction - grantedAuthorities is null
					response = new LoginResponse(testResponse);
				}
				catch (e) {
					constructorFailed = true;
				}
				doh.assertTrue(constructorFailed);
			},
			tearDown: function () {
			}
		},
		{
			name: "Constructor test5",
			setUp: function () {
				constructorFailed = false;
				testResponse = new Response({grantedAuthorities: ['perm1', 'perm2'],
					username: null,
					returnRequest: true,
					apps: null
				}, true, {xhr: {status: 200}});
			},
			runTest: function () {
				try {
					//invalid construction - apps is null
					response = new LoginResponse(testResponse);
				}
				catch (e) {
					constructorFailed = true;
				}
				doh.assertTrue(constructorFailed);
			},
			tearDown: function () {
			}
		},
		{
			name: "Constructor test6",
			setUp: function () {
				constructorFailed = false;
				testResponse = new Response({grantedAuthorities: [],
					username: null,
					returnRequest: true,
					apps: [{
						id: 'someId',
						caption: 'someCaption',
						description: 'someDescription',
						iconClass: 'someIconClass',
						baseUrl: 'someBaseUrl',
						grantedAuthorities: ['perm1'],
						module: 'someModule'
					}]
				}, true, {xhr: {status: 200}});
			},
			runTest: function () {
				try {
					//invalid construction - grantedAuthorities is empty
					response = new LoginResponse(testResponse);
				}
				catch (e) {
					constructorFailed = true;
				}
				doh.assertTrue(constructorFailed);
			},
			tearDown: function () {
			}
		},
		{
			name: "Constructor test7",
			setUp: function () {
				constructorFailed = false;
				testResponse = new Response({grantedAuthorities: ['perm1', 'perm2'],
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
				}, true, {xhr: {status: 200}});
			},
			runTest: function () {
				try {
					//valid construction
					response = new LoginResponse(testResponse);
				}
				catch (e) {
					constructorFailed = true;
				}
				doh.assertFalse(constructorFailed);
			},
			tearDown: function () {
			}
		}
	]);
});