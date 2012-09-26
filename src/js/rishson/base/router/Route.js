define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"rishson/base/lang",
	"rishson/util/ObjectValidator",
	"dojo/topic",
	"rishson/base/router/_hashParser"
], function (declare, lang, arrayUtil, rishsonLang, Validator, topic, parser) {
	/**
	 * @class
	 * @name rishson.base.router.Route
	 * @description Defines a single route for a widget
	 */
	return declare('rishson.base.router.Route', null, {
		/**
		 * @field
		 * @name rishson.base.router.Route._widget
		 * @type {rishson.widget._Widget}
		 * @description The widget that this route belongs to
		 */
		_widget: null,

		/**
		 * @field
		 * @name rishson.base.router.Route._displayFn
		 * @type {Function}
		 * @description A function that displays the widget to the end user
		 */
		_displayFn: null,

		/**
		 * @field
		 * @name rishson.base.router.Route._routeName
		 * @type {String}
		 * @description Used in the URL to define the path to this widget
		 */
		_routeName: null,

		/**
		 * @field
		 * @name rishson.base.router.Route._parent
		 * @type {rishson.widget._Widget}
		 * @description The parent widget for the widget that this route represents
		 */
		_parent: null,

		/**
		 * @field
		 * @name rishson.base.router.Route._options
		 * @type {Object}
		 * @description A hash of options for this route
		 */
		_options: null,

		/**
		 * @field
		 * @name rishson.base.router.Route._parameterCriteria
		 * @type {Array}
		 * @description The criteria for any corresponding query string parameters
		 */
		_parameterCriteria: null,

		/**
		 * @constructor
		 */
		constructor: function (routeParams) {
			this._widget = routeParams.widget;
			this._displayFn = routeParams.display;
			this._routeName = routeParams.routeName;
			this._parent = routeParams.parent;
			this._options = routeParams.options || {};
			this._parameterCriteria = routeParams.parameters;

			// Augment widget with router related members
			this._widget._parent = this._parent;
			this._widget._routeName = this._routeName;

			// If this widget is the default
			if (this._options.isDefault) {
				// Ensure no more than one default view is set
				if (this._parent._defaultRoute) {
					throw new Error("Tried to set default view as " + this._routeName + " but already set with " + this._parent._defaultRoute);
				}
				this._parent._defaultRoute = this._routeName;
			}
		},

		/**
		 * @function
		 * @name rishson.base.router.Route.display
		 * @param {Object} routeParameters Any programmatically passed parameters
		 * @description Called whenever a widget needs displaying to the end user.
		 * Before running the users actual display function, the current route is checked for a child.
		 * If a child is found then display is called on it first.
		 * @return {?} Any return values that are returned by the native display function.
		 */
		display: function (routeParameters) {
			// Check if there is a child in the URL
			if (parser.hasChild(this._widget)) {
				var childName = parser.getChildName(this._widget);

				// Check if this widget contains the child
				rishsonLang.forEachObjProperty(this._widget.routes, function (route) {
					if (route.getRouteName() === childName) {
						route.display();
					}
				}, this);
			} else {
				// Else we are at the end of the routing chain
				// If parameters weren't given programmatically then
				// we try and get them from the URL
				routeParameters = routeParameters || parser.getQueryParameters(this._widget, this._parameterCriteria);

				// Display a default view if one exists
				if (this._widget._defaultRoute) {
					// Find matching view
					rishsonLang.forEachObjProperty(this._widget.routes, function (route) {
						if (route.getRouteName() === this._widget._defaultRoute) {
							route.display();
						}
					}, this);
				} else {
					// Stash the current hash as a parameter if we need to
					if (this._options.stashExisting && parser.get()) {
						routeParameters = routeParameters || {};
						routeParameters.redirectTo = parser.get();
					}
					// Nothing more to do, update the route
					topic.publish("route/update", {
						widget: this._widget,
						parameters: routeParameters
					});
				}
			}

			// If validation passed, or we don't need to validate
			if (this._options.suppressValidation || this._validate(routeParameters)) {
				// Call the users display function to actually display the widget
				return this._displayFn.call(this._parent, routeParameters, this._widget);
			} else if (!this._options.suppressValidation) {
				// Validation failed
				console.error("Route: " + parser.resolveRoute(this._widget) +
					" was passed parameters: ", routeParameters,
					" but expected criteria: ", this._parameterCriteria);
			}
		},

		/**
		 * @function
		 * @name rishson.base.router.Route._validate
		 * @private
		 * @param {Object} routeParameters The parameters to validate
		 * @description Validates the routeParameters.
		 * @return {Boolean} Denotes whether validation has passed or failed.
		 */
		_validate: function (routeParameters) {
			if (this._parameterCriteria && routeParameters) {
				var validatorCriteria = this._stripNonRequiredCriteria(routeParameters, this._parameterCriteria),
					validator = new Validator(validatorCriteria);
				return validator.validate(routeParameters);
			} else if (!this._parameterCriteria) {
				return true;
			}
			return false;
		},

		/**
		 * @function
		 * @name rishson.base.router.Route._stripNonRequiredCriteria
		 * @private
		 * @param {Object} parameters The key value parameter pairs
		 * @param {Array} criteria The parameter criteria
		 * @description Helper function that strips any criteria which do not have matching
		 * parameter items and are not forcibly required. The result is passed to the ObjectValidator
		 * @return {Array} The stripped criteria.
		 */
		_stripNonRequiredCriteria: function (parameters, criteria) {
			var required = [];

			// Loop through criteria items
			arrayUtil.forEach(criteria, function (criteriaItem) {
				var pushed = false;
				// Find matching parameter
				rishsonLang.forEachObjProperty(parameters, function (param, paramName) {
					// If we have a parameter for this criteria
					// Then we need to validate it
					if (criteriaItem.paramName === paramName) {
						required.push(criteriaItem);
						pushed = true;
					}
				});
				// If we have not already pushed this criteriaItem item
				// Yet it 'required' then we need to validate it
				if (!pushed && criteriaItem.required) {
					required.push(criteriaItem);
				}
			});
			return required;
		},

		/**
		 * @function
		 * @name rishson.base.router.Route.getRouteName
		 * @private
		 * @description Returns the route name for this route.
		 * @return {String} The route name.
		 */
		getRouteName: function () {
			return this._routeName;
		}
	});
});