define([
	"doh", // for registerUrl
	"require", // for context-sensitive require and toUrl
	"rishson/tests/doh/control/TestController",
	"rishson/tests/doh/control/TestMockTransport",
	"rishson/tests/doh/control/TestRequest",
	"rishson/tests/doh/control/TestResponse",
	"rishson/tests/doh/control/TestRestRequest",
	"rishson/tests/doh/control/TestServiceRequest"
], function (doh, require) {
	doh.registerUrl("WidgetInWidgetMixin tests", require.toUrl("./widget/TestWidgetInWidgetMixin.html"), 999999);
	doh.registerUrl("AppContainer tests", require.toUrl("./view/TestAppContainer.html"), 999999);
	doh.registerUrl("_ApplicationWidget tests", require.toUrl("./widget/TestApplicationWidget.html"), 999999);
});
