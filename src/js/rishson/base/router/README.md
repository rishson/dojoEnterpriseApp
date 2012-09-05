## Introduction
Routing is built into Rishson and helper methods are exposed in your controller widgets.

## Creating a route
The simplest way to create a route is to call `this.addRoute(name, params)` from a controller, passing in a name and a hash of parameters. This will create a `new Route()` and add it to the controllers `routes` object.

```js
this.addRoute("Search", {
	widget: searchForm,
	display: function (params, widget) {
		// Some display logic
	}
});
```

Most, if not all of of your public facing widgets should be associated with a route.

### this.addRoute(name, param)

`name` is a non-space delimited string used in the URL to reference the widget.

`param` is a hash of parameters that contains the following:

* `widget`: [Widget] The widget that the route belongs to
* `parameters`: [Array] An list of (GET) parameters that should be persisted in the URL
* `display`: [Function] A function that displays the widget
* `options`: [Object] A hash of options. _(Optional)_

### Parameters

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

The parameters array is used to define GET style key/value pairs. You need to define **all** potential parameters so that they can parsed correctly. Each parameter is an object containing the following members:

* `paramName`: [String] The name of the parameter key
* `paramType`: [String] A string denoting the value type, can be `string`, `boolean`, `number` or `array`
* `required`: [Boolean] Denotes whether the value must exist _(Optional)_
* `strict`: [Boolean] When true, empty arrays and empty strings will not pass validation _(Optional)_

### Validation
All parameters are validated for their types and (optionally) their existance. If a parameter does not pass  validation (i.e a `string` is passed to a numeric field, then validation will fail. To ensure that a parameter must always exist, use the `required` attribute.

### Display

The display function is used to display the widget to the end user. If you need to call this function programmatically then use `this.routes.RouteName.display(params)` optionally passing in a hash of parameters. The function receives a hash of route parameters and the widget as the first and second arguments.

Note that the display function is always ran in the parents context so that `this` can be used safely.

### Options

The options hash can include the following:
* `isDefault`: Sets the route to be the default child, this will be displayed when its parent is the last item in the route. There can only be one default route per controller.
* `suppressValidation`: When true, then `display` will always be called regardless of whether the parameters validate or not. Note that because of this you cannot assume that the parameters will have been cast correctly.