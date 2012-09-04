define([
	"doh",
	"dojo/_base/lang",
	"dojo/topic",
	"rishson/base/router/Router"
], function (doh, lang, topic, Router) {
	doh.register("Router tests", [
		{
			name: "Can instantiate with valid constructor parameters",
			runTest: function () {
				var router = new Router({
					onRouteChange: function () {}
				});
				doh.assertTrue(router);
			}
		},
		{
			name: "Throws error on invalid constructor parameters",
			runTest: function () {
				var thrown = false;

				try {
					var router = new Router();
				} catch (e) {
					thrown = true;
				}

				doh.assertTrue(thrown);
			}
		},
		{
			name: "start subscribes to route change event and executes callback on route change",
			runTest: function () {
				// Arrange
				var mockChange = "changeEvent",
					deferred = new doh.Deferred(),
					called = false,
					router = new Router({
						onRouteChange: lang.hitch(this, function () {
							called = true;
						})
					});
				router._routeChangeEvent = mockChange;

				// Act
				router.start();
				topic.publish(mockChange);

				// Assert
				setTimeout(deferred.getTestCallback(function () {
					doh.assertTrue(called);
				}), 125);

				return deferred;
			}
		}
	]);
});