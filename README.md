# DojoEnterpriseApp
===================

DojoEnterpriseApp is an abstracted application framework for large web applications that use the [Dojo toolkit] (www.dojotoolkit.org).

The project was inspired by dojoBoilerplate from [Rebecca Murphey](http://www.github.com/rmurphey).
Thanks must also go to [Craig Barker](http://www.github.com/craigbarker) for putting the first version through its paces, and the guys at [Sitepen](http://www.sitepen.com) for their additions of awesomeness.

The main features are:
----------------------

#### All kinds of other people's awesome
- self bootstrapping - pulls in dependencies via setup script (uses wget or curl)
- pulls in [less.js](https://github.com/cloudhead/less.js) and [wire.js](https://github.com/cujojs/wire)
- depends on node.js (for running less.js), npm and Java (for the dojo build)

#### Extensible scripts
- scripts to pull in framwwork dependencies
- scripts to create an 'application' (single page web app)
- scripts to create templated and non-templated widgets (including test pages, less files..)
- scripts to test widgets in a variety of browsers (chrome, FireFox, Safari and Chromium)
- scripts to create a compressed, minified build using the dojo builder

#### Abstracted control layer with:
- abstracted communications protocols so that 'real' servers can be mocked during unit tests.
- abstracted server calls (REST and WebServices) to introduce clean separation of concerns so that code is not littered with Urls and thus easier to refactor.
- provides a central location to perform work on all server calls (such as applying security policies, auditing, url resolution etc).

#### Common set of application widgets:
- _Widget base class that provides life-cycle management based on Phil Higgins's [solution](http://higginsforpresident.net/2010/01/widgets-within-widgets) to memory leaks with custom dojo widgets that programatically create widgets.
- a full-page container widget with plugins for common 'enterprise' features such as session management.

### Scripts
-----------

Scripts are written in bash and run on Linux and OSX.

#####setup.sh
Pulls in all external dependencies using wget or curl. Also creates a .gitignore file in the scripts directory that includes references to all downloaded dependencies.

#####createApplication.sh
Creates the directory structure for a single page web app. An application can contain any number of child widgets. All dependencies are copied over to the new directory structure.

#####createWidget.sh
Creates a single widget. The widget can be templated or not. The widget js, less, html (optional) and test pages are created. The widget's name is injected into the various files to allow for CSS namespacing etc.

#####test.js
Runs a test suite in a browser of your choice. The browsers supported are Chrome, FireFox, Safari and Chromium.

#####build.sh
Runs a dojo build to create a release version of an application.


### A closer look at what is in the created directories
-----------

When you run this script for an application called 'newApp' you will get the following directory structure created for you:

__newApp__ <-top level folder for everythingin your application

__newApp/scripts__ <-contains all the bash scripts that you will need for your application

__newApp/src__ <-contains all the JavaScript/HTML/CSS for the application and all custom widgets

##### A closer look at whats in the directories:

######newApp

__build.profile.js__ <-this is the dojo build profile for the application and is used by the build.sh script

__configuration__ <-this is the base configuration file used for the application. You can override the default versions of the external libraries that are pulled in and change the defult url used for testing your app.

######newApp/scripts

__templates__ <-this folder contains all the archetypes of files used elsewhere in the boilerplate. You shoudl not need to alter any of the files in this directory.

__build.sh, createWidget.sh, setup.sh, test.sh__ <-bash scripts to manipulate the project

######newApp/src

__js__ <-this folder contains all the JavaScript, HTML and CSS for the application and all custom widgets

__index.html__ <-this is the base HTML file for the application

######newApp/src/js

All subfolders in this directory contain namespaced JavaScript projects. Think of these directories as applicationm imports.

__aop__ <-this contains the [aop](https://github.com/cujojs/aop) project

__app__ <-this contains your application code

__dijit__ <-this contains [dojo's](https://github.com/dojo) widgets

__dojo__ <-this contains the [dojo](https://github.com/dojo) base code

__dojox__ <-this contains the [dojox](https://github.com/dojo) code

__rishson__ <-this contains all application skeleton code for your application

__util__ <-this contains the [dojo](https://github.com/dojo) util code (including the dojo build system)

__when__ <-this contains the [when](https://github.com/cujojs/when) project

__wire__ <-this contains the [wire.js](https://github.com/cujojs/wire) project

######newApp/src/js/app

__nls__ <-contains all the i18n files for your application

__resources__ <-contains all the resources (images) for your app as well as the base less file.

__app.profile.js__ <-this is the build profile for the application - you should modify __build.profile.js__ instead.

__config.js__ <-this is the custom __dojoConfig__ for the application.

__loader.spec.js__ <-this is the wire.js loader for the application.

__package.json__ <-this is the package details of the application.


### Control layer
 -------------

For widgets that want to make a request for data, they don't even need to know about XHR, Transports or the control layer.
Widgets can simply publish their request (along with a topic that the response will be published on):

```javascript

//dojo 1.7+ example of calling a RestService on the server and expecting a response to be published to a topic
 var restCall = new RestRequest({url : 'testService',
    verb : 'delete',
    params : [{exampleParamsName : 'exampleParamValue'}],
    topic : 'testServiceResponse');

topic.publish(Globals.SEND_REQUEST, restCall);
```

 You can make a call to the server without having to directly use the lower level XHR code. Since the actual mechanism
 for getting to the server and parsing the response are abstracted, you can have a clean separation of concerns between the
 widgets and the control layer. The control layer knows nothing of the mechanics of performing a request; this is
 delegated to a Transport implementation that is injected into the control layer on construction.

 e.g.

```javascript
//example of calling a WebService on the server and expecting a response on a callaback function
 var serviceCall = new ServiceRequest({service : 'testService',
    method : 'TestMethod',
    params : [{exampleParamsName : 'exampleParamValue'}],
    callback : myCallback,
    scope : this});

 controller.send(serviceCall);

//example of calling a RestService on the server and expecting a response to be published to a topic
 var restCall = new RestRequest({service : 'testService',
    verb : 'post',
    params : [{exampleParamsName : 'exampleParamValue'}],
    topic : 'testServiceResponse');

 controller.send(restCall);
```
 Because of this abstraction, we can plug different Transport implementations into our control layer.
 Provided out of the box are XhrTransport (for performing Xhr post calls) and MockTransport (for use in a headless
 unit test configuration with no need for a running web server).

 Web Service requests and Rest requests are currently supported. For rest, get, delete, post and put are supported.
 
 Responses
 
 The server response is wrapped in a Response object that provides a standard set of response types regardless of 
 the type of request that was made to the server.
 
```javascript
dojo.subscribe('/some/topic/passed/to/control/layer', this, function(response) {
  if(response.isOk) {
    //do something with the response
    console.debug(response.payload);
  }  
  else if(response.isInvalid) {
    //our request must have been invalid
  }
  else if(response.isConflicted) {
    //basically a concurrent modification exception
    console.debug(response.payload);  //should be the latest copy of the resource we tried to mutate
  }
});
```
 


### AppContainer widget
 -------------------

 This widget is a placeholder for widgets that do stuff. Essentially, this widget is the full-page app chrome that
 defines a header, footer and center region (where your application goes). This widget also serves as an example
 of using pub/sub with widgets for all communication. When this widget wants to send a request to the server, it
 publishes its request on a topic. The control layer subscribes to this topic, performs the server call, and then
 publishes the response on a different topic.
 Widgets in this framework are not aware that a control layer exists.