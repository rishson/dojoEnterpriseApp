dojo.provide('rishson.enterprise.control.XhrTransport');

dojo.require('rishson.enterprise.control.Transport');
dojo.require('rishson.enterprise.util.ObjectValidator');

/**
 * @class
 * @name rishson.enterprise.control.XhrTransport
 * @description An implementation of <code>rishson.enterprise.control.Transport</code> that uses XHR calls to a server
 */
dojo.declare('rishson.enterprise.control.XhrTransport', [rishson.enterprise.control.Transport], {

    /**
     * @field
     * @name rishson.enterprise.control.XhrTransport.baseUrl
     * @type {String}
     * @description a URL that usually specifies the domain and a global context, e.g. http://www.mydomain.com:myport/mycontext
     */
    baseUrl : null,

    /**
     * @field
     * @name rishson.enterprise.control.XhrTransport.requestTimeout
     * @type {Number}
     * @description the number of milliseconds that a <code>rishson.enterprise.control.Request</code> can take before the call is aborted.
     */
    requestTimeout : 5000,  //defaults to 5 seconds

    /**
     * @constructor
     * @param {Object} params Must contain the following:
     *  baseUrl {String} root and context of the web application. e.g. http://www.mydomain.com:myport/mycontext
     */
    constructor : function (params) {
        var criteria = [{paramName : 'baseUrl', paramType : 'string'}];
        var validator = new rishson.enterprise.util.ObjectValidator(criteria);

        if (validator.validate(params)) {
            dojo.mixin(this, params);
        }
        else {
            validator.logErrorToConsole(params, 'Invalid XhrTransport construction.');
            throw('Invalid XhrTransport construction.');
        }
    },

    /**
     * @function
     * @name rishson.enterprise.control.XhrTransport.send
     * @description Issues the provided <code>rishson.enterprise.control.Request</code> in an asynchronous manner
     * @override Transport.send
     * @param {rishson.enterprise.control.Request} request to send to the server
     */
    send : function (request) {

        var postParams = this.createBasePostParams(request);
        //do json hijacking mitigation with {}{..}
        //do autoincrement sendID if required
        //profiling can be enabled here

        //do xhrPost
        var def = dojo.xhrPost({
            url: this.baseUrl + request.toUrl(),
            content : postParams,
            handleAs: "json",
            timeout : this.requestTimeout
        });

        /* Server responses always resolve to:
           {isError : boolean, payload : {} }
           where isError and payload are mutually exclusive
         */
        def.then(function(response){
            //all server responses implement a top level object that indicates if the response is a success or error
            //in this case, an error is a known server error state - not an unexpected runtime error.
            if(response.isError) {
                this.handleErrorFunc(request, response);
            }
            else {
                this.handleResponseFunc(request, response);
            }
        },
        function(err){
            //unexpected error - something went wrong in the XHR request/response
            //Its OK to send the error to the console as this does not pose a security risk.
            //the failure is freely available using http traffic monitoring so we are not 'leaking' information
            console.error(err);

            //you could do further processing such as put the transport in a retry or quiescent state
        });
    }

});
