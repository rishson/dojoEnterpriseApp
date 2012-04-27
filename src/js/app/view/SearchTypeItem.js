define([
    "dojo/_base/declare",
    "rishson/widget/_Widget",
    "dijit/_TemplatedMixin",
    // If you are using widgets from within your template
    // uncomment the following line and the uses of
    // _WidgetsInTemplateMixin later in this file
    /*"dijit/_WidgetsInTemplateMixin",*/
    "dojo/text!./resources/SearchTypeItem.html",
    "dojo/i18n!./nls/searchTypeItem"
], function(declare, _Widget, _TemplatedMixin, /*_WidgetsInTemplateMixin,*/ template, l10n){
	var searchTypeItem = declare([_Widget, _TemplatedMixin/*, _WidgetsInTemplateMixin*/], {
        baseClass: "searchTypeItem",
        templateString: template,
        l10n: l10n,

        constructor: function(args){
			//set the values inside the template
			this.title = args.item.title;
			this.icon = args.item.icon;
			this.searchName = args.item.title;
			console.log('A search item constructed');
        },
        
        postCreate: function(){


            this.inherited(arguments);
        },
        
        startup: function(){
            if(this._started){ return; }
            
            this.inherited(arguments);
        }
    });
    
    return searchTypeItem;
});
