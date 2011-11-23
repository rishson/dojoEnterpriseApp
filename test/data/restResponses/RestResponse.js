dojo.provide('test.data.restResponses.RestResponse');

dojo.declare('test.data.restResponses.RestResponse', null, {

	constructor : function(params, ioArgs) {

		dojo.mixin(this, params);
		this.ioArgs = ioArgs || {xhr : {status : 200}};
	}

});
