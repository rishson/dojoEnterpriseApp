dojo.provide("rishson.enterprise.widget._Widget");

dojo.require("dojo.i18n");
dojo.require("dijit._Widget");
dojo.require('rishson.enterprise.Globals');
dojo.require("rishson.enterprise.widget._WidgetInWidgetMixin");

/**
 * @class
 * @name rishson.enterprise.widget._Widget
 * @description This is the base class for all widgets in Enterprise.<p>
 * We mixin Phil Higgin's memory leak mitigation solution that is implemented in _WidgetInWidgetMixin.<p>
 * This base class also adds very generic event pub/sub abilities so that widgets can be completely self-contained and
 * not have to know about their runtime invocation container or understand context concerns such as Ajax request.
 */
dojo.declare("rishson.enterprise.widget._Widget", [dijit._Widget, rishson.enterprise.widget._WidgetInWidgetMixin], {

    /**
     * @field
     * @name rishson.enterprise.widget._Widget._globalTopicNamespace
     * @type {String}
     * @private
     * @description This namespace is prepended to every topic name used by a derived widget
     */
    _globalTopicNamespace : rishson.enterprise.Globals.TOPIC_NAMESPACE,

    /**
     * @field
     * @name rishson.enterprise.widget._Widget.pubList
     * @type {Object}
     * @description Object that contains the list of topics that any derived widget can publish
     */
    //@todo make this private with get/set so that contents can only be added to
    pubList : {WIDGET_INITIALISED : this._globalTopicNamespace + '/widget/initialised'},

    /**
     * @field
     * @name rishson.enterprise.widget._Widget.subList
     * @type {Object}
     * @description Object that contains the list of topics that any derived widget can listen out for
     */
    //@todo make this private with get/set so that contents can only be added to
    subList : {WIDGET_DISABLE : this._globalTopicNamespace + '/disable',
            ERROR_CME : this._globalTopicNamespace + '/error/cme',
            ERROR_INVALID : this._globalTopicNamespace + '/error/invalid'
        },

    /**
     * @field
     * @name rishson.enterprise.widget._Widget.isInitialised
     * @type {Boolean}
     * @description Is the widget initialised? Default to false - duh.
     */
    isInitialised : false,

    /**
     * @field
     * @private
     * @name rishson.enterprise.widget._Widget._widgetId
     * @type {String}
     * @description The unique id of a widget created with this base class.
     */
    _widgetId : null,

    constructor : function() {
        /*create a unique id for every instance of a widget. This is needed for when we publish our events and want to
          publish who we are. If id is blank then we assume there is only 1 instance of the implementing widget.
        */
        this._widgetId = this.declaredClass + this.id;
        /*any derrived widget can publish events on their own namespace so construct the widget namespace from
        the declared class, but replace the . to be a / so it is standard topic conventions
         */
        this._topicNamespace = '/' + this.declaredClass.replace(/\./g, '/');
    },

    /**
     * @function
     * @name rishson.enterprise.widget._Widget.postCreate
     * @override dijit._Widget
     */
    postCreate : function () {
        //subscribe to topics that EVERY widget needs to potentially know about
        dojo.subscribe(this.subList.WIDGET_DISABLE, this, "_disable");
        dojo.subscribe(this.subList.WIDGET_ENABLE, this, "_enable");
        dojo.subscribe(this.subList.ERROR_CME, this, "_cmeHandler");
        dojo.subscribe(this.subList.ERROR_INVALID, this, "_invalidHandler");

        var indexOfClassName = this.declaredClass.lastIndexOf('.') + 1;
        var className = this.declaredClass.slice(indexOfClassName);

        dojo.requireLocalization("rishson.enterprise", className);
        this._nlsStrings = dojo.i18n.getLocalization("rishson.enterprise", className);

        this.inherited(arguments);  //dijit._Widget
    },

    /**
     * @function
     * @private
     * @description When the derrived is ready then it can call this function to publish their state
     */
    _initialised : function () {
        this.isInitialised = true;
        dojo.publish(this.pubList.WIDGET_INITIALISED, [this._widgetId]);
    },

    /**
     * @function
     * @private
     * @description Disable this widget
     */
    _disable : function () {
        console.error(this.declaredClass + " : _disable has to be implemented by derived widgets.");
    },

    /**
     * @function
     * @private
     * @description Enable this widget
     */
    _enable : function () {
        console.error(this.declaredClass + " : _enable has to be implemented by derived widgets.");
    },

    /**
     * @function
     * @private
     * @param latestVersionOfObject {Object} the latest version of an object that this widget knows how to render.
     * @description Handle a ConcurrentModificationException
     */
    _cmeHandler : function (latestVersionOfObject) {
        console.error(this.declaredClass + " : _cmeHandler has to be implemented by derived widgets.");
    },

    /**
     * @function
     * @private
     * @param validationFailures {Object} the validation failures to act on.
     * @description Handle validation errors when performing some mutating action.
     */
    _invalidHandler : function (validationFailures) {
        console.error(this.declaredClass + " : _invalidHandler has to be implemented by derived widgets.");
    }

});
