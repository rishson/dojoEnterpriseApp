define([
	"dojo/_base/declare",
	"../RestResponse"
], function (declare, RestResponse) {
	return declare(RestResponse, {
		processRequest: function (params) {
			var status = params.status;
			if (status == 200) {
				//very simple echo reposonse
				return new RestResponse();
			} else if (status == 400) {
				return new RestResponse(null, {xhr: {status: 400}});
			} else if (status == 403) {
				return new RestResponse(null, {xhr: {status: 403}});
			} else if (status == 409) {
				return new RestResponse(null, {xhr: {status: 409}});
			} else if (status == 123) {
				return new RestResponse(null, {xhr: {status: 123}});
			}
		}
	});
});
