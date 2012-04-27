define([
	"dojo/_base/declare",
	"rishson/control/_Controller",
	"app/view/MatchOverviewLayout",

	"dojo/dom",
	"dojo/dom-construct"
], function (declare, _Controller, MatchOverviewLayout, dom, domConstruct) {
	var MatchOverviewController = declare('app.control.MatchOverviewController', [_Controller], {
		baseClass: "MatchOverviewController",
		view: null,
		constructor: function (args) {
			this.view = this.adopt(MatchOverviewLayout, {}, dom.byId('placeholder'));

			this.view.publishEvent();
		},

		_handleRishsonWidgetInitialised: function () {

		},

		_handleAppViewMatchOverviewLayoutMatchOverviewLayoutInstantiated: function () {
			console.log('woohoo');
		}
	});

	return MatchOverviewController;
});
