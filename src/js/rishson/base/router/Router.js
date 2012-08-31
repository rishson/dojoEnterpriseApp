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
		_lastSilentSetHash: "",

		start: function (params) {
			var parser = new HashParser();

			// Listen for manual hash change
			topic.subscribe("/dojo/hashchange", lang.hitch(this, function (hash) {
				if (hash !== this._lastSilentSetHash) {
					// Run the callback to navigate to the route
					params.navigateToRoute();
				}
			}));

			// Silently updates the hash that links to the supplied widget
			topic.subscribe("hash/update", lang.hitch(this, function (widget) {
				var newHash = parser.resolveRoute(widget);
				this._lastSilentSetHash = newHash;

				hash(newHash);
			}));
		}
	});
});