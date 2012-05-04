define([
	"dojo/_base/declare", // declare
	"dijit/_Widget", //mixin
	"rishson/Base", //mixin
	"dojo/_base/lang", // hitch
	"dojo/topic", // publish/subscribe
	"rishson/Globals"
], function (declare, _Widget, Base, lang, topic, Globals) {
	/**
	 * @class
	 * @name rishson.widget._Widget
	 * @description This is the base class for all widgets.<p>
	 * We mixin Phil Higgin's memory leak mitigation solution that is implemented in _WidgetInWidgetMixin.<p>
	 * This base class also adds very generic event pub/sub abilities so that widgets can be completely self-contained and
	 * not have to know about their runtime invocation container or understand context concerns such as Ajax request.
	 */
	return declare("rishson.widget._Widget", [_Widget, Base], {
		/**
		 * @constructor
		 */
		constructor: function () {
			/*create a unique id for every instance of a widget. This is needed for when we publish our events and want to
			 publish who we are. If id is blank then we assume there is only 1 instance of the implementing widget.*/
			this._id = this.declaredClass + this.id;

			this.subList = {
				WIDGET_DISABLE: Globals.TOPIC_NAMESPACE + '/disable',
				WIDGET_ENABLE: Globals.TOPIC_NAMESPACE + '/enable',
				ERROR_CME: Globals.TOPIC_NAMESPACE + '/error/cme',
				ERROR_INVALID: Globals.TOPIC_NAMESPACE + '/error/invalid'
			};
		},

		/**
		 * @function
		 * @name rishson.widget._Widget.postCreate
		 * @override dijit._Widget
		 */
		postCreate: function () {
			//subscribe to topics that EVERY widget needs to potentially know about
			topic.subscribe(this.subList.WIDGET_DISABLE, lang.hitch(this, "_disable"));
			topic.subscribe(this.subList.WIDGET_ENABLE, lang.hitch(this, "_enable"));
			topic.subscribe(this.subList.ERROR_CME, lang.hitch(this, "_cmeHandler"));
			topic.subscribe(this.subList.ERROR_INVALID, lang.hitch(this, "_invalidHandler"));
			this.inherited(arguments);
		},

		/**
		 * @function
		 * @private
		 * @description Disable this widget
		 */
		_disable: function () {
			console.error(this.declaredClass + " : _disable has to be implemented by derived widgets.");
		},

		/**
		 * @function
		 * @private
		 * @description Enable this widget
		 */
		_enable: function () {
			console.error(this.declaredClass + " : _enable has to be implemented by derived widgets.");
		},

		/**
		 * @function
		 * @private
		 * @param {Object} latestVersionOfObject the latest version of an object that this widget knows how to render.
		 * @description Handle a ConcurrentModificationException
		 */
		_cmeHandler: function (latestVersionOfObject) {
			console.error(this.declaredClass + " : _cmeHandler has to be implemented by derived widgets.");
		},

		/**
		 * @function
		 * @private
		 * @param {Object} validationFailures the validation failures to act on.
		 * @description Handle validation errors when performing some mutating action.
		 */
		_invalidHandler: function (validationFailures) {
			console.error(this.declaredClass + " : _invalidHandler has to be implemented by derived widgets.");
		}
	});
});
