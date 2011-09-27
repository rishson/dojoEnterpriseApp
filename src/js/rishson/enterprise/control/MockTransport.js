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
        var testFuncName;   //name of the function to call on the TestMethod module
        var params;
        params = request.getParams();
        dojo.forEach(params, function(param){
            if(param.funcName){
                testFuncName = param.funcName;  //the name of the function to call
            }
        });

        /*get the full namespace of the module to provide the response
          The namespace is in the form test.data.[typeOfResponse].[request.url]
          e.g. for a service request:
          test.data.serviceResponses.someService.SomeMethod
          for a rest service:
          test.data.restResponses.someService.SomeEndpoint
        */
        var namespace = 'test.data.';
        switch (request.declaredClass) {
            case 'rishson.enterprise.control.ServiceRequest' :
                namespace += 'serviceResponses';
                break;
            case 'rishson.enterprise.control.RestRequest' :
                namespace += 'restResponses';
            break;
        }
        namespace += '.' + request.toUrl().replace('/', '.'); //the full namespace of the TestMethod module to load

        //capitalise the module name
        var indexOfClassName = namespace.lastIndexOf('.') + 1;
        namespace = namespace.slice(0, indexOfClassName) +
            namespace.charAt(indexOfClassName).toUpperCase() + namespace.slice(indexOfClassName + 1);


        dojo.require(namespace);    //get the TestModule
        var testMethod = this._stringToFunction(namespace); //get the module prototype from the DOM
        var testMethodClass = new testMethod(); //create an instance of the TestMethod class

        var response = {payload : testMethodClass[testFuncName]()}; //put the response envelope on and call the test method
        this.handleResponseFunc(request, response);
    },

    /**
     * Get a namespaced function from the DOM
     * @private
     * @param str {String} the name of a class in the DOM
     * @return {Function} the function from the DOM
     */
    _stringToFunction : function(str) {
      var arr = str.split(".");

      var fn = (window || this);
      for (var i = 0, len = arr.length; i < len; i++) {
        fn = fn[arr[i]];
      }

      if (typeof fn !== "function") {
        throw new Error("function not found");
      }
      return fn;
    },

    _getFile : function(filePath) {
        var path = document.location.pathname;
        var dir = path.substr(0, path.indexOf('/dojoEnterpriseApp')+18);
        callback = function(data){
            console.debug(data);
        };
        filePath = dir + filePath;

        var def = dojo.xhrGet({
            url: 'file://' + filePath,
            handleAs: "json"
        });
        def.then(function(response){
                return response;
            },
            function err(e){
                console.error(e);
            }
        );

        /**var jsonpArgs = {
            url: "file://" + filePath,
            callbackParamName: "callback",
            load: function(data) {
                return data;
            },
            error: function(error) {
                console.error(error);
            }
        };
        dojo.io.script.get(jsonpArgs);
        **/

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
