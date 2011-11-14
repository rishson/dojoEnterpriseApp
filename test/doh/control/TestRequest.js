//Declare out the name of the test module to make dojo's module loader happy.
dojo.provide("test.doh.control.TestRequest");

dojo.require('rishson.enterprise.control.Request');

doh.register("Request tests", [
    {
        name: "Constructor tests",
        setUp: function(){
        },
        runTest: function(){
            var constructorFailed = false;
            try {
                //invallid construction - no params passed to constructor
                var request = new rishson.enterprise.control.Request();
            }
            catch(e){
                constructorFailed = true;
            }
            doh.assertTrue(constructorFailed);

            try {
                //invallid construction - transport in params has no transport
                var validCallback = function(){};
                request = new rishson.enterprise.control.Request({callback : validCallback, callbackScope : this});
            }
            catch(e){
                constructorFailed = true;
            }
            doh.assertTrue(constructorFailed, 'Unexpected successful construction of Request');
        },
        tearDown: function(){
        }
    },
    {
        name: "Method tests",
        setUp: function(){
            var validCallback = function(){};
            request = new rishson.enterprise.control.Request({callback : validCallback, callbackScope : this});
        },
        runTest: function(){
            var toUrlShouldFail = false;
            try {
                request.toUrl();
            }
            catch(e) {
                toUrlShouldFail = true;
            }
            doh.assertTrue(toUrlShouldFail, 'Unexpected successful call to toUrl on Service');

            doh.assertEqual(request.getParams(), []);  //there should be no default params
            var testParam = {hello : 'world'};
            request.setParam(testParam);
            doh.assertTrue(request.getParams().length, 1);  //we should have a new param in the array
        },
        tearDown: function(){
        }

    }

]);
