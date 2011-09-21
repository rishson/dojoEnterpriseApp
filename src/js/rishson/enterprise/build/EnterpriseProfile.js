/*All layers have an implicit dependency on dojo.js.

Normally you should not specify a layer object for dojo.js, as it will
be built by default with the right options. Custom dojo.js files are
possible, but not recommended for most apps.*/
dependencies = {
    stripConsole : "normal",
    optimize : "shrinksafe",
    /*layerOptimize : "shrinksafe.keepLines",*/
    layerOptimize : "shrinksafe",
    cssOptimize : "comments",
    copyTests : false,
    mini : true,
    layers : [
        {
            // where the output file goes, relative to the dojo dir
            name : "../../../../release/rishson/enterprise/enterprise.js",

            //what the module's name will be, i.e., what gets generated for dojo.provide(<name here>);
            //resourceName : "dijit.dijit",

            // modules not to include code for
            layerDependencies : [
            ],

            // modules to use as the "source" for this layer
            dependencies : [
                "rishson.enterprise.build.EnterpriseDeps"
            ]
        }
    ],

    prefixes: [
        // the system knows where to find the "dojo/" directory, but we
        // need to tell it about everything else. Directories listed here
        // are, at a minimum, copied to the build directory.
        [ "dijit", "../dijit" ],
        [ "dojox", "../dojox" ],
        [ "rishson", "../../../rishson" ]
    ]
};