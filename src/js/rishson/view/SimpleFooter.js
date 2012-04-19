define([
    "rishson/widget/_Widget",   //mixin
    "rishson/util/ObjectValidator", //validate
    "dijit/_TemplatedMixin",    //mixin
    "dijit/_WidgetsInTemplateMixin",    //mixin
    "dojo/text!rishson/view/simpleFooter/SimpleFooter.html",    //template
    "dojo/_base/declare"    // declare + safeMixin
], function(_Widget, ObjectValidator, _TemplatedMixin, _WidgetsInTemplateMixin, template, declare){

    /**
     * @class
     * @name rishson.view.SimpleFooter
     * @description An example widget that acts as a footer to a single page application.
     */
    return declare('rishson.view.SimpleFooter', [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {

        templateString : template,

        /**
         * @field
         * @name rishson.view.SimpleFooter.footerText
         * @type {String}
         * @description the text to place into the footer
         */
        footerText : '',

        /**
         * @field
         * @name rishson.view.SimpleFooter.footerLink
         * @type {String}
         * @description the href for the footer link
         */
        footerLink : '',

        /**
         * @constructor
         * @param {Object} params contains the footer link and footer text
         */
        constructor : function(params) {
            var criteria = [{paramName : 'footerText', paramType : 'string'},
                {paramName : 'footerLink', paramType : 'string'}];
            var validator = new ObjectValidator(criteria);
            if (validator.validate(params)) {
                declare.safeMixin(this, params);
            }
            else {
                validator.logErrorToConsole(params, 'Invalid params passed to the SimpleFooter.');
                throw ('Invalid params passed to the SimpleFooter.');
            }
        }
    });
});