dojo.provide("rishson.enterprise.widget._ApplicationWidget");

dojo.require('rishson.enterprise.widget._Widget');

/**
 * @class
 * @name rishson.enterprise.widget._ApplicationWidget
 * @description This is the base class for Application widgets<p>
 * Application widgets are basically 'Controllers' in an MVC paradigm. Application widgets typically provide layout<p>
 * container functionality to child widgets and act as the controller for the enclosed child widgets.<p>
 * An Application widget knows about all views (child widgets) and models (stores) for the 'Application'.<p>
 * This class specifically adds the autowiring of topics between child widgets and the Application widget.<p>
 *<p>
 * Usage:<p>
 *<p>
 * myChildWidget.pubList.push('some/topic');<p>
 * ...<p>
 * myApplicationWidget.injectWidget(myChildWidget);<p>
 *<p>
 * At this point, all the topic in mychildWidget.pubList are wired to event handlers in myApplicationWidget.
 */
dojo.declare("rishson.enterprise.widget._ApplicationWidget", [rishson.enterprise.widget._Widget], {

	/**
     * @function
     * @name rishson.enterprise.widget._ApplicationWidget.injectWidget
	 * @param {rishson.enterprise.widget._Widget} a widget to examine for topics
 	 * @description widgets injected into this class will be examined to autowire its publish and subscribes.<p>
     * This function should be called for declarativly created widgets.
     */
	injectWidget : function (widget) {
		//for declarativly created widgets
		this._autowirePubs(widget);
		//this._autowireSubs(widget);
	},

	/**
     * @function
     * @name rishson.enterprise.widget._ApplicationWidget.adopt
	 * @override rishson.enterprise.widget._Widget.adopt
 	 * @description widgets injected into this class will be examined to autowire its publish and subscribes.<p>
     * This function should be called for declarativly created widgets.
     */
    adopt : function (/*Function*/cls, /*Object*/props, /*DomNode*/node) {
		//for programatically created widgets
		var widget = this.inherited(arguments);	//call _Widget.adopt
		this._autowirePubs(widget);
		//this._autowireSubs(widget);
		return widget;
	},

	/**
     * @function
     * @name rishson.enterprise.widget._ApplicationWidget._autowireSubs
	 * @private
	 * @param {rishson.enterprise.widget._Widget} widget a widget that contains a pubList of topics that it can publish.
 	 * @description autowire the subscribed topics from the widget to event handlers in the widget.
     */
	_autowireSubs : function (widget) {
		//iterate over each subscription of the passed in widget - the application widget need to publish to these		
		dojo.forEach(widget.subList, function(topic){
			this.pubList.push(topic);
			//capitalise the topic section names and remove slashes
			var handlerFuncName = '_handle' + this._capitaliseTopic(topic).replace('/', '');
			//the widget needs to have _handle[topicName] functions by convention
			var handlerFunc = widget[handlerFuncName];
			if(handlerFunc) {
				dojo.subscribe(topic, widget, handlerFunc);
			}
			else {
				console.error('Autowire failure for topic: ' + topic + '. No handler in widget ' + widget.declaredClass +
					' named ' + handlerFuncName);			
			}
		}, this);
	},

	/**
     * @function
     * @name rishson.enterprise.widget._ApplicationWidget._autowirePubs
	 * @private
	 * @param {rishson.enterprise.widget._Widget} widget a widget that contains a pubList of topics that it can publish.
 	 * @description autowire the published topics from the widget to event handlers in the Application widget.
     */
	_autowirePubs : function (widget) {
		//iterate over each published topic of the passed in widget - the application widget need to subscribe to these		

		for(var topic in widget.pubList) {
		    if(widget.pubList.hasOwnProperty(topic)) {
		    	//capitalise the topic section names and remove slashes
				var handlerFuncName = '_handle' + this._capitaliseTopic(topic).replace('/', '');
				//the application widget needs to have _handle[topicName] functions by convention
				var handlerFunc = this[handlerFuncName];
				if(handlerFunc) {
					dojo.subscribe(topic, this, handlerFunc);
				}
				else {
					console.error('Autowire failure for topic: ' + topic + '. No handler: ' + handlerFuncName);			
				}    
			}	
		}

		/*
		dojo.forEach(widget.pubList, function(topic){
			//capitalise the topic section names and remove slashes
			var handlerFuncName = '_handle' + this._capitaliseTopic(topic).replace('/', '');
			//the application widget needs to have _handle[topicName] functions by convention
			var handlerFunc = this[handlerFuncName];
			if(handlerFunc) {
				dojo.subscribe(topic, this, handlerFunc);
			}
			else {
				console.error('Autowire failure for topic: ' + topic + '. No handler: ' + handlerFuncName);			
			}
		}, this);
		*/
	},

	/**
     * @function
     * @name rishson.enterprise.widget._ApplicationWidget._capitaliseTopicName
	 * @private
	 * @param {String} topic a name of a topic to capitalise.
 	 * @description capitalise the first letter of a topic.
     */
	_capitaliseTopicName : function (topic) {
		/* e.g. /hello/i/am/a/topic would become Hello/I/Am/A/Topic
		/\b[a-z]/g		
		*/
        return topic.toLowerCase().replace(/\b[a-z]/g, function (w) {
            return w.toUpperCase();
        });
    }

});
