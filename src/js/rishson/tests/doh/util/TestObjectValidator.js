define([
	"doh",
	"rishson/util/ObjectValidator"
], function (doh, Validator) {

	doh.register("Validator tests", [
		{
			name: "Constructor test1",
			setUp: function () {
				constructorFailed = false;
			},
			runTest: function () {
				try {
					//invalid construction - no params passed to constructor
					var validator = new Validator();
				} catch (e) {
					constructorFailed = true;
				}
				doh.assertTrue(constructorFailed);
			},
			tearDown: function () {
			}
		},
		{
			name: "Constructor test2",
			setUp: function () {
				constructorFailed = false;
			},
			runTest: function () {
				try {
					//invalid construction - object passed is not an array
					var validator = new Validator({});
				} catch (e) {
					constructorFailed = true;
				}
				doh.assertTrue(constructorFailed);
			},
			tearDown: function () {
			}
		},
		{
			name: "Constructor test3",
			setUp: function () {
				constructorFailed = false;
			},
			runTest: function () {
				try {
					//invalid construction - array passed to constructor is empty
					var validator = new Validator([]);
				} catch (e) {
					constructorFailed = true;
				}
				doh.assertTrue(constructorFailed);
			},
			tearDown: function () {
			}
		},
		{
			name: "Validation test string",
			setUp: function () {
				criteria = [{paramName: 'exampleString', paramType: 'string'}];
				validationRes = false;
			},
			runTest: function () {
				//valid construction - 
				var validator = new Validator(criteria);
				validationRes = validator.validate({exampleString: 'hello'});
				doh.assertTrue(validationRes);
			},
			tearDown: function () {
			}
		},
		{
			name: "Validation test array",
			setUp: function () {
				criteria = [{paramName: 'exampleArray', paramType: 'array'}];
				validationRes = false;
			},
			runTest: function () {
				//valid construction - 
				var validator = new Validator(criteria);
				validationRes = validator.validate({exampleArray: []});
				doh.assertTrue(validationRes);
			},
			tearDown: function () {
			}
		},
		{
			name: "Validation test boolean",
			setUp: function () {
				criteria = [{paramName: 'exampleBoolean', paramType: 'boolean'}];
				validationRes = false;
			},
			runTest: function () {
				//valid construction - 
				var validator = new Validator(criteria);
				validationRes = validator.validate({exampleBoolean: true});
				doh.assertTrue(validationRes);
			},
			tearDown: function () {
			}
		},
		{
			name: "Validation test function",
			setUp: function () {
				criteria = [{paramName: 'exampleFunction', paramType: 'function'}];
				validationRes = false;
			},
			runTest: function () {
				//valid construction - 
				var validator = new Validator(criteria);
				validationRes = validator.validate({exampleFunction: function () {}});
				doh.assertTrue(validationRes);
			},
			tearDown: function () {
			}
		},
		{
			name: "Validation test object",
			setUp: function () {
				criteria = [{paramName: 'exampleObject', paramType: 'object'}];
				validationRes = false;
			},
			runTest: function () {
				//valid construction - 
				var validator = new Validator(criteria);
				validationRes = validator.validate({exampleObject: {}});
				doh.assertTrue(validationRes);
			},
			tearDown: function () {
			}
		},
		{
			name: "Validation test criteria",
			setUp: function () {
				criteria = [{paramName: 'exampleCriteria', paramType: 'criteria', criteria: [
					{paramName: 'exampleString', paramType: 'string'}
					]
				}];
				validationRes = false;
			},
			runTest: function () {
				//valid construction - 
				var validator = new Validator(criteria);
				validationRes = validator.validate({exampleCriteria: {exampleString: 'hello'}});
				doh.assertTrue(validationRes);
			},
			tearDown: function () {
			}
		},
		{
			name: "Validation test: array with criteria",
			setUp: function () {
				criteria = [{paramName: 'exampleCriteria', paramType: 'array', criteria: [
					{paramName: 'exampleString', paramType: 'string'}
				]}];
				validationRes = false;
			},
			runTest: function () {
				//valid construction - 
				var validator = new Validator(criteria);
				validationRes = validator.validate({exampleCriteria: [{exampleString: 'hello'}]});
				doh.assertTrue(validationRes);
			},
			tearDown: function () {
			}
		},
		{
			name: "Validation test: array with invalid criteria",
			setUp: function () {
				criteria = [{paramName: 'exampleCriteria', paramType: 'array', criteria: [
					{paramName: 'exampleString', paramType: 'string'}
				]}];
				validationRes = false;
			},
			runTest: function () {
				//valid construction - 
				var validator = new Validator(criteria);
				validationRes = validator.validate({exampleCriteria: [{exampleString: false}]});
				doh.assertFalse(validationRes);
			},
			tearDown: function () {
			}
		},
		{
			name: "Validation test: array with strict",
			setUp: function () {
				criteria = [{paramName: 'exampleArray', paramType: 'array', strict: true}];
				validationRes = false;
			},
			runTest: function () {
				//valid construction - 
				var validator = new Validator(criteria);
				validationRes = validator.validate({exampleArray: []});
				doh.assertFalse(validationRes);
			},
			tearDown: function () {
			}
		},
		{
			name: "Validation test: string with strict",
			setUp: function () {
				criteria = [{paramName: 'exampleString', paramType: 'string', strict: true}];
				validationRes = false;
			},
			runTest: function () {
				//valid construction - 
				var validator = new Validator(criteria);
				validationRes = validator.validate({exampleString: ''});
				doh.assertFalse(validationRes);
			},
			tearDown: function () {
			}
		},
		{
			name: "Validation test: object with incorrect module",
			setUp: function () {
				criteria = [{paramName: 'exampleObject', paramType: 'object', moduleName: 'rishson/control/Request'}];
				validationRes = false;
			},
			runTest: function () {
				//valid construction - 
				var validator = new Validator(criteria);
				validationRes = validator.validate({exampleObject: {callback: null, callbackScope: this}});
				doh.assertFalse(validationRes);
			},
			tearDown: function () {
			}
		},
		{
			name: "Validation test: object with correct module",
			setUp: function () {
				criteria = [{paramName: 'exampleObject', paramType: 'object', moduleName: 'rishson/control/Request'}];
				validationRes = false;
			},
			runTest: function () {
				//valid construction - 
				var validator = new Validator(criteria);
				validationRes = validator.validate({exampleObject: {callback: function () {}, callbackScope: this}});
				doh.assertTrue(validationRes);
			},
			tearDown: function () {
			}
		}
	]);
});