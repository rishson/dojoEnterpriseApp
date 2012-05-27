define([
	"dojo/_base/declare", // declare
	"rishson/Base", //createTopicNamespace, _capitaliseTopicName
	"rishson/widget/_Widget", //
	"rishson/control/_Controller", //
	"dojo/_base/lang" //isArray
], function (declare, Base, _Widget, _Controller, lang) {
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
		 * @type {Array<dojo.store>}
		 * @description a collection of all the injected models
		 */
		models: null,

		/**
		 * @field
		 * @name rishson.control.ControllerWidget.views
		 * @type {Array<rishson.widget._Widget>}
		 * @description a collection of all the injected views
		 */
		views: null,

		/**
		 * @constructor
		 */
		constructor: function () {
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
		 * @param {Array|rishson.widget._Widget} view a widget or array of widgets to add to this controller
		 */
		addView : function (view) {
			if (lang.isArray(view)) {
				this.views.push.apply(this.views, view);
			} else {
				this.views.push(view);
			}
		},

		/**
		 * @function
		 * @name rishson.control.ControllerWidget.addModel
		 * @param {Array|dojo.store} model a store or array of stores to add to this controller
		 */
		addModel : function (model) {
			if (lang.isArray(model)) {
				this.models.push.apply(this.models, model);
			} else {
				this.models.push(model);
			}
		}
	});
});