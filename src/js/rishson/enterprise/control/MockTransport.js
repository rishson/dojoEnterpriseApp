dojo.provide('rishson.enterprise.control.MockTransport');

dojo.require('rishson.enterprise.control.Transport');
dojo.require('rishson.enterprise.util.ObjectValidator');

/**
 * @class
 * @name rishson.enterprise.control.MockTransport
 * @description An implementation of <code>rishson.enterprise.control.Transport</code> that mocks XHR calls to a server
 * and returns canned data from a test directory instead
 */
dojo.declare('rishson.enterprise.control.MockTransport', [rishson.enterprise.control.Transport], {

    /**
     * @field
     * @name rishson.enterprise.control.MockTransport.basePath
     * @type {String}
     * @description a relative path to a directory structure that contains canned responses
     */
    basePath : '../../../../../test/data/',

    /**
     * @field
     * @name rishson.enterprise.control.MockTransport.requestTimeout
     * @type {Number}
     * @description the number of milliseconds that a <code>rishson.enterprise.control.Request</code> can take before the call is aborted.
     */
    requestTimeout : 5000,  //defaults to 5 seconds

    /**
     * @constructor
     */
    constructor : function () {
    },

    /**
     * @function
     * @name rishson.enterprise.control.MockTransport.send
     * @description Issues the provided <code>rishson.enterprise.control.Request</code> in an asynchronous manner
     * @override Transport.send
     * @param {rishson.enterprise.control.Request} request to send to the server
     */
    send : function (request) {
        var isServiceRequest = false;
        if(request.declaredClass === 'rishson.enterprise.control.ServiceRequest'){
            isServiceRequest = true;
            this.basePath += 'serviceResponses/' + request.toUrl(); // request url is in the from service/method
        }
        else{
            this.basePath += 'restResponses';
        }



    }

});
