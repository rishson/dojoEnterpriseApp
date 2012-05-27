define([
	"dojo/_base/declare",
	"rishson/control/Response"
], function (declare, Response) {
	return declare(null, {
		processRequest: function (params) {
			var status = params.status;
			if (status === 200) {
				//very simple echo reposonse
				return new Response({payload: params}, {xhr: {status: 200}});
			} else if (status === 400) {
				return new Response({payload: params}, {xhr: {status: 400}});
			} else if (status === 403) {
				return new Response({payload: params}, {xhr: {status: 403}});
			} else if (status === 409) {
				return new Response({payload: params}, {xhr: {status: 409}});
			} else if (status === 123) {
				return new Response({payload: params}, {xhr: {status: 123}});
			}
		}
	});
});
