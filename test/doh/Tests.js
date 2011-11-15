dojo.provide('test.doh.Tests');

dojo.require('test.doh.control.TestController');
dojo.require('test.doh.control.TestMockTransport');
dojo.require('test.doh.control.TestRequest');
dojo.require('test.doh.control.TestResponse');
dojo.require('test.doh.control.TestRestRequest');
dojo.require('test.doh.control.TestServiceRequest');

doh.registerUrl("AppContainer tests", dojo.moduleUrl("test","doh/view/TestAppContainer.html"), 999999);
doh.registerUrl("_ApplicationWidget tests", dojo.moduleUrl("test","doh/widget/TestApplicationWidget.html"), 999999);

