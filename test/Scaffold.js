dojo.provide('test.Scaffold');

dojo.require('rishson.enterprise.control.Controller');
dojo.require('rishson.enterprise.control.MockTransport');
dojo.require('rishson.enterprise.control.ServiceRequest');


dojo.declare('test.Scaffold', null, {

    createController : function() {
        var mockTransport = new rishson.enterprise.control.MockTransport();
        var validLoginResponse = {logoutRequest : this.createLogoutRequest(),
            serviceRegistry : [],
            grantedAuthorities : []};
        return new rishson.enterprise.control.Controller(mockTransport, validLoginResponse);
    },

    createLogoutRequest : function() {
        return new rishson.enterprise.control.ServiceRequest({callback : function(){},
            callbackScope : this,
            service : 'userService',
            method : 'logout',
            params : [{funcName : 'validResponse'}]
        });
    },

    createRequest : function() {
        return new rishson.enterprise.control.ServiceRequest({callback : function(){},
            callbackScope : this,
            service : 'userService',
            method : 'logout',
            params : [{funcName : 'validResponse'}]
        });
    }

});