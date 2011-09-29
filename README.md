# DojoEnterpriseApp
===================

DojoEnterpriseApp is an abstracted application framework for large web applications that use the [Dojo toolkit] (www.dojotoolkit.org).

The directory structure and build scripts are taken from the excellent dojo-boilerplate by [Rebecca Murphey] (www.github.com/rmurphey).

The main features are:
----------------------

### Abstracted control layer with:
- abstracted communications protocols so that 'real' servers can be mocked during unit tests.
- abstracted server calls to introduce clean separation of concerns so that code is not littered with Urls and thus easier to refactor.
- provides a central location to perform work on all server calls (such as applying security policies, auditing, url resolution etc).

### Common set of application widgets:
- _Widget base class that provides life-cycle management based on Phil Higgins's [solution](http://higginsforpresident.net/2010/01/widgets-within-widgets) to memory leaks with custom dojo widgets that
  programatically create widgets.
- a full-page container widget with plugins for common 'enterprise' features such as session management.
 