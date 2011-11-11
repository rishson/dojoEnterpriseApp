//Declare out the name of the test module to make dojo's module loader happy.
dojo.provide("test.doh.control.TestMockTransport");

dojo.require('test.Scaffold');
dojo.require('rishson.enterprise.control.Controller');
dojo.require('rishson.enterprise.control.MockTransport');
dojo.require('rishson.enterprise.control.ServiceRequest');

doh.register("MockTransport tests", [
    {
        name: "Send tests",
        setUp: function(){
            var scaffold = new test.Scaffold();
            controller = scaffold.createController();
        },
        runTest: function(){
            try{
                myCallback = function(data) {
                  console.group("Data received in callback");
                    console.debug(data);
                    console.groupEnd();
                    doh.assertTrue(data.testData === 'someValue');
                };

                //example of a valid WebService call to call a method specifically designed to test a Controller
                var someServiceCall = new rishson.enterprise.control.ServiceRequest({service : 'testService',
                    method : 'ControllerTestMethod',
                    params : [{testData : 'someValue'}],
                    callback : myCallback,
                    callbackScope : this});

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
