dojo.provide('rishson.enterprise.view.AppContainer');

dojo.require('rishson.enterprise.widget._Widget');
dojo.require('dijit.layout._LayoutWidget');
dojo.require('dijit._Container');
dojo.require('dijit._Templated');

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
     * @function
     * @name rishson.enterprise.view.AppContainer
     * @override rishson.enterprise.widget._Widget
     */
    postCreate : function () {
        //additions to the subList
        dojo.subscribe(this.subList.WIDGET_INITIALISED, this, "_handleWidgetInitialisation");

        //additions to our pubList

        dojo.connect(this.logout, 'onclick', this, this._handleLogout);
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

    _handleLogout : function () {
        dojo.publish(rishson.enterprise.Globals.TOPIC_USER_LOGOUT);
    }

});
