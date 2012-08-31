define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/hash"
], function (declare, lang, hash) {
	/**
	 * @class
	 * @name rishson.util.HashParser
	 * @description Helper class to validate constructor params
	 */
	return declare('rishson.util.HashParser', null, {
		delimiter: "/",

		hasChild: function (widget) {
			var thisRouteName = this._extractRouteName(widget);

			var hashArray = hash().split("/"),
				parentIndex = hashArray.indexOf(thisRouteName);

			// If parent is in hash
			if (parentIndex !== -1) {
				// And an element exists after the parent
				if (parentIndex < hashArray.length) {
					// And it is valid
					if (hashArray[parentIndex + 1]) {
						return true;
					}
				}
			}
			return false;
		},

		getChildName: function (widget) {
			if (this.hasChild(widget)) {
				var hashArray = hash().split("/"),
					thisRouteName = this._extractRouteName(widget),
					parentIndex = hashArray.indexOf(thisRouteName);

				return hashArray[parentIndex + 1];
			}
		},

		resolveRoute: function (widget) {
			var hash = "";

			// While we have a parent we work up the chain to create the hash
			while (widget && this._extractRouteName(widget)) {
				hash = this._extractRouteName(widget) + this.delimiter + hash;
				widget = widget._parent || null;
			}
			return hash;
		},

		_extractRouteName: function (widget) {
			return widget._routeName;
		}
	});
});