define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "rishson/widget/_Widget",
    "dijit/form/Form",
    "dojo/i18n!./nls/FormBuilder",
    "dojox/json/query",
    "dojo/_base/array",
    "dijit/form/ValidationTextBox",
    "dijit/form/DateTextBox",
    "dijit/form/FilteringSelect",
    "dojo/store/Memory",
    "dijit/form/Button",
    "dojox/layout/TableContainer",
    "dojo/on",
    "dojo/_base/event",
    "dojo/dom-form",
    "dojo/json",
    "dojo/domReady!"
], function (declare, lang, _Widget, Form, l10n, jsonQuery, array, ValidationTextBox, DateTextBox, FilteringSelect, Memory,
            Button, TableContainer, on, event, domForm, json) {
    /**
     * @class app.view.FormBuilder
     * @description Generates form based the JSON object
     */
    return declare("app.view.FormBuilder", [_Widget], {

        l10n: l10n,
        formData : null,

        formObject: null,

        tableContainer: null,

        tableCustomClass: null,

        formButton: null,

        formInputData: null,
        /**
         *
         * @param args
         */
        constructor: function (args) {
            this.formData = args.data;
            this.tableCustomClass = args.tableCustomClass;

        },
		
        postCreate: function () {

            this.formObject = this.buildFrom(this.formData);

            this.onSubmitHandler(this.formObject);

            this.inherited(arguments);
        },

        /**
         *
         * @param formData
         */
        buildFrom: function (formData) {

            var formObject = new Form({
                id: formData.formDetails.name,
                name: formData.formDetails.name,
                action: "",
                method: "post"

            }, this.domNode);

            this.tableContainer = new TableContainer({
                id: "formTableContainer",
                name: "formTableContainer",
                cols: 1,
                customClass: this.tableCustomClass,
                labelWidth: "200"
            });

            formObject.domNode.appendChild(this.tableContainer.domNode);

			array.forEach(formData.fields, lang.hitch(this, function (field) {
				switch (field.type) {
					case 'input':
						field = new  ValidationTextBox({
							name: field.name,
							label: field.label,
							id: field.name,
							required: field.mandatory,
							missingMessage: "Please enter "+field.label,
							placeHolder: 'Enter '+field.label
						});

                        this.tableContainer.addChild(field);

                    break;
                    case 'date':
                        field = new  DateTextBox({
                            name: field.name,
                            label: field.label,
                            id: field.name,
                            required: field.mandatory,
                            missingMessage:"Please enter "+field.label,
                            placeHolder: 'Enter '+field.label,
                            datePattern: "yyyy/MM/dd" // not sure how the date pattern need to be decided

                        });

                        this.tableContainer.addChild(field);

                    break;
                    case 'list':

                        var optionStore = new dojo.store.Memory({data:field.options, idProperty: "name"});

                        field = new  FilteringSelect({
                            store:optionStore,
                            name:field.name,
                            label: field.label,
                            id: field.name,
                            required : field.mandatory,
                            missingMessage:"Please enter "+field.label,
                            placeHolder: 'Enter '+field.label
                        });

                        this.tableContainer.addChild(field);

                        break;
                }


            }));

            this.formButton = new Button({
                id: "formButton",
                type:"submit",
                value:'Submit',
                label: 'Submit'

            });

            formObject.domNode.appendChild( this.formButton.domNode);

            this.tableContainer.startup();

            return formObject;

        },

        onSubmitHandler: function(form) {
            on(form,'submit',lang.hitch(this, function(evt){

                event.stop(evt);

                if (form.validate()) {

                    var formJSON = domForm.toJson(form.id);

                    var formInputData = json.parse(formJSON);

                    this.formInputData =  formInputData;

                } else {

                    this.formInputData =  false;

                }

            }));
        },
		
        startup: function(){
            if(this._started){ return; }
			
            this.inherited(arguments);
        }
    });
	

});
