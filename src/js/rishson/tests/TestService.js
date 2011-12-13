define([
    "dojo/_base/xhr",
    "dojox/io/xhrPlugins"
], function(xhr, xhrPlugins){
    function findMatch(handlers, url){
        var i = 0, handler, match;
        while ((handler = handlers[i++])) {
            match = url.match(handler[0]);
            if(match){
                return [match, handler[1], handler[2]];
            }
        }
        return null;
    }

    function mockXhrDef(args){
        var def = xhr._ioSetArgs(
            args,
            function(dfd){
                // cancel
                dfd.canceled = true;
                var err = dfd.ioArgs.error;
                if(!err){
                    err = new Error("xhr cancelled");
                    err.dojoType="cancel";
                }
                return err;
            },
            function(result){
                // ok
                return result;
            },
            function(error, dfd){
                // error
                if(!dfd.ioArgs.args.failOk){
                    console.error(error);
                }
                return error;
            }
        );
        def.ioArgs.xhr = {
            abort: function(){}
        };

        return def;
    }

    var TestService = function(options){
        // options supports the following properties:
        // * baseUrl: used as base URL for registering XHR plugin;
        //   also represents common part of URL to be stripped from all
        //   service URLs before matching against handler URL patterns
        // * handlers: array of arrays; inner arrays must contain 2 items:
        //   a URL RegExp and a handler function which should be invoked upon match.
        //   An optional 3rd array item can specify a delay (in ms) to wait
        //   before running the handler.
        //   Handler functions run in the scope of the TestService instance, and
        //   are passed any matches from capturing groups, followed by the
        //   parameters normally passed to the xhr function (method, args, hasBody)
        // * delay: delay (in ms) to wait before firing handlers by default.
        //   If unspecified, defaults to 500ms.
        
        var baseUrl = this.baseUrl = options.baseUrl || "/testServices/",
            baseUrlLength = baseUrl.length,
            handlers = options.handlers;

        var i=0, handler;
        while ((handler = handlers[i++])) {
            // convert any string URL patterns to RegExp objects
            if(typeof handler[0] == "string"){
                handler[0] = new RegExp(handler[0]);
            }
        }

        var service = this;
        xhrPlugins.register(
            baseUrl,
            function(method, args){
                return args.url.substring(0, baseUrlLength) == baseUrl;
            },
            function(method, args, hasBody){
                var def = mockXhrDef(args),
                    ioArgs = def.ioArgs,
                    url = args.url.slice(baseUrlLength),
                    urlHandler = findMatch(handlers, url),
                    timeout = options.timeout || 500,
                    callback;

                if (urlHandler) {
                    // matching handler found; split out returned array elements
                    var matches = urlHandler[0];
                    timeout = urlHandler[2] || timeout;
                    // reassign handler function to urlHandler
                    urlHandler = urlHandler[1];

                    callback = function(){
                        if(def.canceled){ return; }
                        try{
                            var result = urlHandler.apply(service,
                                matches.slice(1).concat([method, ioArgs, hasBody]));
                            def.resolve(result);
                        }catch(e){
                            def.reject(e);
                        }
                    };
                } else {
                    // no match; reject Deferred indicating as such
                    callback = function(){
                        if(def.canceled){ return; }
                        def.reject(new Error("Unhandled URL: " + ioArgs.url));
                    };
                }
                
                if (ioArgs.args.sync === true) {
                    callback();
                } else {
                    setTimeout(callback, timeout);
                }

                return def;
            },
            false,
            true);
    };
    TestService.prototype = {
        unhandledUrl: function(url){
            this.throwError("Unhandled URL: " + url);
        },
        unsupportedMethod: function(method){
            this.throwError("Unsupported method: " + method);
        },
        throwError: function(text){
            throw new Error(text);
        }
    };
    
    return TestService;
});