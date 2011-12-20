define([
    "dojo/_base/Deferred",
    "dojo/store/Memory",
    "dojo/store/Observable",
    "dojo/store/util/QueryResults"
], function(Deferred, Memory, Observable, QueryResults){
    return function(options){
        // In addition to options already supported by dojo/store/Memory
        // (i.e. data and idProperty), the following options are supported:
        // * observable: if set to true, the resulting store will be wrapped
        //   with dojo/store/Observable.
        // * async: if set to true, the store's get, put, add, remove, and query
        //   methods will be wrapped in timeouts to behave asynchronously.
        //   Otherwise, the store will behave like a normal Memory store.
        //   This option can be set to a number to dictate the timeout interval.
        
        var options = options || {},
            store = new Memory(options),
            async = options.async,
            wrapMethods, timeout, i, curr;
        
        function asyncWrap(funcName) {
            var origFunc = store[funcName];
            return function(/* arguments... */){
                var dfd, timer,
                    result = origFunc.apply(store, arguments);
                
                dfd = new Deferred(function(){
                    clearTimeout(timer); // cancel timeout from canceler function
                });
                timer = setTimeout(function(){
                    dfd.resolve(result);
                }, timeout);
                return dfd.promise;
            };
        }
        
        function asyncQueryWrap(funcName){
            var origFunc = store[funcName];
            return function(/* arguments... */){
                var dfd, totalDfd, timer,
                    results = origFunc.apply(store, arguments),
                    promise;
                
                // timeout-canceling function, for Deferred cancelers
                function cancelTimer(){ clearTimeout(timer); }
                
                dfd = new Deferred(cancelTimer);
                totalDfd = new Deferred(cancelTimer);
                
                timer = setTimeout(function(){
                    dfd.resolve(results);
                    totalDfd.resolve(results.total);
                }, timeout);
                
                // wrap promise from Deferred in QueryResults
                promise = QueryResults(dfd.promise);
                // re-add total property, using promise
                promise.total = totalDfd.promise;
                // re-add observe method if it exists
                if (results.observe) {
                    promise.observe = results.observe;
                }
                return promise;
            };
        }
        
        (function(){
            // This immediately-executed function addresses an issue which
            // makes it difficult if not impossible to discern autogenerated IDs
            // on Memory store items via observe handlers.
            // This will be fixed in Dojo 1.8 and possibly a future 1.7 patch.
            var origFunc = store.add;
            store.add = function(){
                var id = origFunc.apply(store, arguments),
                    item = this.data[this.index[id]],
                    idProperty = this.idProperty;
                
                // ensure ID is actually reflected in new item
                if (typeof item[idProperty] == "undefined") {
                    item[idProperty] = id;
                }
                return id;
            };
        })();
        
        if (async) {
            // grab timeout from async setting, or default to 250ms
            timeout = typeof async == "number" ? async : 250;
            
            // wrap get/put/remove (add goes through put, so it's covered)
            wrapMethods = ["get", "put", "remove"];
            for (i = wrapMethods.length; i--;) {
                curr = wrapMethods[i];
                store[curr] = asyncWrap(curr);
            }
            
            // query is a bit special, since it will have members hanging off
            // the return.
            store.query = asyncQueryWrap("query");
        }
        
        if (options.observable) {
            store = Observable(store);
        }
        
        return store;
    };
});