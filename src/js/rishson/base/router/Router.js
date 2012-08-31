define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/hash",
	"dojo/topic",
	"rishson/base/router/HashParser"
], function (declare, lang, hash, topic, HashParser) {
	/**
	 * @class
	 * @name rishson.router.Router
	 * @description Helper class to validate constructor params
	 */
	return declare('rishson.router.Router', null, {
		_ignoreNextHashChange: false,

		start: function (params) {
			var parser = new HashParser();

			// Listen for manual hash change
			topic.subscribe("/dojo/hashchange", lang.hitch(this, function (hash) {
				if (!this._ignoreNextHashChange) {
					// Run the callback to navigate to the route
					params.navigateToRoute();
				}
				this._ignoreNextHashChange = false;
			}));

			// Sets the hash for the current widget being displayed
			topic.subscribe("hash/update", lang.hitch(this, function (widget) {
				console.log("Setting hash to: " + parser.resolveRoute(widget));
				this._ignoreNextHashChange = true;
				hash(parser.resolveRoute(widget));
			}));
		}
	});
});