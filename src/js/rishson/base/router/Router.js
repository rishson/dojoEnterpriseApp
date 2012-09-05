define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/topic",
	"rishson/base/router/_hashParser"
], function (declare, lang, topic, parser) {
	/**
	 * @class
	 * @name rishson.base.router.Router
	 * @description Router
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
		 * @description A function executed every time the route changes
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
		 * @description autowire the published topics from the child widget to event handlers on the controller widget.
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
		},

		testParser: function () {
			return parser.getChild(0);
		}
	});
});