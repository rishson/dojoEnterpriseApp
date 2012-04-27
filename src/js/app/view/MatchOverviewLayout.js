define([
    "dojo/_base/declare",

    "rishson/widget/_Widget",

	"dijit/_TemplatedMixin",
	"dojo/text!./resources/MatchOverviewLayout.html",
	"dojo/dom",
	"dojo/dom-construct",
	"dojo/topic",
    "dojo/i18n!./nls/MatchOverviewLayout"
], function (declare, _Widget, _TemplatedMixin, template, dom, domConstruct, topic, l10n) {
    var MatchOverviewLayout = declare('app.view.MatchOverviewLayout', [_Widget, _TemplatedMixin], {
        baseClass: "MatchOverviewLayout",
		templateString: template,
        l10n: l10n,

        constructor: function (args) {
			console.log('matchoverview constructor');
			this.addTopic('MATCHOVERVIEWLAYOUT_INSTANTIATED', '/MatchOverviewLayout/instantiated');
        },
		
        postCreate: function () {
			console.log('layout postcreate', this.pubList);
			topic.publish(this.pubList.MATCHOVERVIEWLAYOUT_INSTANTIATED);
        },
		
        startup: function () {
            if (this._started) { return; }

            this.inherited(arguments);
        },

		publishEvent: function () {
			topic.publish(this.pubList.MATCHOVERVIEWLAYOUT_INSTANTIATED);
		}
    });
	
    return MatchOverviewLayout;
});
