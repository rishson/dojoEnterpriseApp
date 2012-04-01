define([
    "rishson/widget/_Widget",
    "dijit/layout/_LayoutWidget",
    "dijit/_Container",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!rishson/view/appContainer/AppContainer.html",
    "dojo/i18n!rishson/nls/AppContainer",
    "rishson/util/ObjectValidator",
    "dojo/_base/declare", // declare + safeMixin
    "dojo/_base/lang", // hitch
    "dojo/dom-class", // add, remove
    "dojo/topic", // publish/subscribe
    "dojo/on",
    "dojo/mouse",
    //template widgets
    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane"
], function(_Widget, _LayoutWidget, _Container, _TemplatedMixin, _WidgetsInTemplateMixin,
        template, l10n, ObjectValidator, declare, lang, domClass, topic, on, mouse){
    
    /**
     * @class
     * @name rishson.view.AppContainer
     * @description This is the topmost widget that is designed to contain your application.
     */
    return declare('rishson.view.AppContainer', [_Widget, _LayoutWidget,
            _TemplatedMixin, _WidgetsInTemplateMixin, _Container], {
    
        templateString : template,

        l10n : l10n,
    
        /**
         * @field
         * @name rishson.view.AppContainer.header
         * @type {String}
         * @description the Username of the currently logged in user to display in the header
         */
        header : null,

        /**
         * @field
         * @name rishson.view.AppContainer.app
         * @type {String}
         * @description the Username of the currently logged in user to display in the header
         */
        app : null,

        /**
         * @field
         * @name rishson.view.AppContainer.footer
         * @type {String}
         * @description the text to display in the footer
         */
        footer : null,
    
        /**
         * @constructor
         * @param {Object} params contains the username and footerText
         */
        constructor : function(params) {
            var criteria = [{paramName : 'header', paramType : 'object'},
                {paramName : 'app', paramType : 'object'},
                {paramName : 'footer', paramType : 'object'}];
            var validator = new ObjectValidator(criteria);
            var unwrappedParams = {header: params.header, app : params.app, footer: params.footer};
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
        postCreate : function () {
            this.mainContainer.addChild(this.header);
            this.mainContainer.addChild(this.app);
            this.mainContainer.addChild(this.footer);
            //additions to our pubList
            //this.addTopic('LOGOUT', '/user/logout');
			// A good example of selecting a node based on context.
            //on(this.dapHeader.domNode, on.selector(".button", mouse.enter), lang.hitch(this, this._handleMouseEnter));
            //on(this.dapHeader.domNode, on.selector(".button", mouse.leave), lang.hitch(this, this._handleMouseLeave));
            //on(this.dapLogout, "click", lang.hitch(this, this._handleLogout));
            this.inherited(arguments);  //rishson.widget._Widget
            this._i18n();
        },
    
        /**
         * @function
         * @name rishson.view.AppContainer
         * @override dijit._Container
         */
        startup : function () {
            this.mainContainer.startup();
            this.inherited(arguments);
        },
    
        /**
         * @function
         * @name rishson.view.AppContainer
         * @override dijit.layout._LayoutWidget
         */
        resize : function() {
            this.mainContainer.resize();
            this.inherited(arguments);
        },
    
        _i18n : function() {
            //this.dapWelcomeText.innerHTML = this.l10n.WELCOME;
            //this.dapLogout.innerHTML = this.l10n.LOGOUT;
            //this.dapUsername.innerHTML = this.username + '.';
            //this.dapFooterText.innerHTML = this.footerText;
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