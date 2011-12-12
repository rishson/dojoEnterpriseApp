define([
    "dojo/_base/declare"
], function(declare){
    return declare('test.data.serviceResponses.userService.Logout', null, {
        validResponse : function() {
            return {logout : 'sucess'};
        },
    
        invalidResponse : function() {
            return {};
        }
    });
});
