define([
	"dojo/_base/declare", // declare
	"rishson/Globals", //TOPIC_NAMESPACE
	"dojo/_base/lang",	//mixin
	"dojo/topic", // publish/subscribe
	"dojo/_base/array" // forEach, indexOf
], function (declare, Globals, lang, topic, arrayUtil) {

	/**
	 * @class
	 * @name rishson.Base
	 * @description Base class for all objects
	 */
	return declare('rishson.Base', null, {
		/**
		 * @field
		 * @name rishson.Base.isInitialised
		 * @type {boolean}
		 * @description Is the widget initialised? Default to false - duh.
		 */
		isInitialised: false,

		/**
		 * @field
		 * @name rishson.Base._parentTopicNamespace
		 * @type {string}
		 * @description This namespace is prepended to every topic name used by a derived class
		 */
		parentTopicNamespace: '',

		/**
		 * @field
		 * @name rishson.Base.pubList
		 * @type {string}
		 * @description Object that contains the list of topics that any derived class can publish
		 */
		pubList: null,

		/**
		 * @field
		 * @name rishson.Base.subList
		 * @type {string}
		 * @description Object that contains the list of topics that any derived class can listen out for
		 */
		subList: null,

		/**
		 * @field
		 * @private
		 * @name rishson.Base._id
		 * @type {string}
		 * @description The unique id of a widget created with this base class.
		 */
		_id: null,

		/**
		 * @constructor
		 */
		constructor: function (args) {
			this.pubList = {};
			if (args) {
				lang.mixin(this, args);

				if (!this._supportingWidgets) {
					this._supportingWidgets = [];	//anything that does not derive from _Widget will not have this
				}

				this.addTopic('INITIALISED', Globals.CHILD_INTIALISED_TOPIC_NAME);
			}
		},

		/**
		 * @function
		 * @name rishson.Base.createTopicNamespace
		 * @param namespace {string} a class namespace (. separated) that will be turned into a topic (/ separated)
		 * @description Replace all '.' with '/'
		 */
		createTopicNamespace: function (namespace) {
			/*any derived widget can publish events on their own namespace so construct the widget namespace from
			 the declared class, but replace the . to be a / so it is standard topic conventions*/
			return '/' + namespace.replace(/\./g, '/');
		},

		/**
		 * @function
		 * @name rishson.Base.addTopic
		 * @param topicRef {string} the object property (usually CAPITALISED) of the topic in the pubList
		 * @param topicName {string} the name of topic
		 * @param makeGlobal {boolean=} makeGlobal if true use the global topic namespace
		 * @description Syntactic sugar to add items to a class's pubList.
		 */
		addTopic: function (topicRef, topicName, makeGlobal) {
			if (!makeGlobal) {
				this.pubList[topicRef] = this.parentTopicNamespace + topicName;
			} else {
				this.pubList[topicRef] = Globals.TOPIC_NAMESPACE + topicName;
			}
		},

		/**
		 * @function
		 * @name rishson.Base.capitaliseTopicName
		 * @param {string} topic a name of a topic to capitalise.
		 * @description capitalise the first letter of a topic.
		 * e.g. /hello/i/am/a/topicName would become Hello/I/Am/A/TopicName
		 */
		capitaliseTopicName: function (topic) {
			return topic.replace(/\b[a-z]/g, function (w) {
				return w.toUpperCase();
			});
		},

		/**
		 * @function
		 * @name rishson.widget._WidgetInWidget.adopt
		 * @description Instantiate some new item from a passed Class, with props with an optional srcNode (node)
		 * reference. Also tracks this widget as if it were a child to be destroyed when this parent widget
		 * is removed.
		 * @param {Function} Cls the class to instantiate. Cannot be a string. Use lang.getObject to get a full class object
		 * if you must.<p>
		 * example:<p>
		 *      this.adopt(my.ui.Button, { onClick: function(){} }).placeAt(this.domNode);<p>
		 * example:<p>
		 *      var x = this.adopt(my.ui.Button).placeAt(this.domNode);<p>
		 *      x.connect(this.domNode, "onclick", "fooBar");<p>
		 * example:<p>
		 *      //If you *must* new up a thinger and only want to adopt it once, use __addItem instead:<p>
		 *      var t;<p>
		 *      if(4 > 5){ t = new my.ui.Button(); }else{ t = new joost.ui.OtherButton() }<p>
		 *      this.__addItem(t);
		 * @param {Object} props optional an object mixed into the constructor of said cls.
		 * @param {Object} node optional a srcNodeRef to use with dijit._Widget. This thinger will be instantiated using
		 * this passed node as the target if passed. Otherwise a new node is created and you must placeAt() your
		 * instance somewhere in the dom for it to be useful.
		 * @returns {Object} the created Widget instance
		 */
		adopt: function (Cls, props, node) {
			props = props || {};
			var x = new Cls(props, node);
			this._supportingWidgets.push(x);

			return x; // my.class
		},

		/**
		 * @function
		 * @name rishson.widget._WidgetInWidget.orphan
		 * @description Remove a single item from this instance when we destroy it. It is the parent widget's job
		 * to properly destroy an orphaned child.<p>
		 * example:<p>
		 *      //Clear out all the children in an array, but do not destroy them.<p>
		 *      arrayUtil.forEach(this._thumbs, this.orphan, this);<p>
		 * example:<p>
		 *      //Create and destroy a button cleanly:<p>
		 *      var x = this.adopt(my.ui.Button, {});<p>
		 *      this.orphan(x, true);
		 * @param {Object} widget a widget reference to remove from this parent.
		 * @param {boolean} destroy an optional boolean used to force immediate destruction of the child.
		 * Pass any truthy value here and the child will be orphaned and killed.
		 */
		orphan: function (widget, destroy) {
			var i = arrayUtil.indexOf(this._supportingWidgets, widget);
			if (i >= 0) {
				this._supportingWidgets.splice(i, 1);
			}

			if (destroy) {
				try {
					if (widget && widget.destroyRecursive) {
						widget.destroyRecursive();
					}
				} catch (e) {
					//ignore errors thrown by IE when doing teardown of Grids whose domNode's get removed early
				}
			}
		},

		/**
		 * @function
		 * @private
		 * @description When the derived is ready then it can call this function to publish their state
		 */
		_initialise: function () {
			this.isInitialised = true;
			topic.publish(this.pubList.INITIALISED, this._id, this);
		}
	});
});