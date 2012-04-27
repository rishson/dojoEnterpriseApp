define([
    "dojo/_base/declare",
    "rishson/widget/_Widget",
    "dijit/_TemplatedMixin",
    // If you are using widgets from within your template
    // uncomment the following line and the uses of
    // _WidgetsInTemplateMixin later in this file
    /*"dijit/_WidgetsInTemplateMixin",*/
    "dojo/text!./resources/SearchType.html",
    "dojo/i18n!./nls/searchType",
	"dojo/_base/array",
	"dojo/_base/lang",
	"dojo/on",
	"app/view/SearchTypeItem",
	"dojo/dom-construct",
	"dojo/dom"
], function(declare, _Widget, _TemplatedMixin, /*_WidgetsInTemplateMixin,*/ template, l10n, array,
			lang,on,SearchTypeItem,domConstruct,dom){
    var SearchType = declare('app.view.SearchType',[_Widget, _TemplatedMixin/*, _WidgetsInTemplateMixin*/], {
        baseClass: "searchType",
        templateString: template,
        l10n: l10n,
		searchTypes : [], //all the searchtypes to add to the list


        constructor: function(args){
			//@todo args.searchTypeOptions array check
			this.searchTypes = args.searchTypeOptions;
        },
        
        postCreate: function(){

			//create searchType container
			var searchContainer = domConstruct.create("div");
			var ulItemsList = domConstruct.create("ul");

			//populate the ul with search items
			var liSearchItem,
				liAttributes,
				divIcon,
				iconAttr,
				divIconImg,
				divTitle;
			array.forEach(this.searchTypes, lang.hitch(this,function(item){
				liAttributes = {
					title:item.title
				};
				liSearchItem = domConstruct.create('li',liAttributes);

				//place the div with the background img
				iconAttr = {'class':item.itemClass + ' iconImg'};
				divIconImg = domConstruct.create('div',iconAttr);
				domConstruct.place(divIconImg,liSearchItem);

				//place the search item title
				divTitle = domConstruct.create('div',{'class':'iconName', innerHTML:item.title});
				domConstruct.place(divTitle,liSearchItem);

				domConstruct.place(liSearchItem,ulItemsList);
			}));

			domConstruct.place(ulItemsList,searchContainer);
			domConstruct.place(searchContainer,this.domNode);


			//for each of the searchTypeOptions, add it as a searchTypeItem widget to this widget
//			array.forEach(this.searchTypes, function(item){
//				var searchItem = new SearchTypeItem({"item" : item });
//				searchItem.placeAt(this.iconPoints);
//
////				on(item.domNode,'click',function(evt){
////					alert('search item clicked');
////					console.log(evt);
////				});
//
//			},this);


            this.inherited(arguments);
        },

        
        startup: function(){
            if(this._started){ return; }
            
            this.inherited(arguments);
        }

    });
    
    return SearchType;
});
