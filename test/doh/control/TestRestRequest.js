//Declare out the name of the test module to make dojo's module loader happy.
dojo.provide("test.doh.control.TestRestRequest");

dojo.require('rishson.enterprise.control.RestRequest');

doh.register("RestRequest class tests", [
    {
        name: "Constructor tests",
        setUp: function(){
        },
        runTest: function(){
            var constructorFailed = false;
            try {
                //invallid construction - no params passed to constructor
                var request = new rishson.enterprise.control.RestRequest();
            }
            catch(e){
                constructorFailed = true;
            }
            doh.assertTrue(constructorFailed);

            try {
                //valid construction
                constructorFailed = false;
                validCtorParams = {
                    callback : function(){},    //needs to be a function
                    callbackScope : this,   //needs to be an object
                    service : 'hello',  //needs to be a string
                    verb : 'get'    //needs to be a string
                };
                request = new rishson.enterprise.control.RestRequest(validCtorParams);
            }
            catch(e){
                constructorFailed = true;
            }
            doh.assertFalse(constructorFailed, 'Unexpected failure of ServiceRequest construction');
        },
        tearDown: function(){
        }
    },
    {
        name: "Method tests",
        setUp: function(){
            //valid construction
            request = new rishson.enterprise.control.RestRequest(validCtorParams);
        },
        runTest: function(){

            doh.assertEqual(request.toUrl(), validCtorParams.service);
        },
        tearDown: function(){
        }

    }

]);
