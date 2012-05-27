define([
	"dojo/_base/declare"
], function (declare) {
	return declare(null, {
		processRequest: function (params) {
			var status = params.status;
			if (status == 200) {
				return {payload: params, isOk: true};
			} else if (status === 400) {
				return {payload: params, isInvalid: true};
			} else if (status === 403) {
				return {payload: params, isUnauthorised: true};
			} else if (status === 409) {
				return {payload: params, isConflicted: true};
			} else if (status === 123) {
				return {};
			}
		}
	});
});
