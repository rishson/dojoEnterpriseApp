define([
    "rishson/widget/_WidgetInWidgetMixin",
    "dojo/_base/declare", // declare
    "dojo/_base/array", // forEach
    "dojo/_base/lang", // hitch
    "dojo/topic" // publish/subscribe
], function(_WidgetInWidgetMixin, declare, arrayUtil, lang, topic){
    /**
     * @class
     * @name rishson.control._ControllerMixin
     * @description This is a mixin for Controller classes/widgets<p>
     * Controllers are classes that wire together the view (widgets) and the model.<p>
     * Application widgets are basically 'Controllers' in an MVC paradigm. Application widgets typically provide layout<p>
     * container functionality to child widgets and act as the controller for the enclosed child widgets.<p>
     * An Application widget knows about all views (child widgets) and models (stores) for the 'Application'.<p>
     * This class specifically adds the autowiring of topics between child widgets and the Application widget.<p>
     *<p>
     * Usage:<p>
     *<p>
     * myChildWidget.pubList({SOME_EVENT :'some/topic'});<p>
     * ...<p>
     * myApplicationWidget.injectWidget(myChildWidget);<p>
     * or
     * myController.adopt(myChildWIdget, {}, someDomNode);<p>
     *<p>
     * At this point, all the topic in mychildWidget.pubList are wired to event handlers in myApplicationWidget.
     */
    return declare("rishson.control._ControllerMixin", _WidgetInWidgetMixin, {
    
        /**
         * @function
         * @name rishson.control._ControllerMixin.injectWidget
         * @param {rishson.widget._Widget} widget a widget to examine for topics
         * @description widgets injected into this class will be examined to autowire its publish and subscribes.<p>
         * This function should be called for declarativly created widgets.
         */
        injectWidget : function (widget) {
            this._autowirePubs(widget);
        },
    
        /**
         * @function
         * @name rishson.control._ControllerMixin.adopt
         * @override rishson.widget._WidgetInWidgetMixin.adopt
         * @description widgets injected into this class will be examined to autowire its publish and subscribes.<p>
         * This function should be called for programatically created widgets.
         */
        adopt : function (/*Function*/cls, /*Object*/props, /*DomNode*/node) {
            var widget = this.inherited(arguments);	//call _Widget.adopt
            this._autowirePubs(widget);
            return widget;
        },

    
        /**
         * @function
         * @name rishson.control._ControllerMixin._autowirePubs
         * @private
         * @param {rishson.widget._Widget} widget a widget that contains a pubList of topics that it can publish.
         * @description autowire the published topics from the widget to event handlers in the Application widget.
         */
        _autowirePubs : function (widget) {
            //iterate over each published topic of the passed in widget - the application widget need to subscribe to these		
    
            for(var topicObj in widget.pubList) {
                if(widget.pubList.hasOwnProperty(topicObj)) {
                    var topicName = widget.pubList[topicObj];
                    //capitalise the topic section names and remove slashes
                    var handlerFuncName = this._capitaliseTopicName(topicName);
                    handlerFuncName = '_handle' + handlerFuncName.replace(/[//]/g, '');

                    //the implementing class needs to have _handle[topicName] functions by convention
                    var handlerFunc = this[handlerFuncName];
                    if(handlerFunc) {
                        topic.subscribe(topicName, lang.hitch(this, handlerFunc));
                    }
                    else {
                        console.error('Autowire failure for topic: ' + topicName + '. No handler: ' + handlerFuncName);
                    }    
                }	
            }
        },
    
        /**
         * @function
         * @name rishson.control._ControllerMixin._capitaliseTopicName
         * @private
         * @param {String} topic a name of a topic to capitalise.
         * @description capitalise the first letter of a topic.
         */
        _capitaliseTopicName : function (topic) {
            /* e.g. /hello/i/am/a/topicName would become Hello/I/Am/A/TopicName
            */
            return topic.replace(/\b[a-z]/g, function (w) {
                return w.toUpperCase();
            });
        }
    
    });
});