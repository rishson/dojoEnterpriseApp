dojo.provide('test.data.serviceResponses.testService.ControllerTestMethod');

dojo.declare('test.data.serviceResponses.testService.ControllerTestMethod', null, {
    processRequest : function(params) {

		switch (params.status) {
			case 200 :
				return {payload : params, isOk : true};
			case 400 :
				return {payload : params, isInvalid : true};
			case 403 :
				return {payload : params, isUnauthorised : true};
			case 409 :
				return {payload : params, isConflicted : true};	
			case 123 :
				return {};
		}
    },

});
