dojo.provide('rishson.enterprise.control.MockTransport');

dojo.require('dojo.io.script');

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
    basePath : '/test/data/',

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
        /**
        Check for the various File API support.
        if (window.File && window.FileReader && window.FileList && window.Blob) {
        } else {
            console.error('The File APIs are not fully supported in this browser.');
        }

        function onInitFs(fs) {
            this.fs = fs;
        }

        function errorHandler(e){
            console.error(e);
        }

        window.requestFileSystem(window.PERSISTENT, 1024*1024, onInitFs, errorHandler);
        **/
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
        var filename;
        var params;
        params = request.getParams();
        dojo.forEach(params, function(param){
            if(param.filename){
                filename = param.filename + '.json';
            }
        });
        if(request.declaredClass === 'rishson.enterprise.control.ServiceRequest'){
            isServiceRequest = true;
            this.basePath += 'serviceResponses/';
        }
        else{
            this.basePath += 'restResponses';
        }

        var response = this._getFile(this.basePath + request.toUrl() + '/' + filename);
        this.handleResponseFunc(request, response);
    },

    _getFile : function(filePath) {
        var path = document.location.pathname;
        var dir = path.substr(0, path.indexOf('/dojoEnterpriseApp')+18);
        callback = function(data){
            console.debug(data);
        };
        filePath = dir + filePath;

        

        /**this.fs.root.getFile(filePath, {}, function(fileEntry) {
            Get a File object representing the file,
            then use FileReader to read its contents.
            fileEntry.file(function(file) {

                var fileReader = new FileReader();
                fileReader.onload = function(testData) {
                    return testData;
                };
                fileReader.readAsText(filePath);
            });
        });
         **/
    }

});
