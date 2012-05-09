define([
	"rishson/widget/_Widget",
	"dijit/layout/_LayoutWidget",
	"dijit/_Container",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"rishson/control/_Controller",
	"dojo/text!rishson/view/appContainer/AppContainer.html",
	"dojo/i18n!rishson/nls/AppContainer",
	"rishson/util/ObjectValidator",
	"dojo/_base/declare", // declare + safeMixin
	//template widgets
	"dijit/layout/BorderContainer"
], function (_Widget, _LayoutWidget, _Container, _TemplatedMixin, _WidgetsInTemplateMixin, _Controller, template, l10n,
			 ObjectValidator, declare) {

	/**
	 * @class
	 * @name rishson.view.AppContainer
	 * @description This is the topmost widget that is designed to contain your application.
	 * N.B. _Controller needs to be mixed in after _Widget so we don't clobber the 'adopt' and 'orphan' functions from
	 * _WidgetInWidgetMixin @FIXME
	 */
	return declare('rishson.view.AppContainer', [_Widget, _LayoutWidget, _Container, _TemplatedMixin,
		_WidgetsInTemplateMixin, _Controller], {

		templateString: template,

		l10n: l10n,

		/**
		 * @field
		 * @name rishson.view.AppContainer.header
		 * @type {string}
		 * @description the Username of the currently logged in user to display in the header
		 */
		header: null,

		/**
		 * @field
		 * @name rishson.view.AppContainer.app
		 * @type {string}
		 * @description the Username of the currently logged in user to display in the header
		 */
		app: null,

		/**
		 * @field
		 * @name rishson.view.AppContainer.footer
		 * @type {string}
		 * @description the text to display in the footer
		 */
		footer: null,

		/**
		 * @constructor
		 * @param {{header : object, app : object, footer : object}} params contains the header, footer and app objects
		 */
		constructor: function (params) {
			var criteria = [
					{paramName: 'header', paramType: 'object'},
					{paramName: 'app', paramType: 'object'},
					{paramName: 'footer', paramType: 'object'}
				],

				validator = new ObjectValidator(criteria),
				unwrappedParams = {header: params.header, app: params.app, footer: params.footer};

			if (validator.validate(unwrappedParams)) {
				declare.safeMixin(this, unwrappedParams);
			}
			else {
				validator.logErrorToConsole(params, 'Invalid params passed to the AppContainer.');
				throw ('Invalid params passed to the AppContainer.');
			}
		},

		/**
		 * @function
		 * @name rishson.view.AppContainer
		 * @override rishson.widget._Widget
		 */
		postCreate: function () {
			this.mainContainer.addChild(this.header);
			this.mainContainer.addChild(this.app);
			this.mainContainer.addChild(this.footer);

			this.injectWidget(this.header); //hook up to all topics published from the header widget
			//this.injectWidget(this.app) - this would start the auto-wiring of the application

			this.inherited(arguments);  //rishson.widget._Widget
		},

		/**
		 * @function
		 * @name rishson.view.AppContainer
		 * @override dijit._Container
		 */
		startup: function () {
			this.mainContainer.startup();
			this.inherited(arguments);
		},

		/**
		 * @function
		 * @name rishson.view.AppContainer
		 * @override dijit.layout._LayoutWidget
		 */
		resize: function () {
			this.mainContainer.resize();
			this.inherited(arguments);
		},

		/**
		 * @function
		 * @private
		 * @param initialisedWidgetId {string} the string id of the widget that has just been initialised.
		 * @description Handle a widget becoming initialised.
		 */
		_handleRishsonWidgetInitialised: function (initialisedWidgetId) {
			console.debug('Widget initialised: \'' + initialisedWidgetId + '\'');
		},

		/**
		 * @function
		 * @private
		 * @param {string} username the name of the user who has requested a logout
		 * @description Log the session out. Send a request to the server to logout.
		 * The server should respond with a re-direct and a server side session invalidation.
		 */
		_handleRishsonViewSimpleHeaderUserLogout: function (username) {
			console.debug('Logout request recieved for \'' + username + '\'');
		},

		/**
		 * @function
		 * @private
		 * @param {string} username the name of the user who want to launch a preferences page for their account.
		 * @description The user wants to see details of their user account.
		 */
		_handleRishsonViewSimpleHeaderUserSelected: function (username) {
			console.debug('Username selection event for \'' + username + '\'');
		}
	});
});