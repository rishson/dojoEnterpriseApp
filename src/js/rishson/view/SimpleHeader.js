define([
    "rishson/widget/_Widget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!rishson/view/simpleHeader/SimpleHeader.html",
    "dojo/i18n!rishson/nls/SimpleHeader",
    "rishson/util/ObjectValidator",
    "dojo/_base/declare", // declare + safeMixin
    "dojo/_base/lang", // hitch
    "dojo/dom-class", // add, remove
    "dojo/topic", // publish/subscribe
    "dojo/on",
    "dojo/mouse",
    //template widgets
    "dijit/layout/ContentPane"
], function(_Widget, _TemplatedMixin, _WidgetsInTemplateMixin,
            template, l10n, ObjectValidator, declare, lang, domClass, topic, on, mouse){

    /**
     * @class
     * @name rishson.view.SimpleHeader
     * @description This is the topmost widget that is designed to contain your application.
     */
    return declare('rishson.view.SimpleHeader', [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {

        templateString : template,

        l10n : l10n,

        /**
         * @field
         * @name rishson.view.SimpleHeader.username
         * @type {String}
         * @description the Username of the currently logged in user to display in the header
         */
        username : '',

        /**
         * @constructor
         * @param {Object} params contains the username and footerText
         */
        constructor : function(params) {
            var criteria = [{paramName : 'username', paramType : 'string'}];
            var validator = new ObjectValidator(criteria);
            var unwrappedParams = {username: params.username};
            if (validator.validate(unwrappedParams)) {
                declare.safeMixin(this, unwrappedParams);
            }
            else {
                validator.logErrorToConsole(params, 'Invalid params passed to the SimpleHeader.');
                throw ('Invalid params passed to the SimpleHeader.');
            }
        },

        /**
         * @function
         * @name rishson.view.SimpleHeader
         * @override rishson.widget._Widget
         */
        postCreate : function () {
            //additions to our pubList
            this.addTopic('LOGOUT', '/user/logout');
            // A good example of selecting a node based on context.
            on(this.domNode, on.selector(".button", mouse.enter), lang.hitch(this, this._handleMouseEnter));
            on(this.domNode, on.selector(".button", mouse.leave), lang.hitch(this, this._handleMouseLeave));
            on(this.dapLogout, "click", lang.hitch(this, this._handleLogout));
            this.inherited(arguments);  //rishson.widget._Widget
            this._i18n();
        },

        _i18n : function() {
            this.dapWelcomeText.innerHTML = this.l10n.WELCOME;
            this.dapLogout.innerHTML = this.l10n.LOGOUT;
            this.dapUsername.innerHTML = this.username + '.';
        },

        /**
         * @function
         * @private
         * @param initialisedWidgetId {Object} the string id of the widget that has just been initialised.
         * @description Handle a widget becoming initialised.
         */
        _handleWidgetInitialisation : function (initialisedWidgetId) {

        },

        /**
         * @function
         * @private
         * @description Log the session out. Send a request to the server to logout.
         * The server should respond with a re-direct and a server side session invalidation.
         */
        _handleLogout : function () {
            topic.publish(this.pubList.LOGOUT);
        },

        /**
         * @function
         * @private
         * @description Do hover styles
         */
        _handleMouseEnter : function (evt) {
            var node = evt.target;
            var classesToAdd = 'mouseEnter';
            if(node === this.dapUsername){
                classesToAdd += ' headerLink';
            }
            domClass.add(evt.target, classesToAdd);
        },

        /**
         * @function
         * @private
         * @description Remove hover styles
         */
        _handleMouseLeave : function (evt) {
            var node = evt.target;
            var classesToAdd = 'mouseEnter';
            if(node === this.dapUsername){
                classesToAdd += ' headerLink';
            }
            domClass.remove(evt.target, classesToAdd);
        }

    });
});