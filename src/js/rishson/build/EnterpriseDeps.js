/*This is a layer file. It's like any other Dojo module, except that we
don't put any code other than require/provide statements in it. When we
make a build, this will be replaced by a single minified copy of all
the modules listed below, as well as their dependencies, all in the
right order:*/
dojo.provide("rishson.enterprise.build.EnterpriseDeps");


/*Dojo dependencies - things that Enterprise needs from Dojo */
dojo.require("dijit.dijit");
/* pulls in:
dojo.require("dijit._base");
dojo.require("dojo.parser");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._Container");
dojo.require("dijit.layout._LayoutWidget");
dojo.require("dijit.form._FormWidget");
*/

dojo.require("dojo.i18n");

dojo.require("dojox.analytics.plugins.consoleMessages");

/*Enterprise dependencies - package up all of Enterprise into 1 file*/
dojo.require("rishson.enterprise.control.Controller");  //pulls in util.ObjectValidator
dojo.require("rishson.enterprise.control.ServiceRequest");  //pulls in Request
dojo.require("rishson.enterprise.XhrTransport");    //pulls in Transport