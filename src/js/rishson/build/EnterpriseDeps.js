/*This is a layer file. It's like any other Dojo module, except that we
don't put any code other than require/provide statements in it. When we
make a build, this will be replaced by a single minified copy of all
the modules listed below, as well as their dependencies, all in the
right order:*/

/*Dojo dependencies - things that Enterprise needs from Dojo */
define([
	"dijit/dijit",
	/* pulls in:
		"dijit/_base",
		"dojo/parser",
		"dijit/_Widget",
		"dijit/_TemplatedMixin",
		"dijit/_Container",
		"dijit/layout/_LayoutWidget",
		"dijit/form/_FormWidget",
		"dijit/form/_FormValueWidget",
	*/
	"dijit/_WidgetsInTemplateMixin", // for templated widgets with child widgets
	"dojo/i18n",
	"dojox/analytics/plugins/consoleMessages",
	
	/*Enterprise dependencies - package up all of Enterprise into 1 file*/
	"rishson/control/Controller", //pulls in util/ObjectValidator
	"rishson/control/ServiceRequest",  //pulls in Request
	"rishson/enterprise/XhrTransport" //pulls in Transport
]);
