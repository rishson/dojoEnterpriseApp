define([
	"dojo/_base/declare", // declare
	"dojo/_base/lang", // mixin
	"rishson/control/Response",	//override
	"rishson/util/ObjectValidator"	//validate
], function (declare, lang, Response, Validator) {
	/**
	 * @class
	 * @name rishson.control.Response
	 * @description This class is used to wrap an authentication request. A failure to authenticate will be indicated
	 * with the 'isAuthorised' flag on the parent class.
	 */
	return declare('rishson.control.LoginResponse', null, {

		/**
		 * @field
		 * @name rishson.control.LoginResponse.grantedAuthorities
		 * @type {array<string>}
		 * @description a list of permissions or granted authorities for the user.
		 */
		grantedAuthorities: null,

		/**
		 * @field
		 * @name rishson.control.LoginResponse.apps
		 * @type {array<{id: string, description: string, caption: string, grantedAuthorities: array<string}>,
		 * baseUrl: string, iconClass}
		 * @description a list of permissions or granted authorities for the user.
		 */
		apps: null,

		/**
		 * @field
		 * @name rishson.control.LoginResponse.username
		 * @type {string}
		 * @description the username of the authenticated user
		 */
		username: '',

		/**
		 * @field
		 * @name rishson.control.Request.isUnauthorised
		 * @type {boolean}
		 * @description is the response indicating that the request was not authorised. This equates to HTTP status code 403.
		 */
		isUnauthorised: false,

		/**
		 * @constructor
		 */
		constructor: function (response) {
			var criteria = [
					{paramName: 'username', paramType: 'string', strict: true},
					{paramName: 'grantedAuthorities', paramType: 'array', strict: true},
					{paramName: 'apps', paramType: 'array', criteria: [
						{paramName: 'id', paramType: 'string', strict: true},
						{paramName: 'caption', paramType: 'string'},
						{paramName: 'description', paramType: 'string'},
						{paramName: 'iconClass', paramType: 'string'},
						{paramName: 'baseUrl', paramType: 'string'},
						{paramName: 'grantedAuthorities', paramType: 'array'},
						{paramName: 'module', paramType: 'string', strict: true}
					]}
				],
				validator = new Validator(criteria);

				//collect up the params and validate
			if (validator.validate(response.payload)) {
				lang.mixin(this, response.payload);
				this.isUnauthorised = response.isUnauthorised;
			} else {
				validator.logErrorToConsole(response.payload, 'Invalid construction of LoginResponse');
				throw ('Invalid construction of LoginResponse');
			}
		}
	});
});