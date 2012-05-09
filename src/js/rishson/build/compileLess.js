define(["require", "build/buildControl"], function (require, bc) {
	var path = require.nodeRequire("path"),
		less = require.nodeRequire("../less/lib/less");

	return function (resource, callback) {
		if (resource.tag.compileLess) {
			new (less.Parser)({
				paths: [path.dirname(resource.src)],
				optimization: 1,
				filename: resource.src
			}).parse(resource.text, function (err, tree) {
				try {
					resource.rawText = resource.text;
					resource.text = tree.toCSS({
						compress: bc.compressLess,
						yuicompress: false
					});
					resource.dest = resource.dest.replace(/\.less$/, ".css");
					callback(resource);
				} catch (e) {
					console.log(e);
				}
			});
			return callback;
		}
	};
});
