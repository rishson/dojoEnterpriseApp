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
		_ignoreThisHasChange: false,

		start: function (params) {
			var parser = new HashParser();

			// Listen for manual hash change
			topic.subscribe("/dojo/hashchange", lang.hitch(this, function (hash) {
				if (this._ignoreThisHasChange) {
					this._ignoreThisHasChange = false;
				} else {
					// Run the callback to navigate to the route
					params.navigateToRoute();
				}
			}));

			// Sets the hash for the current widget being displayed
			topic.subscribe("hash/update", lang.hitch(this, function (widget) {
				this._ignoreThisHasChange = true;
				hash(parser.resolveRoute(widget));
			}));
		}
	});
});