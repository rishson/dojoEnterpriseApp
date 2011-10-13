dojo.provide('test.data.serviceResponses.userService.Logout');

dojo.declare('test.data.serviceResponses.userService.Logout', null, {
    validResponse : function() {
        return {hello : 'world'};
    },

    invalidResponse : function() {
        return {};
    }
});