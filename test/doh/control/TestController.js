//Declare out the name of the test module to make dojo's module loader happy.
dojo.provide("test.doh.control.TestController");

dojo.require('test.Scaffold');

dojo.require('rishson.enterprise.control.Controller');
dojo.require('rishson.enterprise.control.MockTransport');
dojo.require('rishson.enterprise.control.ServiceRequest');
dojo.require('rishson.enterprise.control.RestRequest');

doh.register("Controller tests", [
    {
        name: "Constructor tests",
        setUp: function(){
            dojo.cookie("JSESSIONID", '1234567890');
            //control layer initialisation - create a valid Transport implementation
            mockTransport = new rishson.enterprise.control.MockTransport();
            validRequest = {
                callback : function(){},    //needs to be a function
                callbackScope : this,   //needs to be an object
                service : 'hello',  //needs to be a string
                method : 'world'    //needs to be a string
            };
            validLoginResponse = {logoutRequest : new rishson.enterprise.control.Request(validRequest),
                serviceRegistry : [],
                grantedAuthorities: []
            };
        },
        runTest: function(){
            var constructorFailed = false;
            try {
                //invalid construction - no params passed to constructor
                var controller = new rishson.enterprise.control.Controller();
            }
            catch(e){
                constructorFailed = true;
            }
            doh.assertTrue(constructorFailed);

            try {
                //invalid construction - transport is null
                controller = new rishson.enterprise.control.Controller(null, validLoginResponse);
            }
            catch(e){
                constructorFailed = true;
            }
            doh.assertTrue(constructorFailed);

            try {
                //invalid construction - validLoginResponse is null
                controller = new rishson.enterprise.control.Controller(mockTransport, null);
            }
            catch(e){
                constructorFailed = true;
            }
            doh.assertTrue(constructorFailed);

            try {
                //invalid construction - validLoginResponse is not populated
                controller = new rishson.enterprise.control.Controller(mockTransport, {});
            }
            catch(e){
                constructorFailed = true;
            }
            doh.assertTrue(constructorFailed);

            try {
                //invalid construction - validLoginResponse.grantedAuthorities is null
                controller = new rishson.enterprise.control.Controller(mockTransport, {logoutRequest : {},
                    serviceRegistry : [],
                    grantedAuthorities: null});
            }
            catch(e){
                constructorFailed = true;
            }
            doh.assertTrue(constructorFailed);

            try {
                //invalid construction - validLoginResponse.serviceRegistry is null
                controller = new rishson.enterprise.control.Controller(mockTransport, {logoutRequest : {},
                    serviceRegistry : null,
                    grantedAuthorities: []});
            }
            catch(e){
                constructorFailed = true;
            }
            doh.assertTrue(constructorFailed);

            try {
                //invalid construction - validLoginResponse.logoutRequest is null
                controller = new rishson.enterprise.control.Controller(mockTransport, {logoutRequest : null,
                    serviceRegistry : [],
                    grantedAuthorities: []});
            }
            catch(e){
                constructorFailed = true;
            }
            doh.assertTrue(constructorFailed);


            //valid construction
            controller = new rishson.enterprise.control.Controller(mockTransport, validLoginResponse);

            //check that the transport has been decorated with handler functions
            //doh.assertEqual(controller.handleResponse, controller.transport.handleResponseFunc);
            //doh.assertEqual(controller.handleError, controller.transport.handleErrorFunc);
        },
        tearDown: function(){
        }
    },
    {
        name: "Web service request tests",
        setUp: function(){
            //control layer initialisation
            var scaffold = new test.Scaffold();
            controller = scaffold.createController();
    
            myCallback = function(response, request) {
                console.group("Data received in callback");
                console.debug(response);
                console.groupEnd();
                doh.assertTrue(response.payload.testData === 'someValue');
				doh.assertTrue(response.isOk);
				if(! request) {
					doh.assertTrue(false, "Request not returned in callback");
				}
            };
        },
        runTest: function(){
            try{
                //example of a valid WebService call to call a method specifically designed to test a Controller
                var someServiceCall = new rishson.enterprise.control.ServiceRequest({service : 'testService',
                    method : 'ControllerTestMethod',
                    params : [{testData : 'someValue'}],
                    callback : myCallback,
                    callbackScope : this});

                controller.send(someServiceCall);
            }
            catch(e){
                doh.assertTrue(false, 'Unexpected error occurred sending callback based ServiceRequest'); //we should not be here
				console.debug(e);
            }

            //test the use of topics instead of callbacks for the response handling
            try{
                //example of a valid WebService call to call a method specifically designed to test a Controller
                someServiceCall = new rishson.enterprise.control.ServiceRequest({service : 'testService',
                    method : 'ControllerTestMethod',
                    params : [{testData : 'someValue'}],
                    topic : '/test/controller'});

                dojo.subscribe('/test/controller', function (response, request){
                    console.group("Data received in topic");
                    console.debug(response);
                    console.groupEnd();
                    doh.assertTrue(response.payload.testData === 'someValue');
					doh.assertTrue(response.isOk);
					if(! request) {
						doh.assertTrue(false, "Request not returned in callback");
					}
                });
                controller.send(someServiceCall);
            }
            catch(e){
                doh.assertTrue(false, 'Unexpected error occurred sending topic based ServiceRequest'); //we should not be here
            }
        },
        tearDown: function(){
        }
    },
	{
        name: "Rest service request tests",
        setUp: function(){
            //control layer initialisation
            var scaffold = new test.Scaffold();
            controller = scaffold.createController();
    
            myCallback = function(response) {
                console.group("Data received in callback");
                console.debug(response);
                console.groupEnd();
                doh.assertTrue(response.payload.testData === 'someValue');
                doh.assertTrue(response.isOk);
            };
        },
        runTest: function(){
            try{
                //example of a valid rest call to call a method specifically designed to test a Controller
                var someServiceCall = new rishson.enterprise.control.RestRequest({service : 'testService',
                    verb : 'get',
                    params : [{testData : 'someValue', status : 200}],
                    callback : myCallback,
                    callbackScope : this});

                controller.send(someServiceCall);
            }
            catch(e){
                doh.assertTrue(false, 'Unexpected error occurred sending callback based RestRequest'); //we should not be here
            }

            //test the use of topics instead of callbacks for the response handling
            try{
                //example of a valid rest call to call a method specifically designed to test a Controller
                someServiceCall = new rishson.enterprise.control.RestRequest({service : 'testService',
                    verb : 'get',
                    params : [{testData : 'someValue', status : 200}],
                    topic : '/test/controller'});

                dojo.subscribe('/test/controller', function (response, request){
                    console.group("Data received in topic");
                    console.debug(response);
                    console.groupEnd();
                    doh.assertTrue(response.payload.testData === 'someValue');
					doh.assertTrue(response.isOk);
					doh.assertEqual(someServiceCall, request);	//check that the request is passed back unmodified
                });
                controller.send(someServiceCall);
            }
            catch(e){
                doh.assertTrue(false, 'Unexpected error occurred sending topic based RestRequest'); //we should not be here
            }

			try{
                //example of a valid rest call to call a method specifically designed to test a Controller
                someServiceCall = new rishson.enterprise.control.RestRequest({service : 'testService',
                    verb : 'get',
                    params : [{testData : 'someValue', status : 123}],
                    topic : '/test/controller'});

                controller.send(someServiceCall);
            }
            catch(e){
                var shouldErrorOn123 = true;
            }
			doh.assertTrue(shouldErrorOn123, "Unexpected acceptance of status 123 for REST response.");

			try{
                //example of a valid rest call to call a method specifically designed to test a Controller
                someServiceCall = new rishson.enterprise.control.RestRequest({service : 'testService',
                    verb : 'get',
                    params : [{testData : 'someValue', status : 400}],
                    topic : '/test/controller/400'});

                dojo.subscribe('/test/controller/400', function (response){
                    console.group("Data received in topic");
                    console.debug(response);
                    console.groupEnd();
                    doh.assertTrue(response.payload.testData === 'someValue');
					doh.assertFalse(response.isOk);
					doh.assertTrue(response.isInvalid);
					doh.assertFalse(response.isUnauthorised);
					doh.assertFalse(response.isConflicted);
                });
                controller.send(someServiceCall);
            }
            catch(e){
                doh.assertTrue(false, 'Unexpected error testing 400 status'); //we should not be here
            }

			try{
                //example of a valid rest call to call a method specifically designed to test a Controller
                someServiceCall = new rishson.enterprise.control.RestRequest({service : 'testService',
                    verb : 'get',
                    params : [{testData : 'someValue', status : 403}],
                    topic : '/test/controller/403'});

                dojo.subscribe('/test/controller/403', function (response){
                    console.group("Data received in topic");
                    console.debug(response);
                    console.groupEnd();
                    doh.assertTrue(response.payload.testData === 'someValue');
					doh.assertFalse(response.isOk);
					doh.assertFalse(response.isInvalid);
					doh.assertTrue(response.isUnauthorised);
					doh.assertFalse(response.isConflicted);
                });
                controller.send(someServiceCall);
            }
            catch(e){
                doh.assertTrue(false, 'Unexpected error testing 403 status'); //we should not be here
            }

						try{
                //example of a valid rest call to call a method specifically designed to test a Controller
                someServiceCall = new rishson.enterprise.control.RestRequest({service : 'testService',
                    verb : 'get',
                    params : [{testData : 'someValue', status : 409}],
                    topic : '/test/controller/409'});

                dojo.subscribe('/test/controller/409', function (response){
                    console.group("Data received in topic");
                    console.debug(response);
                    console.groupEnd();
                    doh.assertTrue(response.payload.testData === 'someValue');
					doh.assertFalse(response.isOk);
					doh.assertFalse(response.isInvalid);
					doh.assertFalse(response.isUnauthorised);
					doh.assertTrue(response.isConflicted);
                });
                controller.send(someServiceCall);
            }
            catch(e){
                doh.assertTrue(false, 'Unexpected error testing 409 status'); //we should not be here
            }



        },
        tearDown: function(){
        }
    }


]);
