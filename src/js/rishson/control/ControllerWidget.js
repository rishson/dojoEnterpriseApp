define([
	"dojo/_base/declare", // declare
	"dojo/topic",
	"rishson/Base", //createTopicNamespace, _capitaliseTopicName
	"rishson/widget/_Widget", //mixin
	"rishson/control/_Controller", //mixin
	"dojo/_base/lang", //isArray
	"dojo/store/Observable"
], function (declare, topic, Base, _Widget, _Controller, lang, Observable) {
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
		addView : function (view, name) {
			this.views[name] = view;
		},

		/**
		 * @function
		 * @name rishson.control.ControllerWidget.addModel
		 * @param {Object|dojo.store} model a widget which is a store to add to this controller
		 * @description create placeholder for a model and register handler for listener callbacks
		 */
		addModel : function (name, model, topicName) {
			var observableModel,
				i,
				myModel;
			myModel = this.models[name] = model;	//lookup shortcut
			myModel.listeners = [];
			myModel.loaded = false;

			//listen for any listeners that want to register when the model is populated
			topic.subscribe(topicName + '/register', function (addListener) {
				if (!myModel.loaded) {
					myModel.listeners.push(addListener);	//add listeners because model not yet populated
				} else {
					addListener.call(myModel, myModel);	//just call the listener as the model has data
				}
			});
		},

		/**
		 * @function
		 * @name rishson.control.ControllerWidget.broadcastModel
		 * @param {Object|dojo.store} model a widget which is a store to add to this controller
		 * @description	calls any registered callback function when a model gets populated with data
		 */
		broadcastModel: function (model) {
			var i,
				observeableModel = new Observable(model),
				listeners = model.listeners;

			for (i = 0; i < listeners.length; i += 1) {
				listeners[i].call(observeableModel);
				listeners.splice(i, 1);
			}
		},

		/**
		 * @function
		 * @name rishson.control.ControllerWidget.addController
		 * @param {Object|dojo.store} model A child controller widget to add to this controller
		 */
		addController: function (controller, name) {
			this.controllers[name] = controller;
		}
	});
});