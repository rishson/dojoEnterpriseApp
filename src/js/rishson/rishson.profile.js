var profile = (function () {
	// This file should not be modified. You probably want to modify build.profile.js.
	var mids = {
			"rishson/rishson.profile": 1,
			"rishson/package.json": 1
		},
		testRE = /^rishson\/tests\//,
		buildRE = /^rishson\/build\//;

	function copyOnly(mid) {
		return mid in mids || testRE.test(mid);
	}

	return {
		resourceTags: {
			test: function (filename, mid) {
				return testRE.test(mid) || mid === "rishson/tests" || buildRE.test(mid) || mid === "rishson/build";
			},

			copyOnly: function (filename, mid) {
				return copyOnly(mid);
			},

			amd: function (filename, mid) {
				return !copyOnly(mid) && (/\.js/).test(filename);
			},

			miniExclude: function (filename, mid) {
				return false;
			}
		}
	};
})();
