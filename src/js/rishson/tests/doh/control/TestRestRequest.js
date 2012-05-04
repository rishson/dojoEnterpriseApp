define([
	"doh",
	"rishson/control/RestRequest"
], function (doh, RestRequest) {

	doh.register("RestRequest tests", [
		{
			name: "Constructor tests",
			setUp: function () {
			},
			runTest: function () {
				var constructorFailed = false;
				try {
					//invallid construction - no params passed to constructor
					var request = new RestRequest();
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
						verb: 'get'    //needs to be a string
					};
					request = new RestRequest(validCtorParams);
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
				request = new RestRequest(validCtorParams);
			},
			runTest: function () {

				doh.assertEqual(request.toUrl(), validCtorParams.service);
			},
			tearDown: function () {
			}

		}

	]);
});