define([
	"dojo/_base/declare"
], function (declare) {
	return declare(null, {
		validResponse: function () {
			return {logout: 'sucess'};
		},

		invalidResponse: function () {
			return {};
		}
	});
});
