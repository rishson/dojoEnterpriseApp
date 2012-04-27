define([
    "dojo/_base/declare",
    "rishson/widget/_Widget",
    "dojo/i18n!./nls/ScreeningForm",

    "dojo/domReady!"
], function(declare, _Widget, l10n){
    var ScreeningForm = declare([_Widget], {
        baseClass: "viewScreeningForm",
        l10n: l10n,
        constructor: function(args){
        },
		
        postCreate: function(){

            var optionStore = new dojo.store.Memory({data:field.options, idProperty: "name"});

            var field = new  FilteringSelect({
                store:optionStore,
                name:field.name,
                label: field.label,
                id: field.name,
                required : field.mandatory,
                missingMessage:"Please enter "+field.label,
                placeHolder: 'Enter '+field.label
            },this.domNode);

            this.inherited(arguments);
        },
		
        startup: function(){
            if(this._started){ return; }
			
            this.inherited(arguments);
        }
    });
	
    return ScreeningForm;
});
