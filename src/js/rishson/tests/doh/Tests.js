define([
    "doh", // for registerUrl
    "require", // for context-sensitive require and toUrl
    "test/doh/control/TestController",
    "test/doh/control/TestMockTransport",
    "test/doh/control/TestRequest",
    "test/doh/control/TestResponse",
    "test/doh/control/TestRestRequest",
    "test/doh/control/TestServiceRequest"
], function(doh, require){
    doh.registerUrl("WidgetInWidgetMixin tests", require.toUrl("./doh/widget/TestWidgetInWidgetMixin.html"), 999999);
    doh.registerUrl("AppContainer tests", require.toUrl("./doh/view/TestAppContainer.html"), 999999);
    doh.registerUrl("_ApplicationWidget tests", require.toUrl("./doh/widget/TestApplicationWidget.html"), 999999);
});