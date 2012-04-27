define([
	"rishson/Globals",	//TOPIC_NAMESPACE
	"dojo/_base/declare"	// declare
], function (Globals, declare) {

	/**
	 * @class
	 * @name rishson.control._PubSubMixin
     * @description Mixin to add basic pub/sub abilities
	 */
	return declare('rishson.control._PubSubMixin', null, {

		/**
		 * @field
		 * @name rishson.widget._Widget._globalTopicNamespace
		 * @type {string}
		 * @private
		 * @description This namespace is prepended to every topic name used by a derived class
		 */
		_globalTopicNamespace : Globals.TOPIC_NAMESPACE,

		/**
		 * @field
		 * @name rishson.control._PubSubMixin._topicNamespace
		 * @type {string}
		 * @private
		 * @description This namespace is prepended to every topic name used by a derived class
		 */
		_topicNamespace : '',

		/**
		 * @field
		 * @name rishson.control._PubSubMixin.pubList
		 * @type {{string : string}}
		 * @description Object that contains the list of topics that any derived class can publish
		 */
		pubList : null,

		/**
		 * @field
		 * @name rishson.control._PubSubMixin.subList
		 * @type {{string : string}}
		 * @description Object that contains the list of topics that any derived class can listen out for
		 */
		subList : null,

        /**
         * @function
         * @name rishson.control._PubSubMixin.createTopicNamespace
         * @param namespace {string} a class namespace (. separated) that will be turned into a topic (/ separated)
         * @description Replace all '.' with '/'
         */
		createTopicNamespace : function (namespace) {
			/*any derived widget can publish events on their own namespace so construct the widget namespace from
			 the declared class, but replace the . to be a / so it is standard topic conventions*/
			return '/' + namespace.replace(/\./g, '/');
		},

		/**
		 * @function
		 * @name rishson.control._PubSubMixin.addTopic
		 * @param topicRef {String} the object property (usually CAPITALISED) of the topic in the pubList
		 * @param topicName {String} the name of topic
		 * @param makeGlobal {Boolean} optional if true use the global topic namespace
		 * @description Syntaatic sugar to add items to a class's pubList.
		 */
		addTopic : function (topicRef, topicName, makeGlobal) {
			if (!makeGlobal) {
				this.pubList[topicRef] = this._topicNamespace + topicName;
			}
			else {
				this.pubList[topicRef] = this._globalTopicNamespace + topicName;
			}
		},

        /**
         * @function
         * @name rishson.control._PubSubMixin.capitaliseTopicName
         * @param {String} topic a name of a topic to capitalise.
         * @description capitalise the first letter of a topic.
         */
        capitaliseTopicName : function (topic) {
            /* e.g. /hello/i/am/a/topicName would become Hello/I/Am/A/TopicName
             */
            return topic.replace(/\b[a-z]/g, function (w) {
                return w.toUpperCase();
            });
        }

	});
});