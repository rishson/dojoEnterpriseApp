define([
	"doh",
	"rishson/control/LoginResponse"
], function (doh, LoginResponse) {

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
			},
			runTest: function () {
				try {
					//invallid construction - username is null
					response = new LoginResponse({grantedAuthorities: [], apps: [], username: null});
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
			},
			runTest: function () {
				try {
					//invalid construction - grantedAuthorities is null
					response = new LoginResponse({grantedAuthorities: null, apps: [], username: null});
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
			},
			runTest: function () {
				try {
					//invalid construction - apps is null
					response = new LoginResponse({grantedAuthorities: [], apps: null, username: null});
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
			},
			runTest: function () {
				try {
					//invalid construction - grantedAuthorities is empty
					response = new LoginResponse({grantedAuthorities: [], apps: [], username: 'andy'}, true,
						{xhr: {status: 200}});
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
			},
			runTest: function () {
				try {
					//invalid construction - no params passed to constructor
					response = new LoginResponse({grantedAuthorities: ['perm1', 'perm2'],
					apps: [{
						'id': 'someId',
						'caption': 'someCaption',
						'description': 'someDescription',
						'iconClass': 'someIconClass',
						'baseUrl': 'someBaseUrl',
						'grantedAuthorities': ['perm1']
					}], username: 'andy'}, true, {xhr: {status: 200}});
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