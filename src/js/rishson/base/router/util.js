define([
	"dojo/_base/declare",
	"dojo/topic",
	"rishson/base/lang",
	"rishson/base/router/_hashParser"
], function (declare, topic, rishsonLang, parser) {
	/**
	 * @class
	 * @name rishson.router.util
	 * @description Helper functions for router related tasks
	 */
	return {
		/**
		 * @function
		 * @name rishson.router.Router.makeRoutable
		 * @param {Object} A widget
		 * @description Augments a widget to become 'routable'. This essentially creates a display
		 * function on the widget which should be used to display the widget
		 */
		makeRoutable: function (params) {
			var widget = params.widget,
				displayFn = params.display,
				routeName = params.routeName,
				parent = params.parent,
				options = params.options || {};

			// Augment widget with router related members
			widget._parent = parent;
			widget._routeName = routeName;

			// If this widget is the default
			if (options.isDefault) {
				// Ensure no more than one default view is set
				if (parent._defaultRoute) {
					throw new Error("Tried to set default view as " + routeName + " but already set with " + parent._defaultRoute);
				}
				parent._defaultRoute = routeName;
			}

			// Create widgets display function
			widget.display = function () {
				// Check if there is a child in the URL
				// If there is and the widget contains the child, then we display it
				if (parser.hasChild(widget)) {
					var childName = parser.getChildName(widget);

					// Find matching view
					rishsonLang.forEachObjProperty(widget.views, function (view) {
						if (view._routeName === childName) {
							view.display();
						}
					});
				} else {
					// Else we are at the end of the routing chain
					// Display a default view if one exists
					if (widget._defaultRoute) {
						// Find matching view
						rishsonLang.forEachObjProperty(widget.views, function (view) {
							if (view._routeName === widget._defaultRoute) {
								view.display();
							}
						}
					} else {
						// Nothing more to do, update the route
						topic.publish("route/update", widget);
					}
				}

				// Finally we call the users display function to actually display the widget
				// Called in the parents scope to eliminate the need for scope hitching
				return displayFn.call(parent);
			};
		}
	};
});