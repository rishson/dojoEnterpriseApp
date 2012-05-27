define([
	"dojo/_base/xhr",
	"dojox/io/xhrPlugins"
], function (xhr, xhrPlugins) {
	function findMatch(handlers, url) {
		var i = 0, handler, match;
		while ((handler = handlers[i++])) {
			match = url.match(handler[0]);
			if (match) {
				return [match, handler];
			}
		}
		return null;
	}

	function mockXhrDef(args) {
		var def = xhr._ioSetArgs(
			args,
			function (dfd) {
				// cancel
				dfd.canceled = true;
				var err = dfd.ioArgs.error;
				if (!err) {
					err = new Error("xhr cancelled");
					err.dojoType = "cancel";
				}
				return err;
			},
			function (result) {
				// ok
				return result;
			},
			function (error, dfd) {
				// error
				if (!dfd.ioArgs.args.failOk) {
					console.error(error);
				}
				return error;
			}
		);
		def.ioArgs.xhr = {
			abort: function () {
			}
		};

		return def;
	}

	function xhrTimeout(def) {
		if (def.fired > -1 || def.canceled) {
			return;
		} // already fired/aborted

		// mimic dojo/_base/xhr's timeout behavior
		var err = new Error("timeout exceeded");
		err.dojoType = "timeout";
		// dojo/_base/xhr rejects then cancels, but in that case,
		// cancel() never gets called directly via Deferred logic,
		// but the XHR is removed from the "in-flight" array.
		// Here we just set canceled = true to flag it.
		def.reject(err);
		def.canceled = true;
	}

	var TestService = {}, utils;

	TestService.register = function (options) {
		// Registers a new test service.
		// options supports the following properties:
		// * baseUrl: used as base URL for registering XHR plugin;
		//   also represents common part of URL to be stripped from all
		//   service URLs before matching against handler URL patterns
		// * handlers: array of arrays; inner arrays must contain 2 items:
		//   a URL RegExp and a handler function which should be invoked upon match.
		//   An optional 3rd array item can specify a delay (in ms) to wait
		//   before running the handler.
		//   Handler functions run in the scope of the TestService instance, and
		//   are passed any matches from capturing groups, followed by the
		//   parameters normally passed to the xhr function (method, args, hasBody)
		// * delay: delay (in ms) to wait before firing handlers by default for
		//   simulation of asynchronous XHRs.  If unspecified, defaults to 500ms.

		var baseUrl = this.baseUrl = options.baseUrl || "/testServices/",
			baseUrlLength = baseUrl.length,
			handlers = options.handlers;

		var i = 0, handler;
		while ((handler = handlers[i++])) {
			// convert any string URL patterns to RegExp objects
			if (typeof handler[0] == "string") {
				handler[0] = new RegExp(handler[0]);
			}
		}

		xhrPlugins.register(
			baseUrl,
			function (method, args) {
				return args.url.substring(0, baseUrlLength) == baseUrl;
			},
			function (method, args, hasBody) {
				var xhrHandlers = xhr.contentHandlers,
					def = mockXhrDef(args),
					ioArgs = def.ioArgs,
					url = args.url.slice(baseUrlLength),
					match = findMatch(handlers, url),
					urlHandler, // references handler function
					delay = options.delay || 500,
					timer, // references setTimeout id
					callback;

				if (match) {
					// matching handler found; split out returned array elements
					var matches = match[0]; // result of RegExp.match
					delay = match[1][2] || delay; // optional custom delay
					urlHandler = match[1][1]; // handler function

					// also set a timeout to cancel the XHR
					// if it goes over its own specified timeout
					timer = args.timeout && setTimeout(function () {
						xhrTimeout(def);
					}, args.timeout);

					callback = function () {
						if (def.canceled) {
							return;
						}
						if (timer !== undefined) {
							clearTimeout(timer);
						}
						try {
							// run handler, in context of utils for convenience
							var result = ioArgs.xhr.responseText = urlHandler.apply(
								utils,
								matches.slice(1).concat([method, ioArgs, hasBody]));

							if (typeof xhrHandlers[ioArgs.handleAs] == "function") {
								// allow most default xhr handlers to run
								// (all except "xml" rely on xhr.responseText)
								result = xhrHandlers[ioArgs.handleAs](ioArgs.xhr);
							}
							if (!ioArgs.xhr.status) {
								// default to OK status for success
								ioArgs.xhr.status = 200;
							}
							def.resolve(result);
						} catch (e) {
							def.reject(e);
						}
					};
				} else {
					// no match; reject Deferred indicating as such
					callback = function () {
						if (def.canceled) {
							return;
						}
						def.reject(new Error("Unhandled URL: " + ioArgs.url));
					};
				}

				if (ioArgs.args.sync === true) {
					callback();
				} else {
					// simulate async communication using specified delay
					setTimeout(callback, delay);
				}

				return def;
			},
			false,
			true);
	};

	TestService.utils = utils = {
		// utility functions, usable by URL handler functions
		unhandledUrl: function (url) {
			throw new Error("Unhandled URL: " + url);
		},
		unsupportedMethod: function (method) {
			throw new Error("Unsupported method: " + method);
		},
		setStatus: function (ioArgs, status) {
			// convenience method for mocking a status code onto the XHR object
			ioArgs.xhr.status = status;
		}
	};

	return TestService;
});