dojo.provide('rishson.enterprise.util.ObjectValidator');

/**
 * @class
 * @name rishson.enterprise.util.ObjectValidator
 * @description Helper class to validate constructor params
 */
dojo.declare('rishson.enterprise.util.ObjectValidator', null, {

    /**
     * @field
     * @name rishson.enterprise.util.ObjectValidator.validationCriteria
     * @type {Array}
     * @description contains all the validation criteria to examine
     * Criteria are in the form:
     *  {name : type}
     *  where type can be [string|array|function|object]
     */
    validationCriteria : null,

    /**
     * @constructor
     * @param {Array} validationCriteria contains all the validation criteria to examine
     */
    constructor : function (validationCriteria) {
       this.validationCriteria = validationCriteria;
    },

    /**
     * @function
     * @name rishson.enterprise.util.ObjectValidator.validate
     * @description validates all the criteria for basic type safety
     * @param {Array} params contains parameter data to validate against the criteria given in the constructor
     * @returns {Boolean} true if the params are of the required types, else false
     */
    validate : function (params) {
        return this._validate(this.validationCriteria, params);
    },
    
    /**
     * @function
     * @name rishson.enterprise.util.ObjectValidator.getValidationFailuresAsString
     * @description Pretty print the validation failures
     * @param {Array} params contains parameter data to validate against the criteria given in the constructor
     * @returns {String} list of all failing parameters and the reason for type failure
     */
    getValidationFailuresAsString : function (params) {
        var errStr = "Validation failures:";
        var requiredType;
        dojo.forEach(this.validationCriteria, function (criteria) {
            if(! this._validateParam(params, criteria)) {
                requiredType = 'a ' + criteria.paramType;
                if(criteria.paramType === 'criteria'){
                    requiredType = 'correctly populated';
                }
                errStr += ' [' + criteria.paramName + ' is not ' + requiredType + ']';
            }
        }, this);
        return errStr;
    },

    /**
     * @function
     * @name rishson.enterprise.util.ObjectValidator.logErrorToConsole
     * @description Send the validation failures to the console as a complete group
     * @param {Array} params contains parameter data to validate against the criteria given in the constructor
     * @param {String} title a string that will be placed in the console group as a title for the error report
     */
    logErrorToConsole : function (params, title) {
        console.group(title);
        console.error(this.getValidationFailuresAsString(params));
        console.groupEnd();
    },

    /**
     * @function
     * @name rishson.enterprise.util.ObjectValidator._validate
     * @private
     * @description validates all the criteria for basic type safety
     * @param {Array} params contains parameter data to validate against the criteria given in the constructor
     * @returns {Boolean} true if the params are of the required types, else false
     */
    _validate : function(criteriaArray, params){
        /*
            This looks horrid.
            If a param is invalid then teh loop return TRUE.
            We use dojo.some to see if any return TRUE (i.e.they failed) and then negate the dojo.some
         */
        return ! dojo.some(criteriaArray, function (criteria) {
            if(! this._validateParam(params, criteria)) {
                return true;
            }
        }, this);
    },

    /**
     * @function
     * @private
     * @name rishson.enterprise.util.ObjectValidator._validateParam
     * @description validate each parameter against a type criteria. Only strings, arrays, functions and objects are
     * validated. If the param is not of these types, then this method will return false.
     * @param {Array} param a parameter to validate
     * @param {Object} criteria the criteria to validate the parameter against
     * @return {Boolean} return true if the parameter is of the type required by the criteria, else false
     */
    _validateParam : function (param, criteria) {
        var paramValue = param[criteria.paramName];

        switch(criteria.paramType) {
            case 'string' :
                return dojo.isString(paramValue);
            case 'array' :
                return dojo.isArray(paramValue);
            case 'function' :
                return dojo.isFunction(paramValue);
            case 'object' :
                return dojo.isObject(paramValue);
            case 'criteria' :
                return this._validate(criteria.criteria, paramValue);
            default :
                return false;
        }
    }
    
});