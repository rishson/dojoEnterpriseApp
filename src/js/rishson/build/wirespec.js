define([], function () {
	function parseModules(deps, object) {
		var name, value;
		for (name in object) {
			value = object[name];

			if ((name === "module" || name === "create" || name === "wire" || name === "spec") && typeof value === "string") {
				deps.push(value);
			}

			if (Array.isArray(value)) {
				value.forEach(parseModules.bind(this, deps));
			} else if (typeof value === "object") {
				parseModules(deps, value);
			}
		}
	}

	return function (resource) {
		var spec, deps = [];

		function simulatedDefine(object) {
			spec = object;
		}

		if (resource.tag.wirespec) {
			(new Function("define", resource.text))(simulatedDefine);
			parseModules(deps, spec);

			resource.layer = { include: [ resource.mid ].concat(deps), exclude: [ "dojo/dojo" ] };
		}
	};
});
