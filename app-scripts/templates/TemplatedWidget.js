define([
    "dojo/_base/declare",   //declare
    "rishson/widget/_Widget",   //mixin
    "dijit/_TemplatedMixin",    //mixin
    /*If you are using widgets from within your template uncomment the following line and the uses of
     _WidgetsInTemplateMixin later in this file*/
    /*"dijit/_WidgetsInTemplateMixin",  //mixin*/
    "dojo/text!./resources/$className$.html",   //the widgets's template file
    "dojo/i18n!./nls/$className$"   //the widget's nls (string bundle) file
    //widgets found in the template go next (because they dont need to be passed into declare)
], function(declare, _Widget, _TemplatedMixin, /*_WidgetsInTemplateMixin,*/ template, l10n){
    var $className$ = declare([_Widget, _TemplatedMixin/*, _WidgetsInTemplateMixin*/], {

        /**
         * @field
         * @name $className$.baseClass
         * @type {String}
         * @description the base css class for this widget
         */
        baseClass: "$cssClassName$",

        /**
         * @field
         * @name $className$.templateString
         * @type {String}
         * @description the HTML template for this widget
         */
        templateString: template,   //this widget's template

        /**
         * @field
         * @name $className$.l10n
         * @type {Object}
         * @description the nls entries for this widget. These can be referenced in the widget template using
         * ${l10n.SOME_VALUE}, or referenced directly in code
         */
        l10n: l10n, //this widget's nls entries

        /**
         * @constructor
         * @param {Object} args
         */
        constructor: function(args){
        },

        /**
         * @function
         * @name $className$.postCreate
         * @override rishson.widget._Widget
         */
        postCreate: function(){
            this.inherited(arguments);
        },

        /**
         * @function
         * @name $className$.startup
         * @override rishson.widget._Widget
         */
        startup: function(){
            if(this._started){ return; }
            
            this.inherited(arguments);
        }
    });
    
    return $className$;
});
