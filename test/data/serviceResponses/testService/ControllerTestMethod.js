dojo.provide('test.data.serviceResponses.testService.ControllerTestMethod');

dojo.declare('test.data.serviceResponses.testService.ControllerTestMethod', null, {
    validResponse : function() {
        return {hello : 'world'};
    },

    invalidResponse : function() {
        return {};
    }
});