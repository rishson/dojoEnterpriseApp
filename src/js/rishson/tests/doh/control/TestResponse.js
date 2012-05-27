define([
	"doh",
	"rishson/control/Response"
], function (doh, Response) {

	doh.register("Response tests", [
		{
			name: "Constructor tests",
			setUp: function () {
			},
			runTest: function () {
				var constructorFailed = false;
				try {
					//invalid construction - no params passed to constructor
					var response = new Response();
				}
				catch (e) {
					constructorFailed = true;
				}
				doh.assertTrue(constructorFailed);

				try {
					//invalid construction - response passed in is empty for a non-REST request
					response = new Response({}, false);
				}
				catch (e) {
					constructorFailed = true;
				}
				doh.assertTrue(constructorFailed, 'Unexpected successful construction of Response');

				try {
					//invalid construction - no ioArgs for a REST request
					response = new Response({}, true, null);
				}
				catch (e) {
					constructorFailed = true;
				}
				doh.assertTrue(constructorFailed, 'Unexpected successful construction of Response');


				try {
					//invalid construction - response contains invalid status code
					response = new Response({}, true, {xhr: {status: 123}});
				}
				catch (e) {
					constructorFailed = true;
				}
				doh.assertTrue(constructorFailed, 'Unexpected successful construction of Response');

				try {
					//invalid construction - response contains no payload for service response
					response = new Response({something: 'invalid'}, false, {xhr: {status: 123}});
				}
				catch (e) {
					constructorFailed = true;
				}
				doh.assertTrue(constructorFailed, 'Unexpected successful construction of Response');


				try {
					//valid construction of REST response
					var emptyPayload = {};
					response = new Response(emptyPayload, true, {xhr: {status: 200}});
				}
				catch (e) {
					doh.assertTrue(false, 'Unsuccessful construction of Response for REST request');
				}
				doh.assertTrue(response.payload == emptyPayload);
				doh.assertTrue(response.isOk);
				doh.assertFalse(response.isConflicted);

				try {
					//valid construction of Web Service response
					var validResponse = {payload: {someParam: 'someValue'}, isOk: true};
					response = new Response(validResponse, false);
				}
				catch (e) {
					doh.assertTrue(false, 'Unsuccessful construction of Response for Service resquest');
				}
				doh.assertTrue(response.payload == validResponse.payload);
				doh.assertTrue(response.isOk);
				doh.assertFalse(response.isConflicted);

			},
			tearDown: function () {
			}
		}
	]);
});