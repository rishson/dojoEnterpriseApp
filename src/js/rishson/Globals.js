define([
    "dojo/_base/declare" // declare
], function(declare){

    // TODO: ditch declare?
    
    /**
     * @class
     * @name rishson.Globals
     * @description This is a constants class from anything that the whole application needs to know about.
     * Direct instantiation of this class is not required. In OO terms, this would be a static class. IN JavaScript, we
     * simply create an instance of this class after the class declaration. You can also use this pattern with classes
     * where there is no constructor; simply copy the class prototype over to the namespace in the DOM where an instance
     * would reside. Basically, syntactic sugar: my.namespace.SomeClass = my.namespace.SomeClass.prototype;
     */
    var Globals = declare(null, {
    
        /**
         * @field
         * @name rishson.Globals.TOPIC_NAMESPACE
         * @type {String}
         * @description This namespace is prepended to every topic name
         */
        TOPIC_NAMESPACE : '/rishson/enterprise/widget',
    
       /**
         * @constructor
         */
        constructor : function () {
            this.SEND_REQUEST = this.TOPIC_NAMESPACE + '/request/send';
        }
    });
    
    /**
     * Create an instance of this class so it is always available without other classes having to instantiate it.
     */
    return new Globals();

});
