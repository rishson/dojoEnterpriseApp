define([
    "dojo/_base/declare",
    "dojo/_base/lang",
	"dojo/on",
	"dojo/dom",
	"dojo/dom-construct",
	"dojo/topic",
    "rishson/widget/_Widget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
	"dojo/text!./resources/ScreeningLayout.html",
    "dojo/i18n!./nls/ScreeningLayout"
], function (declare, lang, on, dom, domConstruct, topic, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, template, l10n) {
    var ScreeningLayout = declare([_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
        baseClass: "ScreeningLayout",
        templateString: template,
        l10n: l10n,

        constructor: function (args) {
			lang.mixin(this, args);
        },

        postCreate: function () {
            this.inherited(arguments);

        },

        startup: function () {
            if (this._started) { return; }
			//TODO: replace byId.placeholder with parent controller's layout's node reference to place at.
			domConstruct.place(this.domNode, dom.byId('placeholder'));

            this.inherited(arguments);
        },

		attachWidget: function (widget) {
			var widget = new FormBuilder({data:formDataJSON,tableCustomClass:"labelsAndValues"});
			testWidget.startup();

			domConstruct.place(widget, this.domNode);
		}
    });

    return ScreeningLayout;
});
