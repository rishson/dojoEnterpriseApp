dojo.provide('test.Scaffold');

dojo.require('rishson.enterprise.control.Controller');
dojo.require('rishson.enterprise.control.MockTransport');
dojo.require('rishson.enterprise.control.ServiceRequest');


dojo.declare('test.Scaffold', null, {

    createController : function() {
        var logoutRequest = this.createRequest();
        logoutRequest.service = 'userService';
        logoutRequest.method = 'logout';
        logoutRequest.params = [{funcName : 'validResponse'}],

        mockTransport = new rishson.enterprise.control.MockTransport();
        controller = new rishson.enterprise.control.Controller(mockTransport, logoutRequest);
        return controller;
    },

    createRequest : function() {
        var validCallback = function(){};
        var request = new rishson.enterprise.control.ServiceRequest({callback : validCallback, callbackScope : this});
        return request;
    }

});