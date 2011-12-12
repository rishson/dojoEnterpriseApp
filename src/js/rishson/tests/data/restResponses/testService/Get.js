define([
    "dojo/_base/declare",
    "test/data/restResponses/RestResponse"
], function(declare, RestResponse){
    return declare('test.data.restResponses.testService.Get', RestResponse, {
        processRequest : function(params) {
            var status = params.status;
            if (status == 200) {
                //very simple echo reposonse
                return new RestResponse({payload : params});
            } else if (status == 400) {
                return new RestResponse({payload : params}, {xhr : {status : 400}});
            } else if (status == 403) {
                return new RestResponse({payload : params}, {xhr : {status : 403}});
            } else if (status == 409) {
                return new RestResponse({payload : params}, {xhr : {status : 409}});
            } else if (status == 123) {
                return new RestResponse({payload : params}, {xhr : {status : 123}});
            }
        }
    });
});
