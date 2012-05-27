define([
	"rishson/widget/_Widget", //mixin
	"dijit/_TemplatedMixin", //mixin
	"dijit/_WidgetsInTemplateMixin", //mixin
	"dojo/text!rishson/view/simpleHeader/SimpleHeader.html", //template
	"dojo/i18n!rishson/nls/SimpleHeader", //nls file
	"rishson/util/ObjectValidator", //validate
	"dojo/_base/declare", // declare + safeMixin
	"dojo/_base/lang", // hitch
	"dojo/dom-class", // add, remove
	"dojo/topic", // publish/subscribe
	"dojo/on", //on, selector
	"dojo/mouse", //mouse enter/leave events
	//template widgets found in the template but not in declare
	"dijit/layout/ContentPane"
], function (_Widget, _TemplatedMixin, _WidgetsInTemplateMixin, template, l10n, ObjectValidator, declare, lang,
			 domClass, topic, on, mouse) {

	/**
	 * @class
	 * @name rishson.view.SimpleHeader
	 * @description An example widget for a generic header of a single page application.
	 */
	return declare('rishson.view.SimpleHeader', [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {

		templateString: template,

		l10n: l10n,

		/**
		 * @field
		 * @name rishson.view.SimpleHeader.username
		 * @type {string}
		 * @description the Username of the currently logged in user to display in the header
		 */
		username: '',

		/**
		 * @constructor
		 * @param {{username : string}} params contains the username
		 */
		constructor: function (params) {
			var criteria = [
					{paramName: 'username', paramType: 'string'}
				],
				validator = new ObjectValidator(criteria),
				unwrappedParams = {username: params.username};

			if (validator.validate(unwrappedParams)) {
				declare.safeMixin(this, unwrappedParams);
			} else {
				validator.logErrorToConsole(params, 'Invalid params passed to the SimpleHeader.');
				throw ('Invalid params passed to the SimpleHeader.');
			}
		},

		/**
		 * @function
		 * @name rishson.view.SimpleHeader
		 * @override rishson.widget._Widget
		 */
		postCreate: function () {
			//additions to our list of topics that we can publish
			this.addTopic('LOGOUT', '/user/logout');
			this.addTopic('USER', '/user/selected');

			//Set up all the dom handlers
			on(this.domNode, on.selector(".button", mouse.enter), lang.hitch(this, this._handleMouseEnter));
			on(this.domNode, on.selector(".button", mouse.leave), lang.hitch(this, this._handleMouseLeave));
			on(this.dapUsername, "click", lang.hitch(this, this._handleUsernameClick));
			on(this.dapLogout, "click", lang.hitch(this, this._handleLogout));
			this.inherited(arguments);  //rishson.widget._Widget
			this._initialised();
		},

		/**
		 * @function
		 * @private
		 * @description Log the session out. Send a request to the server to logout.
		 * The server should respond with a re-direct and a server side session invalidation.
		 */
		_handleLogout: function () {
			topic.publish(this.pubList.LOGOUT, this.username);
		},

		/**
		 * @function
		 * @private
		 * @description Handle a click on the username.
		 * This would usually launch a user preferences dialog or similar.
		 */
		_handleUsernameClick: function () {
			topic.publish(this.pubList.USER, this.username);
		},

		/**
		 * @function
		 * @private
		 * @param {Object} evt the DOM event
		 * @description Do hover styles
		 */
		_handleMouseEnter: function (evt) {
			var node = evt.target,
				classesToAdd = 'mouseEnter';

			if (node === this.dapUsername) {
				classesToAdd += ' headerLink';
			}
			domClass.add(evt.target, classesToAdd);
		},

		/**
		 * @function
		 * @private
		 * @param {Object} evt the DOM event
		 * @description Remove hover styles
		 */
		_handleMouseLeave: function (evt) {
			var node = evt.target,
				classesToAdd = 'mouseEnter';

			if (node === this.dapUsername) {
				classesToAdd += ' headerLink';
			}
			domClass.remove(evt.target, classesToAdd);
		}
	});
});