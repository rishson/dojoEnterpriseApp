define([
    "rishson/widget/_Widget",
    "dijit/layout/_LayoutWidget",
    "dijit/_Container",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!rishson/view/appContainer/AppContainer.html",
    "rishson/util/ObjectValidator",
    "dojo/_base/declare", // declare + safeMixin
    "dojo/_base/lang", // hitch
    "dojo/dom-class", // add, remove
    "dojo/topic", // publish/subscribe
    //template widgets
    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane"
], function(_Widget, _LayoutWidget, _Container, _TemplatedMixin, _WidgetsInTemplateMixin,
        template, ObjectValidator, declare, lang, domClass, topic){
    
    /**
     * @class
     * @name rishson.view.AppContainer
     * @description This is the topmost widget that is designed to contain your application.
     */
    return declare('rishson.view.AppContainer', [_Widget, _LayoutWidget,
            _TemplatedMixin, _WidgetsInTemplateMixin, _Container], {
    
        templateString : template,
    
        /**
         * @field
         * @name rishson.view.AppContainer.username
         * @type {String}
         * @description the Username of the currently logged in user to display in the header
         */
        username : '',
    
        /**
         * @field
         * @name rishson.view.AppContainer.footerText
         * @type {String}
         * @description the text to display in the footer
         */
        footerText : '',
    
        /**
         * @constructor
         * @param {Object} params contains the username and footerText
         */
        constructor : function(params) {
            var criteria = [{paramName : 'username', paramType : 'string'}, {paramName : 'footerText', paramType : 'string'}];
            var validator = new ObjectValidator(criteria);
            var unwrappedParams = {username: params.username, footerText: params.footerText};
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
            //additions to the subList
            topic.subscribe(this.subList.WIDGET_INITIALISED, lang.hitch(this, "_handleWidgetInitialisation"));
    
            //additions to our pubList
            this.pubList.LOGOUT = this._topicNamespace + '/user/logout';
    
            this.connect(this.dapLogout, 'onclick', this, this._handleLogout);
            this.connect(this.dapLogout, 'onmouseenter', this, function() {domClass.add(this.dapLogout, 'mouseEnter')});
            this.connect(this.dapLogout, 'onmouseleave', this, function() {domClass.remove(this.dapLogout, 'mouseEnter')});
            this.connect(this.dapUsername, 'onmouseenter', this, function() {domClass.add(this.dapUsername, 'mouseEnter headerButton')});
            this.connect(this.dapUsername, 'onmouseleave', this, function() {domClass.remove(this.dapUsername, 'mouseEnter headerButton')});
    
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
            this.dapWelcomeText.innerHTML = this._nlsStrings.WELCOME;
            this.dapUsername.innerHTML = this.username + '.';
            this.dapLogout.innerHTML = this._nlsStrings.LOGOUT;
            this.dapFooterText.innerHTML = this.footerText;
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
        }
    
    });
});