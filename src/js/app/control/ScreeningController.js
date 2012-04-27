define([
	"dojo/_base/declare",	// declare
	"dojo/_base/lang",

	"app/view/ScreeningLayout",
	"app/view/FormBuilder",
	"app/control/SearchController",

	"rishson/control/_Controller"
], function (declare, lang, ScreeningLayout, FormBuilder, SearchController, _Controller) {
	return declare('app.control.ScreeningController', [_Controller], {
		view: null,
		SearchController: null,

		constructor: function (args) {
			this._loadingStages.push(this.SearchController);

			this.SearchController = this.adopt(SearchController, {}, null, true);
		},

		_formBuilderDataStubbedReceived: function () {
			var formDataJSON = {'fields':[
				{ 'name': 'searchName',
					'type':'input',
					'label':'Name',
					'mandatory':'true'
				},
				{ 'name': 'searchDOB',
					'type':'date',
					'label':'Date of Birth'
				},
				{ 'name': 'groupList',
					'type':'list',
					'label':'Group Name',
					'options': [
						{name:"Group A", value:"1"},
						{name:"Group B", value:"2"},
						{name:"Group C", value:"3"},
						{name:"Group D", value:"4"}
					]
				}
			],
				"formDetails":{
					"name":"searchForm"
				}
			};

//			this._appendWidget(testWidget);
		},

		_appendWidget: function (widget, args) {
			this.view.attachWidget(widget);
		},

		// This method should be generified by moving to _Controller.
		// The child id is then passed to the _loadingStages object or widget reference object to make the match.
		_handleAppControlScreeningControllerRishsonInitialised: function (id) {
			console.log(id);
		},

		_handleAppControlSearchControllerInstantiated: function () {
			console.log('screening is instantiated', this.SearchController);
			// If context is search, spin up search
			//this.orphan(this.SearchController, true);

			//console.log('search controller orphaned', this.SearchController);
		},

		_handleAppControlSearchControllerAppendWidget: function (widget) {
			this._appendWidget(widget);
		}
	});

});
