define(["exports"], function (exports) {

    /**
     * @class
     * @name rishson.Globals
     * @description This is a constants class from anything that the whole application needs to know about.
     */

    /**
     * @field
     * @name rishson.Globals.TOPIC_NAMESPACE
     * @type {string}
     * @description This namespace is prepended to every topic name
     */
    exports.TOPIC_NAMESPACE = '/rishson';

	/**
	 * @field
	 * @name rishson.Globals.TOPIC_NAMESPACE
	 * @type {string}
	 * @description This namespace is prepended to every topic name
	 */
	exports.INITIALISED_TOPIC = exports.TOPIC_NAMESPACE + '/initialised';

	/**
	 * @field
	 * @name rishson.Globals.TOPIC_NAMESPACE
	 * @type {string}
	 * @description This namespace is prepended to every topic name
	 */
    exports.SEND_REQUEST = exports.TOPIC_NAMESPACE + '/request/send';
});
