define([
	"dojo/_base/declare",
	"dojo/_base/lang"
], function (declare, lang) {
	return declare(null, {
		constructor: function (params, ioArgs) {
			lang.mixin(this, params);
			this.ioArgs = ioArgs || {xhr: {status: 200}};
		}
	});
});