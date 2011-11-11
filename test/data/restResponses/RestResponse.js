dojo.provide('test.data.restResponses.RestResponse');

dojo.declare('test.data.restResponses.RestResponse', null, {

	constructor : function(params, ioArgs) {

		dojo.mixin(this, params);
		if(!ioArgs){
			this.ioArgs = {
				statusCode : 200
			};
		}
	}

});
