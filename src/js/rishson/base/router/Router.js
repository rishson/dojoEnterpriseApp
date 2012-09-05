define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/topic",
	"rishson/base/router/_hashParser"
], function (declare, lang, topic, parser) {
	/**
	 * @class
	 * @name rishson.base.router.Router
	 * @description Used to start the router for an implementing class. There must be only
	 * one instance of Router per application.
	 */
	return declare('rishson.base.router.Router', null, {
		/**
		 * @field
		 * @name rishson.base.router.Router._routeChangeEvent
		 * @type {String}
		 * @private
		 * @description The event to subscribe to when the route changes
		 */
		_routeChangeEvent: "/dojo/hashchange",

		/**
		 * @field
		 * @name rishson.base.router.Router._routeUpdateEvent
		 * @type {String}
		 * @private
		 * @description The event to subscribe to when the route needs to be updated
		 */
		_routeUpdateEvent: "route/update",

		/**
		 * @field
		 * @name rishson.base.router.Router._lastRoute
		 * @type {String}
		 * @private
		 * @description The most recent silently-set route.
		 * This is used to suppress the event that this change created
		 */
		_lastRoute: null,

		/**
		 * @field
		 * @name rishson.base.router.Router._onRouteChange
		 * @type {Function}
		 * @private
		 * @description A function executed every time the route changes manually. This must be passed in
		 * to the constructor. The function should kick start the routing change by calling display on the
		 * first item in the new route.
		 */
		_onRouteChange: null,

		/**
		 * @constructor
		 */
		constructor: function (params) {
			if (lang.isFunction(params.onRouteChange)) {
				this._onRouteChange = params.onRouteChange;
			} else {
				throw new Error("No function: onRouteChange");
			}
		},

		/**
		 * @function
		 * @name rishson.base.router.Router.start
		 * @description Starts up the router listening on the silent route update and route changed topics.
		 * This should be only ever be called once as subscriptions are application-wide.
		 */
		start: function () {
			// On route change
			// Called when the URL is manually changed in the browser
			topic.subscribe(this._routeChangeEvent, lang.hitch(this, function (route) {
				if (route !== this._lastRoute) {
					this._onRouteChange(parser.getChild(0));
				}
			}));

			// On route update
			// Called by the application wanting to silently update the URL
			topic.subscribe(this._routeUpdateEvent, lang.hitch(this, function (params) {
				var route = parser.resolveRoute(params.widget, params.parameters);
				this._lastRoute = route;
				parser.set(route);
			}));
		}
	});
});