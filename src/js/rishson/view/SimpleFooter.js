define([
    "rishson/widget/_Widget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!rishson/view/simpleFooter/SimpleFooter.html",
    "rishson/util/ObjectValidator",
    "dojo/_base/declare", // declare + safeMixin
    "dojo/_base/lang" // hitch
], function(_Widget, _TemplatedMixin, _WidgetsInTemplateMixin, template, ObjectValidator, declare){

    /**
     * @class
     * @name rishson.view.SimpleFooter
     * @description This is the topmost widget that is designed to contain your application.
     */
    return declare('rishson.view.SimpleFooter', [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {

        templateString : template,

        /**
         * @field
         * @name rishson.view.SimpleFooter.footerText
         * @type {String}
         * @description the Username of the currently logged in user to display in the header
         */
        footerText : '',

        /**
         * @constructor
         * @param {Object} params contains the username and footerText
         */
        constructor : function(params) {
            var criteria = [{paramName : 'footerText', paramType : 'string'}];
            var validator = new ObjectValidator(criteria);
            if (validator.validate(params)) {
                declare.safeMixin(this, params);
            }
            else {
                validator.logErrorToConsole(params, 'Invalid params passed to the SimpleFooter.');
                throw ('Invalid params passed to the SimpleFooter.');
            }
        },

        /**
         * @function
         * @name rishson.view.SimpleFooter
         * @override rishson.widget._Widget
         */
        postCreate : function () {
            this.inherited(arguments);  //rishson.widget._Widget
            this.dapFooterText.innerHTML = this.footerText;
        },

        /**
         * @function
         * @private
         * @param initialisedWidgetId {Object} the string id of the widget that has just been initialised.
         * @description Handle a widget becoming initialised.
         */
        _handleWidgetInitialisation : function (initialisedWidgetId) {

        }

    });
});