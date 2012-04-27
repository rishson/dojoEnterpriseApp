//define({
//    plugins: [
//        { module: "wire/dom" },
//        { module: "wire/dojo/dom" }
//    ],
//
//    simpleHeader : {
//		create: {
//			module: "rishson/view/SimpleHeader",
//			args: [{
//				username: "Foo"
//			}]
//		}
//	},
//
//    simpleFooter : {
//		create: {
//			module: "rishson/view/SimpleFooter",
//			args: [{
//				footerText: "Footer Text",
//				footerLink: "http://www.someurl.com"
//			}]
//		}
//	},
//
//    mainLayout : {
//		create: {
//			module: "app/view/MainLayout"
//		}
//	},
//
//	appContainer: {
//        create: {
//            module: "rishson/view/AppContainer",
//            args: [{
//				header: { $ref: 'simpleHeader' },
//				app: { $ref: 'mainLayout' },
//				footer: { $ref: 'simpleFooter' }
//            }, { $ref: "dom.query!.appContainer", i: 0 }]
//        }
//    }
//});
