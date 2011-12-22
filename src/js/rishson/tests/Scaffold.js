define([
    "dojo/_base/declare",
    "rishson/control/Controller",
    "rishson/control/MockTransport",
    "rishson/control/ServiceRequest"
], function(declare, Controller, MockTransport, ServiceRequest){

    return declare('test.Scaffold', null, {
    
        createController : function() {
            var mockTransport = new MockTransport();
            var validLoginResponse = {logoutRequest : this.createLogoutRequest(),
                serviceRegistry : [],
                grantedAuthorities : [],
                returnRequest : true};
            return new Controller(mockTransport, validLoginResponse);
        },
    
        createLogoutRequest : function() {
            return new ServiceRequest({callback : function(){},
                callbackScope : this,
                service : 'userService',
                method : 'logout',
                params : [{username : 'andy'}]
            });
        },
    
        createRequest : function() {
            return new ServiceRequest({callback : function(){},
                callbackScope : this,
                service : 'userService',
                method : 'logout',
                params : [{username : 'andy'}]
            });
        }
    
    });
});