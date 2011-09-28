//Declare out the name of the test module to make dojo's module loader happy.
dojo.provide("test.doh.control.TestController");

dojo.require('rishson.enterprise.control.Controller');
dojo.require('rishson.enterprise.control.MockTransport');
dojo.require('rishson.enterprise.control.ServiceRequest');
//dojo.require('rishson.enterprise.control.RestRequest');

doh.register("Controller tests", [
    {
        name: "Constructor tests",
        setUp: function(){
            dojo.cookie("JSESSIONID", '1234567890');
            //control layer initialisation - create a valid Transport implementation
            mockTransport = new rishson.enterprise.control.MockTransport();
        },
        runTest: function(){
            var constructorFailed = false;
            try {
                //invallid construction - no params passed to constructor
                var controller = new rishson.enterprise.control.Controller();
            }
            catch(e){
                constructorFailed = true;
            }
            doh.assertTrue(constructorFailed);

            try {
                //invallid construction - transport in params has no transport
                controller = new rishson.enterprise.control.Controller({invalidParam : null});
            }
            catch(e){
                constructorFailed = true;
            }
            doh.assertTrue(constructorFailed);

            //valid construction
            controller = new rishson.enterprise.control.Controller(mockTransport);

            //check that the transport has been decorated with handler functions
            doh.assertEqual(controller.handleResponse, controller.transport.handleResponseFunc);
            doh.assertEqual(controller.handleError, controller.transport.handleErrorFunc);
        },
        tearDown: function(){
        }
    },
    {
        name: "Web service request tests",
        setUp: function(){
            //control layer initialisation
            mockTransport = new rishson.enterprise.control.MockTransport();
            controller = new rishson.enterprise.control.Controller(mockTransport);
    
            myCallback = function(data) {
                console.group("Data received in callback");
                console.debug(data);
                console.groupEnd();
                doh.assertTrue(data.hello === 'world');
            };
        },
        runTest: function(){
            try{
                //example of a valid WebService call to call a mathod specifically designed to test a Controller
                var someServiceCall = new rishson.enterprise.control.ServiceRequest({service : 'testService',
                    method : 'ControllerTestMethod',
                    params : [{funcName : 'validResponse'}],
                    callback : myCallback,
                    scope : this});

                controller.send(someServiceCall);
            }
            catch(e){
                doh.assertTrue('false', 'Unexpected error occured sending ServiceRequest'); //we should not be here
            }
        },
        tearDown: function(){
        }

    }

]);

//example of a REST call
//var someRestCall = new rishson.enterprise.control.RestRequest({verb : 'post',
//    data : {username : 'andy'},
//    callback : myCallback,
//    scope : this});

//controller.send(someRestCall);