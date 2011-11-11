//Declare out the name of the test module to make dojo's module loader happy.
dojo.provide("test.doh.control.TestResponse");

dojo.require('rishson.enterprise.control.Response');

doh.register("Response class tests", [
    {
        name: "Constructor tests",
        setUp: function(){
        },
        runTest: function(){
            var constructorFailed = false;
            try {
                //invalid construction - no params passed to constructor
                var response = new rishson.enterprise.control.Response();
            }
            catch(e){
                constructorFailed = true;
            }
            doh.assertTrue(constructorFailed);

            try {
                //invalid construction - response passed in is empty
                response = new rishson.enterprise.control.Response({response : {}, wasRestRequest : true});
            }
            catch(e){
                constructorFailed = true;
            }
            doh.assertTrue(constructorFailed, 'Unexpected successful construction of Response');

			try {
                //invalid construction - response contains no ioArgs
				var invalidResponse = {payload : {}};	
                response = new rishson.enterprise.control.Response({response : invalidResponse, wasRestRequest : true});
            }
            catch(e){
                constructorFailed = true;
            }
            doh.assertTrue(constructorFailed, 'Unexpected successful construction of Response');


            try {
                //invalid construction - response contains invalid statusCode
				var invalidResponse = {payload : {}, ioArgs : {statusCode : xxx}};	
                response = new rishson.enterprise.control.Response({response : invalidResponse, wasRestRequest : true});
            }
            catch(e){
                constructorFailed = true;
            }
            doh.assertTrue(constructorFailed, 'Unexpected successful construction of Response');


			try {
                //valid construction 
				var validResponse = {payload : {}, isOk : true};	
                response = new rishson.enterprise.control.Response(validResponse, false);
            }
            catch(e){
	            doh.assertTrue(constructorFailed, 'Unexpected unsuccessful construction of Response');
            }
			doh.assertTrue(response.payload == validResponse.payload);
            doh.assertTrue(response.isOk);
            doh.assertFalse(response.isConflicted);

            try {
                //valid construction - transport in params has no transport
				validResponse = {payload : {}, ioArgs : {statusCode : 200}};	
                response = new rishson.enterprise.control.Response(validResponse, true);
            }
            catch(e){
	            doh.assertTrue(false, 'Unexpected unsuccessful construction of Response');
            }
			doh.assertTrue(response.payload == validResponse.payload);
            doh.assertTrue(response.isOk);
            doh.assertFalse(response.isConflicted);
        },
        tearDown: function(){
        }
    }
]);
