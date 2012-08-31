define([
	"dojo/_base/declare", // declare
	"dojo/topic",	//subscribe
	"rishson/Base", //createTopicNamespace, _capitaliseTopicName
	"rishson/widget/_Widget", //mixin
	"rishson/control/_Controller", //mixin
	"dojo/_base/lang", //isArray
	"dojo/store/Observable",	//constructor
	"rishson/base/router/HashParser"
], function (declare, topic, Base, _Widget, _Controller, lang, Observable, HashParser) {
	/**
	 * @class
	 * @name rishson.control.ControllerWidget
	 * @description This widget can be extended to provide a module that acts as a 'Controller' (in MVC terms) and a
	 * place to do child widget layout and event handling. Whilst this is a less strict separation of concerns that using
	 * _Controller and _Widget directly (because your controller is DOM-aware), this base class does simplify application
	 * dramatically. Additionally, this is a very 'dojo' way of doing things because a widget is the basic module
	 * pattern of dojo.
	 */
	return declare("rishson.control.ControllerWidget", [Base, _Widget, _Controller], {
		/**
		 * @field
		 * @name rishson.control.ControllerWidget.models
		 * @type {Object}
		 * @description a collection of all the injected models
		 */
		models: null,

		/**
		 * @field
		 * @name rishson.control.ControllerWidget.views
		 * @type {Object}
		 * @description a collection of all the injected views
		 */
		views: null,

		/**
		 * @field
		 * @name rishson.control.ControllerWidget.controllers
		 * @type {Object}
		 * @description a collection of all the injected controllers
		 */
		controllers: null,

		/**
		 * @constructor
		 */
		constructor: function () {
			this.models = {};
			this.views = {};
			this.controllers = {};
			this.parser = new HashParser();
		},

		/**
		 * @function
		 * @name rishson.control.ControllerWidget.postCreate
		 * @override rishson.widget._Widget
		 */
		postCreate: function () {
			this.inherited(arguments);
		},

		/**
		 * @function
		 * @name rishson.control.ControllerWidget.addView
		 * @param {Object|rishson.widget._Widget} view a widget
		 */
		addView : function (params) {
			var view = params.widget,
				name = params.name,
				routeName = params.routeName || name,
				options = params.options || {},
				displayFn = params.display;

			this.views[name] = view;
			view._parent = this;
			view._routeName = routeName;

			// Set the default view for this controller if it was given
			if (options.isDefault) {
				if (this._defaultView) {
					throw new Error("Tried to set default view as " + routeName + " but already set with " + this._defaultView);
				}
				this._defaultView = routeName;
			}

			// If we were passed a display function then create
			// a display() method on the widget
			if (lang.isFunction(displayFn)) {
				// Ensure that the scope is this controller
				view.display = lang.hitch(this, function () {
					// Check if there is a child in the URL
					// If there is and this view contains the child, then we display it
					if (this.parser.hasChild(view)) {
						var childName = this.parser.getChildName(view);

						// Find matching view
						for (var i in view.views) {
							if (view.views[i]._routeName === childName) {
								view.views[i].display();
								break;
							}
						}
					} else {
						// Else we are at the end of the routing chain
						// Display a default view if one exists
						if (view._defaultView) {
							// Find matching view
							for (var j in view.views) {
								if (view.views[j]._routeName === view._defaultView) {
									view.views[j].display();
									break;
								}
							}
						} else {
							// Nothing else to do, update the hash
							topic.publish("hash/update", view);
						}
					}

					return displayFn.call(this); // Call users display function
				});
			}
		},

		removeView: function (name) {
			delete this.views[name];
		},

		/**
		 * @function
		 * @name rishson.control.ControllerWidget.addModel
		 * @param {string} name the name of the model to add
		 * @param {dojo.store} model a model (derived from dojo.store) to add to this controller
		 * @param {string} topicName the name of a topic to subscribe to
		 * @description create placeholder for a model and register handler for listener callbacks.
		 */
		addModel : function (name, model, topicName) {
			var myModel = this.models[name] = model;	//lookup shortcut
			myModel.listeners = [];
			myModel.loaded = false;

			//listen for any listeners that want to register when the model is populated
			this.subscribe(topicName + '/register', lang.hitch(this, function (addListener) {
				if (!myModel.loaded) {
					myModel.listeners.push(addListener);	//add listeners because model not yet populated
				} else {
					addListener.call(myModel, myModel);	//just call the listener as the model has data
				}
			}));
		},

		/**
		 * @function
		 * @name rishson.control.ControllerWidget.broadcastModel
		 * @param {dojo.store} model a widget which is a store to add to this controller
		 * @description	calls any registered callback function when a model gets populated with data
		 */
		broadcastModel: function (model) {
			var i,
				observableModel = new Observable(model),	//wrap the store in Observable
				listeners = model.listeners;

			//call all listeners once with the populated observable model
			for (i = 0; i < listeners.length; i += 1) {
				listeners[i].call(observableModel, observableModel);
				listeners.splice(i, 1);
			}
		},

		/**
		 * @function
		 * @name rishson.control.ControllerWidget.addController
		 * @param {rishson.control._Controller|rishson.control.ControllerWidget} controller A child controller widget
		 * to add to this controller
		 * @param {string} name the name of the controller
		 */
		addController: function (controller, name) {
			this.controllers[name] = controller;
		}
	});
});