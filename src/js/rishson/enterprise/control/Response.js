dojo.provide('rishson.enterprise.control.Response');

/**
 * @class
 * @name rishson.enterprise.control.Response
 * @description This class is used to wrap any server response.
 */
dojo.declare('rishson.enterprise.control.Response', null, {

    /**
     * @field
     * @name rishson.enterprise.control.Request.isOk
     * @type {boolean}
     * @description is the response OK. This equates to HTTP status code 200.
     */
    isOk : false,

    /**
     * @field
     * @name rishson.enterprise.control.Request.isConflicted
     * @type {boolean}
     * @description is the response indicating a conflicted server state. This equates to HTTP status code 409.
     */
    isConflicted : false,

   /**
     * @field
     * @name rishson.enterprise.control.Request.payload
     * @type {object}
     * @description the contents of the server response.
     */
    payload : null,


    /**
     * @constructor
     * @param {Object} params the server response
	 * @param {booelan} wasRestRequest was the server request a REST request
     */
    constructor : function (response, wasRestRequest) {

        //@todo remove {}&& prefix if added - should we be allowing comment-filtered anymore or is it an antipattern?
		if(wasRestRequest) {
			this._createFromRestResponse(response);    
		}
		else {
			//service responses should not have a blank payload
		    if(! response.payload) {
    			console.error('Invalid server response. No payload.');
            	throw('Invalid server response. No payload.');
        	}
			dojo.mixin(this, response);
		}
	},

	_createFromRestResponse : function(response) {
		
		switch(response.ioArgs.statusCode) {
			case 200:
				this.isOk = true;
				break;
			case 409:
				this.isConflicted = true;
				break;
		}
		this.payload = response.payload;		
	}
 
});
