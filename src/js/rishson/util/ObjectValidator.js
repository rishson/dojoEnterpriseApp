define([
	"dojo/_base/declare", // declare
	"dojo/_base/lang", // isString, etc.
	"dojo/_base/array" // forEach
], function (declare, lang, arrayUtil) {

	/**
	 * @class
	 * @name rishson.util.ObjectValidator
	 * @description Helper class to validate constructor params
	 */
	return declare('rishson.util.ObjectValidator', null, {

		/**
		 * @field
		 * @name rishson.util.ObjectValidator.validationCriteria
		 * @type {Array.<Object>}
		 * @description contains all the validation criteria to examine
		 * Criteria are in the form:
		 *  {name : type}
		 *  where type can be [string|array|function|object]
		 */
		validationCriteria: null,

		/**
		 * @constructor
		 * @param {Array} validationCriteria contains all the validation criteria to examine
		 */
		constructor: function (validationCriteria) {
			this.validationCriteria = validationCriteria;
		},

		/**
		 * @function
		 * @name rishson.util.ObjectValidator.validate
		 * @description validates all the criteria for basic type safety
		 * @param {Array} params contains parameter data to validate against the criteria given in the constructor
		 * @returns {boolean} true if the params are of the required types, else false
		 */
		validate: function (params) {
			return this._validate(this.validationCriteria, params);
		},

		/**
		 * @function
		 * @name rishson.util.ObjectValidator.getValidationFailuresAsString
		 * @description Pretty print the validation failures
		 * @param {Array} params contains parameter data to validate against the criteria given in the constructor
		 * @returns {string} list of all failing parameters and the reason for type failure
		 */
		getValidationFailuresAsString: function (params) {
			var errStr = "Validation failures:",
				requiredType;

			arrayUtil.forEach(this.validationCriteria, function (criteria) {
				if (!this._validateParam(params, criteria)) {
					requiredType = 'a ' + criteria.paramType;
					if (criteria.paramType === 'criteria') {
						requiredType = 'correctly populated';
					}
					errStr += ' [' + criteria.paramName + ' is not ' + requiredType + ']';
				}
			}, this);
			return errStr;
		},

		/**
		 * @function
		 * @name rishson.util.ObjectValidator.logErrorToConsole
		 * @description Send the validation failures to the console as a complete group
		 * @param {Array} params contains parameter data to validate against the criteria given in the constructor
		 * @param {string} title a string that will be placed in the console group as a title for the error report
		 */
		logErrorToConsole: function (params, title) {
			console.group(title);
			console.error(this.getValidationFailuresAsString(params));
			console.groupEnd();
		},

		/**
		 * @function
		 * @name rishson.util.ObjectValidator._validate
		 * @private
		 * @description validates all the criteria for basic type safety
		 * @param {Array} params contains parameter data to validate against the criteria given in the constructor
		 * @returns {boolean} true if the params are of the required types, else false
		 */
		_validate: function (criteriaArray, params) {
			/*
			 This looks horrid.
			 If a param is invalid then teh loop return TRUE.
			 We use arrayUtil.some to see if any return TRUE (i.e.they failed) and then negate the arrayUtil.some
			 */
			return !arrayUtil.some(criteriaArray, function (criteria) {
				if (!this._validateParam(params, criteria)) {
					return true;
				}
			}, this);
		},

		/**
		 * @function
		 * @private
		 * @name rishson.util.ObjectValidator._validateParam
		 * @description validate each parameter against a type criteria. Only strings, arrays, functions and objects are
		 * validated. If the param is not of these types, then this method will return false.
		 * @param {Array} param a parameter to validate
		 * @param {Object} criteria the criteria to validate the parameter against
		 * @return {boolean} return true if the parameter is of the type required by the criteria, else false
		 */
		_validateParam: function (param, criteria) {
			var paramValue = param[criteria.paramName],
				paramType = criteria.paramType;

			if (paramType === 'string') {
				return lang.isString(paramValue);
			} else if (paramType === 'array') {
				return lang.isArray(paramValue);
			} else if (paramType === 'function') {
				return lang.isFunction(paramValue);
			} else if (paramType === 'object') {
				return lang.isObject(paramValue);
			} else if (paramType === 'criteria') {
				return this._validate(criteria.criteria, paramValue);
			} else {
				return false;
			}
		}
	});
});