dojo.provide('test.data.restResponses.testService.Get');

dojo.require('test.data.restResponses.RestResponse');

dojo.declare('test.data.restResponses.testService.Get', test.data.restResponses.RestResponse, {
    processRequest : function(params) {
		//check that we received a get request
		
		//very simple echo reposonse
        return new test.data.restResponses.RestResponse({payload : params});
    },

});
