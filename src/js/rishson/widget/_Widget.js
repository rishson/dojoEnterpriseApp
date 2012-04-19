define([
    "dijit/_Widget",    //mixin
    "rishson/widget/_WidgetInWidgetMixin",  //mixin
    "rishson/Globals",
    "dojo/_base/declare", // declare
    "dojo/_base/lang", // hitch mixin
    "dojo/topic" // publish/subscribe
], function(_Widget, _WidgetInWidgetMixin, Globals, declare, lang, topic){
    /**
     * @class
     * @name rishson.widget._Widget
     * @description This is the base class for all widgets.<p>
     * We mixin Phil Higgin's memory leak mitigation solution that is implemented in _WidgetInWidgetMixin.<p>
     * This base class also adds very generic event pub/sub abilities so that widgets can be completely self-contained and
     * not have to know about their runtime invocation container or understand context concerns such as Ajax request.
     */
    return declare("rishson.widget._Widget", [_Widget, _WidgetInWidgetMixin], {
    
        /**
         * @field
         * @name rishson.widget._Widget._globalTopicNamespace
         * @type {String}
         * @private
         * @description This namespace is prepended to every topic name used by a derived widget
         */
        _globalTopicNamespace : Globals.TOPIC_NAMESPACE,
    
        /**
         * @field
         * @name rishson.widget._Widget.pubList
         * @type {Object}
         * @description Object that contains the list of topics that any derived widget can publish
         */
        pubList : null,
    
        /**
         * @field
         * @name rishson.widget._Widget.subList
         * @type {Object}
         * @description Object that contains the list of topics that any derived widget can listen out for
         */
        subList : null,
    
        /**
         * @field
         * @name rishson.widget._Widget.isInitialised
         * @type {Boolean}
         * @description Is the widget initialised? Default to false - duh.
         */
        isInitialised : false,
    
        /**
         * @field
         * @private
         * @name rishson.widget._Widget._widgetId
         * @type {String}
         * @description The unique id of a widget created with this base class.
         */
        _widgetId : null,
    
        /**
         * @constructor
         */
         constructor : function() {
            /*create a unique id for every instance of a widget. This is needed for when we publish our events and want to
              publish who we are. If id is blank then we assume there is only 1 instance of the implementing widget.*/
            this._widgetId = this.declaredClass + this.id;
            
            /*any derived widget can publish events on their own namespace so construct the widget namespace from
            the declared class, but replace the . to be a / so it is standard topic conventions*/
            this._topicNamespace = '/' + this.declaredClass.replace(/\./g, '/');
        
            this.pubList = {WIDGET_INITIALISED : this._globalTopicNamespace + '/initialised'};
            this.subList = {WIDGET_DISABLE : this._globalTopicNamespace + '/disable',
                WIDGET_ENABLE : this._globalTopicNamespace + '/enable',
                ERROR_CME : this._globalTopicNamespace + '/error/cme',
                ERROR_INVALID : this._globalTopicNamespace + '/error/invalid'
            };
        },
    
        /**
         * @function
         * @name rishson.widget._Widget.postCreate
         * @override dijit._Widget
         */
        postCreate : function () {
            //subscribe to topics that EVERY widget needs to potentially know about
            topic.subscribe(this.subList.WIDGET_DISABLE, lang.hitch(this, "_disable"));
            topic.subscribe(this.subList.WIDGET_ENABLE, lang.hitch(this, "_enable"));
            topic.subscribe(this.subList.ERROR_CME, lang.hitch(this, "_cmeHandler"));
            topic.subscribe(this.subList.ERROR_INVALID, lang.hitch(this, "_invalidHandler"));
    
            var indexOfClassName = this.declaredClass.lastIndexOf('.') + 1;
            var className = this.declaredClass.slice(indexOfClassName);
    
            /* FIXME: this won't work async.  Should probably pull in resources per-widget.
            dojo.requireLocalization("rishson.enterprise", className);
            this._nlsStrings = i18n.getLocalization("rishson.enterprise", className);
            */
    
            this.inherited(arguments);  //dijit._Widget
        },

        /**
         * @function
         * @name rishson.widget._Widget.addTopic
         * @param topicRef {String} the object property (usually CAPITALISED) of the topic in the pubList
         * @param topicName {String} the name of topic
         * @param makeGlobal {Boolean} optional if true use the global topic namespace
         * @description Syntaatic sugar to add items to a widgets pubList.
         */
        addTopic : function(topicRef, topicName, makeGlobal) {
            if(!makeGlobal){
                this.pubList[topicRef] = this._topicNamespace + topicName;
            }
            else {
                this.pubList[topicRef] = this._globalTopicNamespace + topicName;
            }
        },


        /**
         * @function
         * @private
         * @description When the derrived is ready then it can call this function to publish their state
         */
        _initialised : function () {
            this.isInitialised = true;
            topic.publish(this.pubList.WIDGET_INITIALISED, this._widgetId);
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
});
