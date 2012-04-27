define([
    "dojo/_base/declare",
    "rishson/widget/_Widget",
    "dojo/i18n!./nls/search",
	"dijit/form/FilteringSelect",
	"dojo/store/Memory",
	"dojo/topic",
	"dojo/_base/lang"

], function(declare, _Widget, l10n, FilteringSelect, Memory,topic,lang){
    var search = declare([_Widget], {
        baseClass: "search",
        l10n: l10n,
		groupsListStore: null,

        constructor: function(args){
			this.addTopicSubList('GROUP_RESPONSE','search/GetGroups');
        },
		
        postCreate: function(){
			topic.subscribe(this.subList.GROUP_RESPONSE, lang.hitch(this, "_handleGroupsListReturned"));

			this.groupsListStore = new Memory({data:[]});

			var fs = new FilteringSelect({
				id:'groupList',
				store: this.groupsListStore,
				name: "state",
				value: "CA",
				searchAttr: "name"
			}, this.domNode);

            this.inherited(arguments);
        },

		_handleGroupsListReturned : function (data) {
			this.groupsListStore.setData(data);
		},
		
        startup: function(){
            if(this._started){ return; }
			
            this.inherited(arguments);
        }
    });
	
    return search;
});
