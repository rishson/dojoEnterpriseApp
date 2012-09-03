define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"rishson/base/lang",
	"rishson/util/ObjectValidator",
	"dojo/topic",
	"rishson/base/router/_hashParser"
], function (declare, lang, rishsonLang, Validator, topic, parser) {
	/**
	 * @class
	 * @name rishson.base.router.Route
	 * @description A route object that wraps a widget
	 */
	return declare('rishson.base.router.Router', null, {
		_widget: null,

		_displayFn: null,

		_routeName: null,

		_parent: null,

		_options: null,

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
					// Nothing more to do, update the route
					topic.publish("route/update", {
						widget: this._widget,
						parameters: routeParameters
					});
				}
			}

			// Finally we call the users display function to actually display the widget
			// Called in the parents scope to eliminate the need for scope hitching
			// The parameters are validated first
			if (this._validate(routeParameters)) {
				return this._displayFn.call(this._parent, routeParameters, this._widget);
			}
		},

		_validate: function (routeParameters) {
			if (this._parameterCriteria && routeParameters) {
				return new Validator(this._parameterCriteria).validate(routeParameters);
			} else if (!this._parameterCriteria) {
				return true;
			} else {
				return false;
			}
		},

		getRouteName: function () {
			return this._routeName;
		}
	});
});