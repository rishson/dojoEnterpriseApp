# DojoEnterpriseApp
===================

DojoEnterpriseApp is an abstracted application framework for large web applications that use the [Dojo toolkit] (www.dojotoolkit.org).

The project was inspired by dojoBoilerplate from [Rebecca Murphey](http://www.github.com/rmurphey).
Thanks must also go to [Craig Barker](http://www.github.com/craigbarker) for putting the first version through its paces, and the guys at [Sitepen](http://www.sitepen.com) for their additions of awesomeness.

Please see the wiki for more details on what the scripts and JavaScript objects do.


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