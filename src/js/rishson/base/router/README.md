# Router

## Introduction
Routing is built into Rishson and helper methods are exposed in your controller widgets.

## Creating a route
The simplest way to create a route is to call `this.addRoute(name, params)` passing in a name and a hash of parameters. This will create a `new Route()` and add it to the controllers `routes` object.

```js
this.addRoute("Search", {
	widget: searchForm,
	display: function (params, widget) {
		// Some display logic
	}
});
```

### this.addRoute(name, param)

`name` is a non-space delimited string used in the URL to reference the widget.

`param` is a hash of parameters that contains the following:

* `widget`: [Widget] The widget that the route belongs to
* `parameters`: [Array] An list of (GET) parameters that should be persisted in the URL
* `display`: [Function] A function that displays the widget
* `options`: [Object] A hash of options. _(Optional)_

### Parameters

The parameters array is used to define GET style key/value pairs. You **must** define all potential parameters otherwise they will not be parsed. Each parameter must be an object containing the following members:

* `paramName`: [String] The name of the parameter key
* `paramType`: [String] A string denoting the value type, can be `string`, `boolean`, `number` or `array`
* `required`: [Boolean] Denotes whether the value must exist _(Optional)_
* `strict`: [Boolean] When true, empty arrays and empty strings will not pass validation _(Optional)_

```js
this.addRoute("SearchTaxonomies", {
	widget: searchForm,
	parameters: [
		{ paramName: "keywords", paramType: "string", required: true },
		{ paramName: "taxonomies", paramType: "array" },
		{ paramName: "page", paramType: "number" }
	],
	display: function (params, widget) {
		// Parameters have been parsed!
		var page = params.page || 0;
		alert("User searched for " + params.keywords + " on page " + page);
	}
);
```
### Validation
All parameters are validated for their type. If a parameter does not pass type validation (i.e a `string` is passed to a `number` field, then validation will fail. To ensure that a parameter must always exist, use the `required` attribute.

### Display

The display function is used to display the widget to the end user. If you need to call this function programmatically then use `this.routes.RouteName.display()`. The function is passed the parsed parameters and the widget.

### Options

The options hash may include the following options.
* `isDefault`: Sets the route as the default, so that it is displayed when its parent is the last item in the route. There can only be one default per controller.
* `suppressValidation`: When true, then `display` will always be called regardless of whether the parameters validate or not. Note that you cannot assume that the parameters will have been cast properly when this is true.