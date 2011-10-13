dojo.provide('rishson.enterprise.Globals');

dojo.declare('rishson.enterprise.Globals', null, {

    /**
     * @field
     * @name rishson.enterprise.Globals.TOPIC_NAMESPACE
     * @type {String}
     * @private
     * @description This namespace is prepended to every topic name
     */
    TOPIC_NAMESPACE : '/rishson/enterprise/widget',

    constructor : function () {
        this.TOPIC_USER_LOGOUT = this.TOPIC_NAMESPACE + '/user/logout'
    }
});

/**
 * Copy the prototype of this class into our namespace so it is always available without direct instantiation
 */
rishson.enterprise.Globals = new rishson.enterprise.Globals();