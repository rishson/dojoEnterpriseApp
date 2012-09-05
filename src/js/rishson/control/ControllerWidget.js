define([
	"dojo/_base/declare", // declare
	"dojo/topic",	//subscribe
	"rishson/Base", //createTopicNamespace, _capitaliseTopicName
	"rishson/widget/_Widget", //mixin
	"rishson/control/_Controller", //mixin
	"dojo/_base/lang", //isArray
	"dojo/store/Observable",	//constructor
	"rishson/base/router/Route"
], function (declare, topic, Base, _Widget, _Controller, lang, Observable, Route) {
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

		routes:  null,

		/**
		 * @constructor
		 */
		constructor: function () {
			this.models = {};
			this.views = {};
			this.controllers = {};
			this.routes = {};
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
		 * @param {String} The name of the view
		 * @param {Object} The view widget
		 */
		addView: function (name, view) {
			this.views[name] = view;
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
		addModel: function (name, model, topicName) {
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
		 * @name rishson.control.ControllerWidget.addRoute
		 * @param {string} routeName The route name, used in the URL
		 * @param {Object} params A hash of parameters to construct the route
		 * @description Creates a new route for a given widget
		 */
		addRoute: function (routeName, params) {
			// Patch up the params object
			params.parent = params.parent || this;
			params.routeName = routeName;

			this.routes[params.routeName] = this.adopt(Route, params);
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
		addController: function (name, controller) {
			this.controllers[name] = controller;
		}
	});
});