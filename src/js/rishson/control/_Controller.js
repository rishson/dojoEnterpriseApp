define([
	"dojo/_base/declare", // declare
	"rishson/Base", //createTopicNamespace, _capitaliseTopicName
	"rishson/Globals", //TOPIC_NAMESPACE
	"dojo/_base/array", // forEach
	"dojo/_base/lang", // hitch
	"dojo/topic" // publish/subscribe
], function (declare, Base, Globals, arrayUtil, lang, topic) {
	/**
	 * @class
	 * @name rishson.control._Controller
	 * @description This is the base class for Controller classes/widgets<p>
	 * Controllers are classes that wire together the view (widgets) and the model.<p>
	 * Application widgets are basically 'Controllers' in an MVC paradigm. Application widgets typically provide layout<p>
	 * container functionality to child widgets and act as the controller for the enclosed child widgets.<p>
	 * An Application widget knows about all views (child widgets) and models (stores) for the 'Application'.<p>
	 * This class specifically adds the autowiring of topics between child widgets and the Application widget.<p>
	 *<p>
	 * Usage:<p>
	 *<p>
	 * myChildWidget.pubList({SOME_EVENT :'some/topic'});<p>
	 * ...<p>
	 * myApplicationWidget.injectWidget(myChildWidget);<p>
	 * or
	 * myController.adopt(myChildWidget, {}, someDomNode);<p>
	 *<p>
	 * At this point, all the topic in mychildWidget.pubList are wired to event handlers in myApplicationWidget.
	 */
	return declare("rishson.control._Controller", [Base], {
		/**
		 * @field
		 * @name rishson._Controller._topicNamespace
		 * @type {string}
		 * @description This topic name space
		 */
		_topicNamespace: '',

		/**
		 * @field
		 * @name rishson._Controller.views
		 * @type {Object}
		 * @description A key store of the child views (widgets and controllers) of this controller.
		 */
		views: null,

		/**
		 * @field
		 * @name rishson._Controller.loadingGroups
		 * @type {{toLoad: Array, loaded: Array}}
		 * @description A key store of the child views (widgets and controllers) of this controller.
		 */
		loadingGroups: null,

		/**
		 * @constructor
		 */
		constructor: function () {
			// Create this controllers personalised topic namespace.
			this._topicNamespace = this.createTopicNamespace(this.declaredClass);
			this._id = this.declaredClass;

			this.subList = this.subList || {};

			// Add event listener for child widget initialisation events.
			// Must be done before child adoption/creation otherwise this class cannot listen to child's published events.
			this._wireSinglePub(this._topicNamespace + Globals.CHILD_INTIALISED_TOPIC_NAME, true);

			this.views = {};
			this.loadingGroups = {
				toLoad: [],
				loaded: []
			};
		},

		/**
		 * @function
		 * @name rishson.control._Controller._autowirePubs
		 * @private
		 * @param {rishson.widget._Widget} child a widget that contains a pubList of topics that it can publish.
		 * @description autowire the published topics from the child widget to event handlers on the controller widget.
		 */
		_autowirePubs: function (child) {
			var topicObj;

			//iterate over each published topic of the passed in child - the application child need to subscribe to these
			for (topicObj in child.pubList) {
				if (child.pubList.hasOwnProperty(topicObj)) {
					this._wireSinglePub(child.pubList[topicObj]);
				}
			}
		},

		/**
		 * @function
		 * @name rishson.control._Controller._createHandlerFuncName
		 * @private
		 * @param {string} str the topicNamespace and topic string value
		 * @description returns a capitalised and slashes removed string.
		 * @return {string}
		 */
		_createHandlerFuncName: function (str) {
			var ret;
			if (str) {
				//capitalise the topic section names and remove slashes
				ret = this.capitaliseTopicName(str);
				ret = '_handle' + ret.replace(/[//]/g, '');
				if (ret) {
					return ret;
				}
			}
			return '';
		},

		/**
		 * @function
		 * @name rishson.control._Controller._wireSinglePub
		 * @private
		 * @param {string} topicName the string of the topic name
		 * @description autowire a single published topic from the child widget to an event handler on the controller widget.
		 */
		_wireSinglePub: function (topicName, initialWire) {
			var handlerFuncName, handlerFunc;

			// If event to wire is child initialised skip wiring as this was already wired in constructor.
			if (!initialWire && topicName.indexOf(Globals.CHILD_INTIALISED_TOPIC_NAME) !== -1) {
				return;
			}

			handlerFuncName = this._createHandlerFuncName(topicName);

			//the implementing class needs to have _handle[topicName] functions by convention
			handlerFunc = this[handlerFuncName];
			if (handlerFuncName && handlerFunc) {
				topic.subscribe(topicName, lang.hitch(this, handlerFunc));
			} else {
				console.error('Autowire failure for topic: ' + topicName + '. No handler: ' + handlerFuncName);
			}
		},

		/**
		 * @function
		 * @name rishson.control._Controller.injectWidget
		 * @param {rishson.widget._Widget} widget a widget to examine for topics
		 * @description widgets injected into this class will be examined to autowire its publish and subscribes.<p>
		 * This function should be called for declarativly created widgets.
		 */
		injectWidget: function (widget) {
			this._autowirePubs(widget);
		},

		/**
		 * @name rishson.control._Controller.loadGroup
		 * @description Take a loadGroup, loop over each widget and create and add that widget to the controller.
		 * @param {Object} scope the scope of the current controller. Assignment needs to occur before initialisation
		 * @param {Array} group
		 */
		loadGroup: function (scope, group) {
			var i, l;
			for (i = 0, l = group.toLoad.length; i < l; i += 1) {
				this.addAndInitialise(scope, group.toLoad[i], group, i);
			}
		},

		/**
		 *
		 * @function
		 * @name rishson.control._Controller.addAndInitialise
		 * @description adopted widgets from controllers should fire their initialised event after they have been assigned at
		 * to the controller assignee
		 * @param {Object} scope the scope of the current controller. Assignment needs to occur before initialisation
		 * @param {{name: string, widget: string, loadingGroup: Array, props: Object, node: string|Object}} args The
		 * initialisation properties for the widget to be included on the page.
		 * @param {Array} group
		 * @param {number} i
		 */
		addAndInitialise: function (scope, args, group, i) {
			var obj;

			if (scope && args.name && args.widget) {
				obj = scope.views[args.name] = this.adopt(args.widget, args.props, args.node);
				if (group && typeof i !== 'undefined') {
					group.toLoad[i] = obj;
				}

				if (!obj.isInitialised) {
					obj._initialise();
				}
			}
		},

		/**
		 * @function
		 * @name rishson.control._Controller.adopt
		 * @description widgets injected into this class will be examined to autowire its publish and subscribes.<p>
		 * This function should be called for programatically created widgets.
		 * @param {Object} Cls
		 * @param {Object=} props
		 * @param node
		 */
		adopt: function (Cls, props, node) {
			var child;
			props = props || {};
			// Pass in parents topic name space to all child views and controllers.
			props.parentTopicNamespace = this._topicNamespace;

			child = new Cls(props, node);

			if (!this._supportingWidgets) {
				this._supportingWidgets = [];	//awkward but this is a mixin class
			}
			this._supportingWidgets.push(child);

			this._autowirePubs(child);
			return child;
		},

		/**
		 * @function
		 * @name rishson.control._Controller.checkLoadingGroups
		 * @description Compare the id of the widget which is just initialised with the loading groups array, and move
		 * from toLoad to loaded if found. Attach the widgets to the layout if all of them have been loaded.
		 * TODO: smarter 'loadingGroups' logic needs to be created so that there can be more than one loadingGroup array
		 * and faster indexing.
		 * @param {string} id
		 */
		checkLoadingGroups: function (id) {
			var i,
				l,
				match = false;

			//if all widgets that I care about have been initialised then I should attach them and publish my initialise to my parent
			for (i = 0, l = this.loadingGroups.toLoad.length; i < l; i += 1) {
				if (this.loadingGroups.toLoad[i] && this.loadingGroups.toLoad[i]._id === id) {
					this.loadingGroups.loaded[i] = this.loadingGroups.toLoad[i];
					delete this.loadingGroups.toLoad[i];
					match = true;
					break;
				}
			}

			if (match && this.loadingGroups.loaded.length === this.loadingGroups.toLoad.length) {
				this.attachWidgetsToLayout(this.loadingGroups.loaded);
			}
		},

		/**
		 * @name rishson.control._Controller.attachWidgetsToLayout
		 * @description Call the attachwidgets method on the layout.
		 * TODO: this should be moved to the individual controllers so they can take more control of what layout methods
		 * attach widgets.
		 * @param {Array} widgets
		 */
		attachWidgetsToLayout: function (widgets) {
			// Attach child widgets to layout
			this.views.layout.attachWidgets({
				widgets: widgets
			});
			this.views.layout.startup();
		}
	});
});