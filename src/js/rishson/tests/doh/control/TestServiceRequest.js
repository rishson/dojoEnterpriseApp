define([
	"doh",
	"rishson/control/ServiceRequest"
], function (doh, ServiceRequest) {

	doh.register("ServiceRequest tests", [
		{
			name: "Constructor tests",
			setUp: function () {
			},
			runTest: function () {
				var constructorFailed = false;
				try {
					//invallid construction - no params passed to constructor
					var request = new ServiceRequest();
				}
				catch (e) {
					constructorFailed = true;
				}
				doh.assertTrue(constructorFailed);

				try {
					//valid construction
					constructorFailed = false;
					validCtorParams = {
						callback: function () {
						}, //needs to be a function
						callbackScope: this, //needs to be an object
						service: 'hello', //needs to be a string
						method: 'world'    //needs to be a string
					};
					request = new ServiceRequest(validCtorParams);
				}
				catch (e) {
					constructorFailed = true;
				}
				doh.assertFalse(constructorFailed, 'Unexpected failure of ServiceRequest construction');
			},
			tearDown: function () {
			}
		},
		{
			name: "Method tests",
			setUp: function () {
				//valid construction
				request = new ServiceRequest(validCtorParams);
			},
			runTest: function () {

				doh.assertEqual(request.toUrl(), validCtorParams.service + '/' + validCtorParams.method);
			},
			tearDown: function () {
			}

		}

	]);
});