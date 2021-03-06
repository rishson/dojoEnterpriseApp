define([
	"dojo/_base/declare", // declare
	"rishson/Base", //createTopicNamespace, _capitaliseTopicName
	"rishson/Globals", //TOPIC_NAMESPACE
	"dojo/_base/array", // forEach
	"dojo/_base/lang", // hitch
	"rishson/base/lang",
	"dojo/topic" // publish, subscribe
], function (declare, Base, Globals, arrayUtil, lang, rishsonLang, topic) {
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
		/**
		 * @field
		 * @name rishson._Controller._topicNamespace
		 * @type {string}
		 * @description This topic name space
		 */
		_topicNamespace: '',

		/**
		 * @constructor
		 */
		constructor: function () {
			// Create this controllers personalised topic namespace.
			this._topicNamespace = this.createTopicNamespace(this.declaredClass);
			this._id = this.declaredClass;

			this.subList = this.subList || {};
			// An array of topic name / subscription handle pairs
			// Needed for when the controller wants to unsubscribe from topics
			this.subListHandles = this.subListHandles || {};
		},

		/**
		 * @function
		 * @name rishson.control._Controller._autowirePubs
		 * @private
		 * @param {rishson.widget._Widget} child a widget that contains a pubList of topics that it can publish.
		 * @description autowire the published topics from the child widget to event handlers on the controller widget.
		 */
		_autowirePubs: function (child) {
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
		 * @name rishson.control._Controller._unAutoWireControllerPubs
		 * @description Un-subscribes this controller from subscriptions to the supplied widget
		 * @param {Object} The widget containing a list of published items
		 */
		_unAutoWirePubs: function (widget) {
			var pubList = widget.pubList || (widget.content || {}).pubList, // We want the actual widget if this widget is a ContentPane
				topicNamespace = this._topicNamespace;

			// Loop through the child widgets pubList
			rishsonLang.forEachObjProperty(pubList, function (pubHandleName) {
				// If the current controllers namespace appears within this widgets pubList item
				if (pubHandleName.indexOf(topicNamespace) !== -1) {
					var handle = this.subListHandles[pubHandleName];

					// If a handle was found then remove the subscription
					if (handle) {
						this.unsubscribe(handle);
						delete this.subListHandles[pubHandleName];
					}
				}
			}, this);
		},

		/**
		 * @function
		 * @name rishson.control._Controller._createHandlerFuncName
		 * @private
		 * @param {string} str the topicNamespace and topic string value
		 * @description returns a capitalised and slashes removed string.
		 * @return {string}
		 */
		_createHandlerFuncName: function (str) {
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
		_wireSinglePub: function (topicName) {
			var handlerFuncName, handlerFunc;

			handlerFuncName = this._createHandlerFuncName(topicName);

			//the implementing class needs to have _handle[topicName] functions by convention
			handlerFunc = this[handlerFuncName];

			if (handlerFuncName && handlerFunc) {
				// Subscribe to topic and keep a reference to the handle for unsubscribing
				this.subListHandles[topicName] = this.subscribe(topicName, lang.hitch(this, handlerFunc));
			} else {
				console.error('Autowire failure for topic: ' + topicName + '. No handler: ' + handlerFuncName);
			}
		},

		/**
		 * @function
		 * @name rishson.control._Controller.injectWidget
		 * @param {rishson.widget._Widget} widget a widget to examine for topics
		 * @description widgets injected into this class will be examined to autowire its publish and subscribes.<p>
		 * This function should be called for declarativly created widgets.
		 */
		injectWidget: function (widget) {
			this._autowirePubs(widget);
		},

		/**
		 * @function
		 * @name rishson.control._Controller.adopt
		 * @description widgets injected into this class will be examined to autowire its publish and subscribes.<p>
		 * This function should be called for programatically created widgets.
		 * @param {Object} Cls
		 * @param {Object=} props
		 * @param node
		 */
		adopt: function (Cls, props, node) {
			var child;
			props = props || {};
			// Pass in parents topic name space to all child views and controllers.
			props.parentTopicNamespace = this._topicNamespace;

			child = new Cls(props, node);

			if (!this._supportingWidgets) {
				this._supportingWidgets = [];	//awkward but this is a mixin class
			}
			this._supportingWidgets.push(child);

			this._autowirePubs(child);
			return child;
		}
	});
});