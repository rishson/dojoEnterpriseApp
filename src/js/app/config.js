var dojoConfig = {
    baseUrl: "js/",
    async: true,
    isDebug: true,
    tlmSiblingOfDojo: false,
    aliases: [
        ["domReady", "dojo/domReady"]
    ],
    packages: [
        { name: "dojo", location: "dojo" },
        { name: "dijit", location: "dijit" },
        { name: "dojox", location: "dojox" },
        { name: "doh", location: "util/doh" },
        { name: "when", location: "when", main: "when" },
        { name: "aop", location: "aop", main: "aop" },
        { name: "wire", location: "wire", main: "wire" },
        { name: "rishson", location: "rishson" },
        { name: "app", location: "app" }
    ],
    deps: [ "wire!app/loader.spec" ]
};
