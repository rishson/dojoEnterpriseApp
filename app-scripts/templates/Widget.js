define([
    "dojo/_base/declare",   //declare
    "rishson/widget/_Widget",   //mixin
    "dojo/i18n!./nls/$className$"   //the nls (string bundle) for this widget
], function(declare, _Widget, l10n){
    var $className$ = declare([_Widget], {

        /**
         * @field
         * @name $className$.baseClass
         * @type {String}
         * @description the base css class for this widget
         */
        baseClass: "$cssClassName$",

        /**
         * @field
         * @name $className$.l10n
         * @type {Object}
         * @description the nls entries for this widget. These can be referenced in the widget template using
         * ${l10n.SOME_VALUE}, or referenced directly in code
         */
        l10n: l10n,

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
