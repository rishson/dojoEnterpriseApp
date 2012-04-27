var profile = (function(){
    // This file should not be modified. You probably want to modify build.profile.js.
    var mids = {
        "app/config": 1,
        "app/app.profile": 1,
        "app/package.json": 1
    };
    var testRE = /^app\/tests\//;
    function copyOnly(mid){
        return mid in mids || testRE.test(mid);
    }

    return {
        resourceTags: {
            test: function(filename, mid){
                return testRE.test(mid) || mid == "app/tests";
            },

            copyOnly: function(filename, mid){
                return copyOnly(mid);
            },

            amd: function(filename, mid){
                return !copyOnly(mid) && (/\.js/).test(filename);
            },

            miniExclude: function(filename, mid){
                return false;
            },

            wirespec: function(filename, mid){
                return (/\.spec$/).test(mid);
            },

            compileLess: function(filename, mid){
                return (/\.less$/).test(mid);
            }
        }
    };
})();
