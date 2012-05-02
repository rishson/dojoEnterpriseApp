define([
	"dojo/_base/declare", // declare
    "rishson/Base", //createTopicNamespace, _capitaliseTopicName
	"rishson/Globals",	//TOPIC_NAMESPACE
    "dojo/_base/array", // forEach
    "dojo/_base/lang", // hitch
    "dojo/topic" // publish/subscribe
], function (declare, Base, Globals, arrayUtil, lang, topic) {
    /**
     * @class
     * @name rishson.control._Controller
     * @description This is the base class for Controller classes/widgets<p>
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
     * myController.adopt(myChildWidget, {}, someDomNode);<p>
     *<p>
     * At this point, all the topic in mychildWidget.pubList are wired to event handlers in myApplicationWidget.
     */
    return declare("rishson.control._Controller", [Base], {

		_topicNamespace: '',

		/**
		 * @constructor
		 */
		constructor : function () {
			// Create this controllers personalised topic namespace.
			this._topicNamespace = this.createTopicNamespace(this.declaredClass);
			this._id = this.declaredClass;

			this.subList = this.subList || {};

			// Add event listener for child widget initialisation events.
			// Must be done before child adoption/creation otherwise this class cannot listen to child's published events.
			this._wireSinglePub(this._topicNamespace + Globals.CHILD_INTIALISED_TOPIC_NAME, true);
		},

        /**
         * @function
         * @name rishson.control._Controller.injectWidget
         * @param {rishson.widget._Widget} widget a widget to examine for topics
         * @description widgets injected into this class will be examined to autowire its publish and subscribes.<p>
         * This function should be called for declarativly created widgets.
         */
        injectWidget : function (widget) {
            this._autowirePubs(widget);
        },
    
        /**
         * @function
         * @name rishson.control._Controller.adopt
         * @description widgets injected into this class will be examined to autowire its publish and subscribes.<p>
         * This function should be called for programatically created widgets.
         */
        adopt : function (Cls, props, node) {
			var child;
			// Pass in parents topic name space to all child views and controllers.
			props.parentTopicNamespace = this._topicNamespace;

            child = new Cls(props, node);

			if (!this._supportingWidgets) {
				this._supportingWidgets = [];	//awkward but this is a mixin class
			}
			this._supportingWidgets.push(child);

            this._autowirePubs(child);
            return child;
        },
    
        /**
         * @function
         * @name rishson.control._Controller._autowirePubs
         * @private
         * @param {rishson.widget._Widget} widget a widget that contains a pubList of topics that it can publish.
         * @description autowire the published topics from the child widget to event handlers on the controller widget.
         */
        _autowirePubs : function (child) {
			var topicObj;

            //iterate over each published topic of the passed in child - the application child need to subscribe to these
            for (topicObj in child.pubList) {
                if (child.pubList.hasOwnProperty(topicObj)) {
					this._wireSinglePub(child.pubList[topicObj]);
                }	
            }
        },

		/**
		 * @function
		 * @name rishson.control._Controller._createHandlerFuncName
		 * @private
		 * @param {string} str the topicNamespace and topic string value
		 * @description returns a capitalised and slashes removed string.
		 * @return {string}
		 */
		_createHandlerFuncName : function (str) {
			var ret;
			if (str) {
				//capitalise the topic section names and remove slashes
				ret = this.capitaliseTopicName(str);
				ret = '_handle' + ret.replace(/[//]/g, '');
				if (ret) {
					return ret;
				}
			}
			return '';
		},

		/**
		 * @function
		 * @name rishson.control._Controller._wireSinglePub
		 * @private
		 * @param {string} topicName the string of the topic name
		 * @description autowire a single published topic from the child widget to an event handler on the controller widget.
		 */
		_wireSinglePub : function (topicName, initialWire) {
			var handlerFuncName, handlerFunc;

			// If event to wire is child initialised skip wiring as this was already wired in constructor.
			if (!initialWire && topicName.indexOf(Globals.CHILD_INTIALISED_TOPIC_NAME) !== -1) {
				return;
			}

			handlerFuncName = this._createHandlerFuncName(topicName);

			//the implementing class needs to have _handle[topicName] functions by convention
			handlerFunc = this[handlerFuncName];
			if (handlerFuncName && handlerFunc) {
				topic.subscribe(topicName, lang.hitch(this, handlerFunc));
			}
			else {
				console.error('Autowire failure for topic: ' + topicName + '. No handler: ' + handlerFuncName);
			}
		},

		getLayoutDomNode : function () {
			if (this.layout) {
				return this.layout.domNode;
			}
		}
    
    });
});