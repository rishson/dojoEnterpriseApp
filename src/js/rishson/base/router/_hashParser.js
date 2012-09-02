define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/hash"
], function (declare, lang, hash) {
	/**
	 * @class
	 * @name rishson.util._hashParser
	 * @description Provides utility functions for reading and setting the hash
	 */
	return {
		/**
		 * @field
		 * @name rishson.router._hashParser.delimiter
		 * @type {String}
		 * @description The hash delimiter
		 */
		delimiter: "/",

		/**
		 * @function
		 * @name rishson.router._hashParser.hasChild
		 * @param {rishson.widget._Widget} A widget
		 * @description autowire the published topics from the child widget to event handlers on the controller widget.
		 */
		hasChild: function (widget) {
			var hashArray = hash().split(this.delimiter),
				widgetIndex = hashArray.indexOf(this._extractRouteName(widget));

			// Returns true if the widget is in hash and has a child
			return (widgetIndex !== -1) && (hashArray[widgetIndex + 1]);
		},

		/**
		 * @function
		 * @name rishson.router._hashParser.getChildName
		 * @param {rishson.widget._Widget} A widget
		 * @description 
		 */
		getChildName: function (widget) {
			var hashArray = hash().split(this.delimiter),
				widgetIndex = hashArray.indexOf(this._extractRouteName(widget));

			return hashArray[widgetIndex + 1];
		},

		/**
		 * @function
		 * @name rishson.router._hashParser.resolveRoute
		 * @param {rishson.widget._Widget} A widget
		 * @description Constructs a complete hash that routes to the given widget.
		 * @return {String} The route string.
		 */
		resolveRoute: function (widget) {
			var hash = "";

			// While we have a parent that can supply a route 
			// we work up the chain to construct the hash
			while (widget && this._extractRouteName(widget)) {
				hash = this._extractRouteName(widget) + this.delimiter + hash;
				widget = widget._parent || null;
			}
			return hash;
		},

		/**
		 * @function
		 * @name rishson.router._hashParser.set
		 * @param {String} The new hash
		 * @description Updates the hash in the browser.
		 */
		set: function (newHash) {
			hash(newHash);
		},

		/**
		 * @function
		 * @name rishson.router._hashParser._extractRouteName
		 * @private
		 * @param {rishson.widget._Widget} A widget
		 * @description Returns a given widgets route name.
		 * @return {String} The widgets route name.
		 */
		_extractRouteName: function (widget) {
			return widget._routeName;
		}
	}
});