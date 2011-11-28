dojo.provide('test.data.restResponses.testService.Post');

dojo.require('test.data.restResponses.RestResponse');

dojo.declare('test.data.restResponses.testService.Post', [test.data.restResponses.RestResponse], {
    processRequest : function(params) {
		switch (params.status) {
			case 200 :
				//very simple echo reposonse
        		return new test.data.restResponses.RestResponse({payload : params});
			case 400 :
        		return new test.data.restResponses.RestResponse({payload : params}, {xhr : {status : 400}});
			case 403 :
        		return new test.data.restResponses.RestResponse({payload : params}, {xhr : {status : 403}});
			case 409 :
        		return new test.data.restResponses.RestResponse({payload : params}, {xhr : {status : 409}});
			case 123 :
        		return new test.data.restResponses.RestResponse({payload : params}, {xhr : {status : 123}});
		}
    },

});
