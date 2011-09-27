dojo.provide('test.data.serviceResponses.testService.TestMethod');

dojo.declare('test.data.serviceResponses.testService.TestMethod', null, {
    validResponse : function() {
        return {hello : 'world'};
    },

    invalidResponse : function() {
        return {};
    }
});