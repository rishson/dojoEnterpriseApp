define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/topic",
	//"app/view/SearchLayout",
	"rishson/control/MockTransport",
	"rishson/control/_Controller",
	"rishson/control/RestRequest",
	"rishson/Globals"
], function (declare, lang, topic, /*SearchLayout,*/ MockTransport, _Controller, RestRequest, Globals) {
    var searchController = declare('app.control.SearchController', [_Controller], {

        baseClass: "SearchController",

        constructor: function (args) {
			// Fudge to mimic other widgets being loaded.
			// It should be that child widget's initialised method publishes events which this controller listens to which can then republish up.
			var that = this;
			setTimeout(function () {
				topic.publish(that.pubList._INITIALISED_NAMESPACE,that._id);
			},1000);
        },

		_getUserContext: function () {
			var mockTransport, validLoginResponse, controller, request;

			mockTransport = new MockTransport({ namespace: 'test/data/' });

			validLoginResponse = {
				serviceRegistry: [],
				grantedAuthorities: [],
				returnRequest: true
			};

			controller = new _Controller(mockTransport, validLoginResponse);

			request = new RestRequest({
				service: 'user/context',
				verb: 'get',
				topic: this.subList.GET_USER_CONTEXT
			});

			topic.publish(globals.SEND_REQUEST, request);
		},

		_handleGetUserContext : function (response) {
			console.log('AWESOME', response.payload);
		}
    });
	
    return searchController;
});
