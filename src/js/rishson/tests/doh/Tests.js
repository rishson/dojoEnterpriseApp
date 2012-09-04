define([
	"doh", // for registerUrl
	"require", // for context-sensitive require and toUrl
	"rishson/tests/doh/control/TestDispatcher",
	"rishson/tests/doh/control/TestLoginResponse",
	"rishson/tests/doh/control/TestMockTransport",
	"rishson/tests/doh/control/TestRequest",
	"rishson/tests/doh/control/TestResponse",
	"rishson/tests/doh/control/TestRestRequest",
	"rishson/tests/doh/control/TestServiceRequest",
	"rishson/tests/doh/util/TestObjectValidator",
	"rishson/tests/doh/base/router/TestRouter",
	"rishson/tests/doh/base/router/TestRoute"
], function (doh, require) {
	doh.registerUrl("AppContainer tests", require.toUrl("./view/TestAppContainer.html"), 999999);
});