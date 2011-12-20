var dojoConfig = {
	async: true,
	isDebug: true,
	aliases: [
		["domReady", "dojo/domReady"]
	],
	deps: [ "wire!app/loader" ],
	build: {
		releaseDir: "../../../dist",
		packages: [{
			name: "dojo",
			location: "../dojo"
		},{
			name: "dijit",
			location: "../dijit"
		},{
			name: "dojox",
			location: "../dojox"
		},{
			name: "doh",
			location: "../util/doh"
		},{
			name: "when",
			location: "../when"
		},{
			name: "wire",
			location: "../wire/wire",
			main: "../wire"
		},{
			name: "rishson",
			location: "../rishson"
		},{
			name: "app",
			location: "../app"
		}]
	}
};
