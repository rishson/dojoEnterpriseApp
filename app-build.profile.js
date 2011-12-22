var profile = {
    // Be sure that dojo.js includes "wire" and the base
    // application container. Most of the time, this will
    // be "rishson/view/AppContainer".
    // Wire.js specs need to be named *.spec.js in order
    // to be transformed into their own layer automatically.
    layers: {
        "dojo/dojo": {
            include: [
                "wire",
                "wire/domReady",
                "rishson/view/AppContainer"
            ]
        }
    },
    selectorEngine: "acme",
    compressLess: true,
    optimize: "shrinksafe",
    stripConsole : "normal",
    layerOptimize : "shrinksafe",
    cssOptimize : "comments",
    copyTests : false,
    mini: true,

    // DO NOT MODIFY ANYTHING AFTER THIS LINE.
    // This is adapted from the original buildscript, to add considerations for
    // LESS and wire.js
    packages: [
        { name: "when", location: "when", main: "when", resourceTags: {
            test: function(filename, mid){
                return (/^when\/test\//).test(mid) || mid == "when/test";
            },
            amd: function(filename, mid){
                return mid == "when/when" || mid == "when";
            },
            copyOnly: function(filename, mid){
                return mid == "when/package.json";
            }
        } },
        { name: "aop", location: "aop", main: "aop", resourceTags: {
            test: function(filename, mid){
                return (/^aop\/test\//).test(mid) || mid == "aop/test";
            },
            amd: function(filename, mid){
                return mid == "aop/aop" || mid == "aop";
            },
            copyOnly: function(filename, mid){
                return mid == "aop/package.json";
            }
        } },
        { name: "build", location: "util/build" }
    ],
    transforms: {
        wirespec: [ "rishson/build/wirespec", "ast" ],
        compileLess: [ "rishson/build/compileLess", "optimize" ]
    },
    transformJobs:[[
            // immediately filter the stuff to not be transformed in any way
            function(resource, bc) {
                return (bc.mini && resource.tag.miniExclude) || (!bc.copyTests && resource.tag.test) || (resource.tag.ignore);
            },
            []
        ],[
            // if the tag says just copy, then just copy
            function(resource) {
                return resource.tag.copyOnly;
            },
            ["copy"]
        ],[
            // the synthetic report module
            function(resource) {
                return resource.tag.report;
            },
            ["dojoReport", "insertSymbols", "report"]
        ],[
            // dojo.js, the loader
            function(resource, bc) {
                if (resource.mid=="dojo/dojo") {
                    bc.loader= resource;
                    resource.boots= [];
                    // the loader is treated as an AMD module when creating the "dojo" layer, but and AMD dependency scan won't
                    // work because it's not an AMD module; therefore, initialize deps here and make sure not to do the depsScan transform
                    resource.deps= [];
                    bc.amdResources[resource.mid]= resource;
                    return true;
                }
                return false;
            },
            ["read", "dojoPragmas", "hasFindAll", "hasFixup", "writeDojo", "writeOptimized"]
        ],[
            // package has module
            function(resource, bc) {
                if ((/^\w+\/has$/).test(resource.mid)) {
                    bc.amdResources[resource.mid]= resource;
                    return true;
                }
                return false;
            },
            ["read", "dojoPragmas", "hasFindAll", "hasFixup", "depsScan", "writeAmd", "writeOptimized", "hasReport", "depsDump"]
        ],[
            // nls resources
            function(resource, bc) {
                if ((/\/nls\//).test(resource.mid) ||   (/\/nls\/.+\.js$/).test(resource.src)) {
                    resource.tag.nls= 1;
                    bc.amdResources[resource.mid]= resource;
                    return true;
                }
                return false;
            },
            ["read", "dojoPragmas", "hasFindAll", "hasFixup", "depsScan", "writeAmd"]
        ],[
            // synthetic AMD modules (used to create layers on-the-fly
            function(resource, bc) {
                if (resource.tag.synthetic && resource.tag.amd){
                    bc.amdResources[resource.mid]= resource;
                    return true;
                }
                return false;
            },
            // just like regular AMD modules, but without a bunch of unneeded transforms
            ["depsScan", "writeAmd", "writeOptimized"]
        ],[
            // synthetic dojo/loadInit! resources
            // FIXME: can't this be added to the previous transform?
            function(resource, bc) {
                if (resource.tag.loadInitResource){
                    bc.amdResources[resource.mid]= resource;
                    return true;
                }
                return false;
            },
            // just like regular AMD modules (the next transform job), but without a bunch of unneeded transforms
            ["writeAmd", "writeOptimized"]
        ],[
            // AMD module:
            // already marked as an amd resource
            // ...or...
            // not dojo/dojo.js (filtered above), not package has module (filtered above), not nls bundle (filtered above), not test or building test, not build control script or profile script but still a Javascript resource...
            function(resource, bc) {
                if (resource.tag.amd || ((/\.js$/).test(resource.src) && (!resource.tag.test || bc.copyTests=="build") && !(/\.(bcs|profile)\.js$/).test(resource.src))) {
                    bc.amdResources[resource.mid]= resource;
                    return true;
                }
                return false;
            },
            ["read", "dojoPragmas", "hasFindAll", "insertSymbols", "hasFixup", "wirespec", "depsScan", "writeAmd", "writeOptimized"]
        ],[
            // a test resource; if !bc.copyTests then the resource was filtered in the first item; otherwise, if the resource is a potential module and building tests, then it was filtered above;
            function(resource, bc) {
                return resource.tag.test;
            },
            ["read", "dojoPragmas", "write"]
        ],[
            // html file; may need access contents for template interning and/or dojoPragmas; therefore, can't use copy transform
            function(resource, bc) {
                return (/\.(html|htm)$/).test(resource.src);
            },
            ["read", "dojoPragmas", "write"]
        ],[
            function(resource, bc){
                return resource.tag.compileLess;
            },
            ["read", "compileLess", "write"]
        ],[
            // css that are designated to compact
            function(resource, bc) {
                return (/\.css$/).test(resource.src);
            },
            ["read", "optimizeCss", "write"]
        ],[
            // just copy everything else except tests which were copied above iff desired...
            function(resource) {
                return !resource.tag.test;
            },
            ["copy"]
        ]
    ]
};
