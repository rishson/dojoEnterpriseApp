define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/hash",
	"dojo/io-query",
	"rishson/base/lang",
	"dojo/_base/array"
], function (declare, lang, hash, ioQuery, rishsonLang, arrayUtil) {
	/**
	 * @class
	 * @name rishson.util._hashParser
	 * @description Provides utility functions for reading and setting the hash
	 */
	return {
		/**
		 * @field
		 * @name rishson.router._hashParser._delimiter
		 * @type {String}
		 * @description The delimiter between hash items
		 */
		_itemDelimiter: "/",

		/**
		 * @field
		 * @name rishson.router._hashParser._paramSplitter
		 * @type {String}
		 * @description The delimiter between the hash item and parameters
		 */
		_paramSplitter: "?",

		/**
		 * @field
		 * @name rishson.router._hashParser._paramItemSplitter
		 * @type {String}
		 * @description The delimiter between the individual parameter items
		 */
		_paramItemSplitter: "&",

		/**
		 * @field
		 * @name rishson.router._hashParser._paramKeyValueSplitter
		 * @type {String}
		 * @description The delimiter between key value pairs in the parameters
		 */
		_paramKeyValueSplitter: "=",

		_stripParameters: function (hashItem) {
			return hashItem.split(this._paramSplitter)[0];
		},

		_castParamsFromCriteria: function (keyedParams, criteria) {
			var resolvedParams = {};

			rishsonLang.forEachObjProperty(keyedParams, function (param, paramName) {
				arrayUtil.forEach(criteria, function (criteriaItem) {
					// Find corresponding criteria object
					if (criteriaItem.paramName === paramName) {
						switch (criteriaItem.paramType) {
						case "string":
							break;
						case "number":
							if (param && !isNaN(param)) {
								param = parseInt(param, 10);
							}
							break;
						case "boolean":
							if (param === "true") {
								param = true;
							} else if (param === "false") {
								param = false;
							}
							break;
						}
						resolvedParams[paramName] = param;
					}
				});
			}, this);

			return resolvedParams;
		},

		/**
		 * @function
		 * @name rishson.router._hashParser.hasChild
		 * @param {rishson.widget._Widget} widget A widget
		 * @description autowire the published topics from the child widget to event handlers on the controller widget.
		 */
		hasChild: function (widget) {
			var hashArray = hash().split(this._itemDelimiter),
				widgetIndex = hashArray.indexOf(widget._routeName);

			// Returns true if the widget is in the hash and has a child
			return (widgetIndex !== -1) && (hashArray[widgetIndex + 1]);
		},

		getChild: function (index) {
			var hashArray = hash().split(this._itemDelimiter);
			if (hashArray[index]) {
				return this._stripParameters(hashArray[index]);
			}
		},

		/**
		 * @function
		 * @name rishson.router._hashParser.getChildName
		 * @param {rishson.widget._Widget} widget A widget
		 * @description 
		 */
		getChildName: function (widget) {
			var hashArray = hash().split(this._itemDelimiter),
				widgetIndex = hashArray.indexOf(widget._routeName);

			return this._stripParameters(hashArray[widgetIndex + 1]);
		},

		/**
		 * @function
		 * @name rishson.router._hashParser.resolveRoute
		 * @param {rishson.widget._Widget} widget A widget
		 * @description Constructs a complete hash that routes to the given widget.
		 * @return {String} The route string.
		 */
		resolveRoute: function (widget, parameters) {
			var hash = "",
				firstPass = true;

			// While we have a parent that can supply a route 
			// we work up the chain to construct the hash
			while (widget && widget._routeName) {
				// If this is our first pass then we need to serialize any parameters
				if (firstPass && parameters) {
					hash = widget._routeName + this._paramSplitter + ioQuery.objectToQuery(parameters);
					firstPass = false;
				} else {
					// Otherwise add this child to the hash
					hash = widget._routeName + this._itemDelimiter + hash;
				}
				widget = widget._parent || null;
			}
			return hash;
		},

		getQueryParameters: function (widget, criteria) {
			var hashParams,
				keyedParams,
				lastChild = this._stripParameters(hash().split(this._itemDelimiter).splice(-1, 1)[0]);

			// Checks if the passed widget is the last child, if it is, then
			// it has access to any parameters present in the URL
			if (widget._routeName === lastChild) {
				hashParams = hash().split(this._paramSplitter)[1];

				if (hashParams) {
					keyedParams = ioQuery.queryToObject(hashParams);

					// Cast the parameters to their required types given in the criteria array
					return this._castParamsFromCriteria(keyedParams, criteria);
				}
			}
		},

		/**
		 * @function
		 * @name rishson.router._hashParser.set
		 * @param {String} newHash The new hash
		 * @description Updates the hash in the browser.
		 */
		set: function (newHash) {
			hash(newHash);
		}
	};
});