define([
	'dojo/_base/declare',
	'rishson/widget/_Widget',
	'dijit/_TemplatedMixin',
	'dojo/text!./resources/$className$.html'
], function(declare, _Widget, _TemplatedMixin, template){
	var $className$ = declare([_Widget, _TemplatedMixin], {
		baseClass: "$cssClassName$",
		templateString: template,
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
