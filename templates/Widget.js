define([
	"dojo/_base/declare",
	"rishson/widget/_Widget"
], function(declare, _Widget){
	var $className$ = declare([_Widget], {
		baseClass: "$cssClassName$",
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
