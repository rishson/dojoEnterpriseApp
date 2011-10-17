dojo.provide('test.data.serviceResponses.userService.Logout');

dojo.declare('test.data.serviceResponses.userService.Logout', null, {
    validResponse : function() {
        return {logout : 'sucess'};
    },

    invalidResponse : function() {
        return {};
    }
});