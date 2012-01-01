define({
    plugins: [
        { module: "wire/dom" },
        { module: "wire/dojo/dom" }
    ],

    appContainer: {
        create: {
            module: "rishson/view/AppContainer",
            args: [{
                username: "Foo",
                footerText: "Bar"
            }, { $ref: "dom.query!.appContainer", i: 0 }]
        }
    }
});
