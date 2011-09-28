//Declare out the name of the test module to make dojo's module loader happy.
dojo.provide("test.doh.control.TestMockTransport");

dojo.require('rishson.enterprise.control.Controller');
dojo.require('rishson.enterprise.control.MockTransport');
dojo.require('rishson.enterprise.control.ServiceRequest');

doh.register("MockTransport tests", [
    {
        name: "Send tests",
        setUp: function(){
            //control layer initialisation
            mockTransport = new rishson.enterprise.control.MockTransport();
            controller = new rishson.enterprise.control.Controller(mockTransport);
        },
        runTest: function(){
            try{
                //example of a valid WebService call to call a method specifically designed to test a Controller
                var someServiceCall = new rishson.enterprise.control.ServiceRequest({service : 'testService',
                    method : 'ControllerTestMethod',
                    params : [{funcName : 'validResponse'}],
                    callback : myCallback,
                    scope : this});

                controller.send(someServiceCall);
            }
            catch(e){
                doh.assertTrue('false', 'Unexpected error occurred sending ServiceRequest'); //we should not be here
            }

            var invalidServiceCall = {};
            var invalidConstruction = false;
            try {
                controller.send(invalidServiceCall);
            }
            catch(e)
            {
                invalidConstruction = true;
            }
            doh.assertTrue(invalidConstruction, 'Unexpected constructor acceptance of invalid params');
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