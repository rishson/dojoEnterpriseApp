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
	 * @name rishson.base.router._hashParser
	 * @description Provides utility functions for reading and setting the hash.
	 * The general idea of the parser is that it provides an API to deal with
	 * Widgets as opposed to Strings.
	 */
	return {
		/**
		 * @field
		 * @name rishson.base.router._hashParser._delimiter
		 * @type {String}
		 * @description The delimiter between hash items
		 */
		_itemDelimiter: "/",

		/**
		 * @field
		 * @name rishson.base.router._hashParser._paramSplitter
		 * @type {String}
		 * @description The delimiter between the hash item and parameters
		 */
		_paramSplitter: "?",

		/**
		 * @field
		 * @name rishson.base.router._hashParser._paramItemSplitter
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

		/**
		 * @function
		 * @name rishson.router._hashParser._stripParameters
		 * @private
		 * @description Strips any parameters from a single hash item
		 */
		_stripParameters: function (hashItem) {
			return hashItem.split(this._paramSplitter)[0];
		},

		/**
		 * @function
		 * @name rishson.router._hashParser._castParamsFromCriteria
		 * @private
		 * @description Casts the given parameters to their types as defined in the
		 * criteria array. Any parameters that aren't defined in the criteria are ignored.
		 * @param {Object} keyedParams The parsed URL parameters ready for casting
		 * @param {Array} criteria A collection of criteria objects describing each parameters data type
		 * @return A hash of cast parameters
		 */
		_castParamsFromCriteria: function (keyedParams, criteria) {
			var resolvedParams = {};

			rishsonLang.forEachObjProperty(keyedParams, function (param, paramName) {
				arrayUtil.forEach(criteria, function (criteriaItem) {
					// Find corresponding criteria object
					if (criteriaItem.paramName === paramName) {
						switch (criteriaItem.paramType) {
						case "array":
							// If ioQuery saw one item then it didn't create an array
							// We need to do this manually
							if (lang.isString(param)) {
								param = [param];
							}
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
		 * @description Returns a boolean denoting whether the widget contains a child in the hash.
		 */
		hasChild: function (widget) {
			var hashArray = hash().split(this._itemDelimiter),
				widgetIndex = hashArray.indexOf(widget._routeName);

			// Returns true if the widget is in the hash and has a child
			return (widgetIndex !== -1) && (hashArray[widgetIndex + 1]);
		},

		/**
		 * @function
		 * @name rishson.base.router._hashParser.getChild
		 * @param {Number} index A zero based index denoting the child to retrieve
		 * @description Returns the name of a hashItem child at a given index.
		 */
		getChild: function (index) {
			var hashArray = hash().split(this._itemDelimiter);
			if (hashArray[index]) {
				return this._stripParameters(hashArray[index]);
			}
		},

		/**
		 * @function
		 * @name rishson.base.router._hashParser.getChildName
		 * @param {rishson.widget._Widget} widget A widget
		 * @description Gets the name of a hashItem child of a given widget.
		 */
		getChildName: function (widget) {
			var hashArray = hash().split(this._itemDelimiter),
				widgetIndex = hashArray.indexOf(widget._routeName);

			return this._stripParameters(hashArray[widgetIndex + 1]);
		},

		/**
		 * @function
		 * @name rishson.base.router._hashParser.resolveRoute
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

		/**
		 * @function
		 * @name rishson.base.router._hashParser.getQueryParameters
		 * @param {rishson.widget._Widget} widget A widget
		 * @param {Array} criteria The criteria used to parse the hash items
		 * @description Parses any query string parameters for a given widget and casts
		 * them to their types as defined in the criteria array.
		 * @return {Object} A hash of type-cast query parameters.
		 */
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
		 * @name rishson.base.router._hashParser.set
		 * @param {String} newHash The new hash
		 * @description Updates the hash in the browser.
		 */
		set: function (newHash) {
			hash(newHash);
		},

		/**
		 * @function
		 * @name rishson.base.router._hashParser.get
		 * @description Returns the hash.
		 */
		get: function () {
			return hash();
		}
	};
});