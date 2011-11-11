dojo.provide('test.data.serviceResponses.testService.ControllerTestMethod');

dojo.declare('test.data.serviceResponses.testService.ControllerTestMethod', null, {
    processRequest : function(params) {
		//very simple echo reposonse
        return {payload : params, isOk : true};
    },

});
