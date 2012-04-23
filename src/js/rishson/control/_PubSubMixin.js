define([
	"rishson/Globals",	//TOPIC_NAMESPACE
	"dojo/_base/declare"	// declare
], function (Globals, declare) {

	/**
	 * @class
	 * @name rishson.widget.WidgetInWidgetMixin
	 * @description This is a class based version of Phil Higgin's awesome solution to memory leaks that can occur
	 * when creating widgets programatically inside custom widgets<p>
	 * Please see <a href='http://higginsforpresident.net/2010/01/widgets-within-widgets/'>here.</a>
	 */
	return declare('rishson.control._PubSubMixin', null, {

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
		 * @name rishson.widget._Widget._topicNamespace
		 * @type {string}
		 * @private
		 * @description This namespace is prepended to every topic name used by a derived widget
		 */
		_topicNamespace : '',

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

		createTopicNamespace : function (cls) {
			/*any derived widget can publish events on their own namespace so construct the widget namespace from
			 the declared class, but replace the . to be a / so it is standard topic conventions*/
			return '/' + cls.replace(/\./g, '/');
		},

		/**
		 * @function
		 * @name rishson.widget._Widget.addTopic
		 * @param topicRef {String} the object property (usually CAPITALISED) of the topic in the pubList
		 * @param topicName {String} the name of topic
		 * @param makeGlobal {Boolean} optional if true use the global topic namespace
		 * @description Syntaatic sugar to add items to a widgets pubList.
		 */
		addTopic : function (topicRef, topicName, makeGlobal) {
			if (!makeGlobal) {
				this.pubList[topicRef] = this._topicNamespace + topicName;
			}
			else {
				this.pubList[topicRef] = this._globalTopicNamespace + topicName;
			}
		}

	});
});