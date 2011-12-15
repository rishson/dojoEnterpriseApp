define([
	'dojo/_base/declare',
	'rishson/widget/_Widget',
	'dijit/_TemplatedMixin',
	// If you are using widgets from within your template
	// uncomment the following lines and the uses of
	// _WidgetsInTemplateMixin later in this file
	/*'dijit/_WidgetsInTemplateMixin',*/
	'dojo/text!./resources/$className$.html',
	"dojo/i18n!./nls/$className$"
], function(declare, _Widget, _TemplatedMixin, /*_WidgetsInTemplateMixin,*/ template, l10n){
	var $className$ = declare([_Widget, _TemplatedMixin/*, _WidgetsInTemplateMixin*/], {
		baseClass: "$cssClassName$",
		templateString: template,
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
