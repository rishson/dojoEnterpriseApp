dojo.provide('rishson.enterprise.view.AppContainer');

dojo.require('rishson.enterprise.widget._Widget');
dojo.require('dijit.layout._LayoutWidget');
dojo.require('dijit._Container');
dojo.require('dijit._Templated');
dojo.require('rishson.enterprise.util.ObjectValidator');

//template widgets
dojo.require('dijit.layout.BorderContainer');
dojo.require('dijit.layout.ContentPane');

/**
 * @class
 * @name rishson.enterprise.view.AppContainer
 * @description This is the topmost widget that is designed to contain your application.
 */
dojo.declare('rishson.enterprise.view.AppContainer', [rishson.enterprise.widget._Widget, dijit.layout._LayoutWidget,
    dijit._Templated, dijit._Container], {

    templateString : dojo.cache("rishson.enterprise.view", "appContainer/AppContainer.html"),
    widgetsInTemplate : true,

    /**
     * @field
     * @name rishson.enterprise.view.AppContainer.username
     * @type {String}
     * @description the Username of the currently logged in user to display in the header
     */
    username : '',

    /**
     * @field
     * @name rishson.enterprise.view.AppContainer.footerText
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
        var validator = new rishson.enterprise.util.ObjectValidator(criteria);
        var unwrappedParams = {username: params.username, footerText: params.footerText};
        if (validator.validate(unwrappedParams)) {
            dojo.safeMixin(this, unwrappedParams);
        }
        else {
            validator.logErrorToConsole(params, 'Invalid params passed to the AppContainer.');
            throw ('Invalid params passed to the AppContainer.');
        }
    },

    /**
     * @function
     * @name rishson.enterprise.view.AppContainer
     * @override rishson.enterprise.widget._Widget
     */
    postCreate : function () {
        //additions to the subList
        dojo.subscribe(this.subList.WIDGET_INITIALISED, this, "_handleWidgetInitialisation");

        //additions to our pubList
        this.pubList.LOGOUT = this._topicNamespace + '/user/logout';

        this.connect(this.dapLogout, 'onclick', this, this._handleLogout);
        this.connect(this.dapLogout, 'onmouseenter', this, function() {dojo.addClass(this.dapLogout, 'mouseEnter')});
        this.connect(this.dapLogout, 'onmouseleave', this, function() {dojo.removeClass(this.dapLogout, 'mouseEnter')});
        this.connect(this.dapUsername, 'onmouseenter', this, function() {dojo.addClass(this.dapUsername, 'mouseEnter headerButton')});
        this.connect(this.dapUsername, 'onmouseleave', this, function() {dojo.removeClass(this.dapUsername, 'mouseEnter headerButton')});

        this.inherited(arguments);  //rishson.enterprise.widget._Widget
        this._i18n();
    },

    /**
     * @function
     * @name rishson.enterprise.view.AppContainer
     * @override dijit._Container
     */
    startup : function () {
        this.mainContainer.startup();
        this.inherited(arguments);
    },

    /**
     * @function
     * @name rishson.enterprise.view.AppContainer
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
        dojo.publish(this.pubList.LOGOUT);
    }

});
