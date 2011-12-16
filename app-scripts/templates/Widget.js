define([
	"dojo/_base/declare",
	"rishson/widget/_Widget",
	"dojo/i18n!./nls/$className$"
], function(declare, _Widget, l10n){
	var $className$ = declare([_Widget], {
		baseClass: "$cssClassName$",
		l10n: l10n,
		constructor: function(args){
		},

		postCreate: function(){
			this.inherited(arguments);
		},

		startup: function(){
			if(this._started){ return; }

			this.inherited(arguments);
		}
	});

	return $className$;
});
