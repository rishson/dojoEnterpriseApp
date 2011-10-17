dojo.provide('rishson.enterprise.Globals');

/**
 * @class
 * @name rishson.enterprise.Globals
 * @description This is a constants class from anything that the whole application needs to know about.
 * Direct instantiation of this class is not required. In OO terms, this would be a static class. IN JavaScript, we
 * simply create an instance of this class after the class declaration. You can also use this pattern with classes
 * where there is no constructor; simply copy the class prototype over to the namespace in the DOM where an instance
 * would reside. Basically, syntactic sugar: my.namespace.SomeClass = my.namespace.SomeClass.prototype;
 */
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
 * Create an instance of this class so it is always available without other classes having to instantiate it.
 */
rishson.enterprise.Globals = new rishson.enterprise.Globals();