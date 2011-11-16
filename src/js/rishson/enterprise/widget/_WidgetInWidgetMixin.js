dojo.provide("rishson.enterprise.widget._WidgetInWidgetMixin");

/**
 * @class
 * @name rishson.enterprise.widget.WidgetInWidgetMixin
 * @description This is a class based version of Phil Higgin's awesome solution to memory leaks that can occur
 * when creating widgets programatically inside custom widgets<p>
 * Please see <a href='http://higginsforpresident.net/2010/01/widgets-within-widgets/'>here.</a>
 */
dojo.declare('rishson.enterprise.widget._WidgetInWidgetMixin', null, {

    /**
     * @field
     * @private
     * @name rishson.enterprise.widget._WidgetInWidgetMixin._connections
     * @type {Array}
     * @description Any dojo.connects should be stored in here so we can do a teardown properly.
     */
    _connections : [],

    /**
     * @function
     * @name rishson.enterprise.widget._WidgetInWidget.connect
     * @description Wrapper around dojo.connect that stores all the connects created for a derriving widget
     * For param info, see dojo.connect
     **/
    /*connect : function (object, event, context, method) {
        var newConnect = dojo.connect(object, event, context, method);
        this._connections.push(newConnect);
    },*/

   /**
     * @function
     * @name rishson.enterprise.widget._WidgetInWidget.adopt
     * @description Instantiate some new item from a passed Class, with props with an optional srcNode (node)
     * reference. Also tracks this widget as if it were a child to be destroyed when this parent widget
     * is removed.
     * @param {Function} cls the class to instantiate. Cannot be a string. Use dojo.getObject to get a full class object
     * if you must.<p>
     * example:<p>
     *      this.adopt(my.ui.Button, { onClick: function(){} }).placeAt(this.domNode);<p>
     * example:<p>
     *      var x = this.adopt(my.ui.Button).placeAt(this.domNode);<p>
     *      x.connect(this.domNode, "onclick", "fooBar");<p>
     * example:<p>
     *      //If you *must* new up a thinger and only want to adopt it once, use __addItem instead:<p>
     *      var t;<p>
     *      if(4 > 5){ t = new my.ui.Button(); }else{ t = new joost.ui.OtherButton() }<p>
     *      this.__addItem(t);
     * @param {Object} props optional an object mixed into the constructor of said cls.
     * @param {DOMNode} node optional a srcNodeRef to use with dijit._Widget. This thinger will be instantiated using
     * this passed node as the target if passed. Otherwise a new node is created and you must placeAt() your
     * instance somewhere in the dom for it to be useful.
     * @returns {Object} the created Widget instance
     */
    adopt : function (/*Function*/cls, /*Object*/props, /*DomNode*/node) {
        var x = new cls(props, node);
        this.__addItem(x);
        return x; // my.Widget
    },

    /**
     * @function
     * @name rishson.enterprise.widget._WidgetInWidget.orphan
     * @description Remove a single item from this instance when we destroy it. It is the parent widget's job
     * to properly destroy an orphaned child.<p>
     * example:<p>
     *      //Clear out all the children in an array, but do not destroy them.<p>
     *      dojo.forEach(this._thumbs, this.orphan, this);<p>
     * example:<p>
     *      //Create and destroy a button cleanly:<p>
     *      var x = this.adopt(my.ui.Button, {});<p>
     *      this.orphan(x, true);
     * @param {Object} widget a widget reference to remove from this parent.
     * @param {Boolean} destroy an optional boolean used to force immediate destruction of the child. Pass any truthy
     * value here and the child will be orphaned and killed.
     */
    orphan : function(/*dijit._Widget*/widget, /*Boolean*/destroy){
        this._addedItems = this._addedItems || [];
        var i = dojo.indexOf(this._addedItems, widget);
        if (i >= 0) {
            this._addedItems.splice(i, 1);
        }
        destroy && this.__kill(widget);
    },

    /**
     * @function
     * @name rishson.enterprise.widget._WidgetInWidget.destroy
     * @override : dijit._widget
     * @description Override the default destroy function to account for programatically added children.
     */
    destroy : function() {
        // summary: override the default destroy function to account for programatically added children.
        dojo.forEach(this._addedItems, this.__kill, this);  //destroy any adopted widgets
        dojo.forEach(this._connections || [], dojo.disconnect);   //disconnect from any dojo.connects
        this.inherited(arguments);  //call dijit._Widget to actually destroy this widget
    },

    //private functions-------------------------------------------------------------------------------------------------

    /**
     * @function
     * @name rishson.enterprise.widget._WidgetInWidget._addItem
     * @private
     * @description Add any number of programmaticaly created children to this instance for later cleanup.
     * @varargs any number of widgets
     */
    __addItem : function (/* dijit._Widget... */) {
        this._addedItems = this._addedItems || [];
        this._addedItems.push.apply(this._addedItems, arguments);
    },

    /**
     * @function
     * @name rishson.enterprise.widget._widgetInWidget.__kill
     * @private
     * @description Private helper function to properly destroy a widget instance.
     * @param {Object} w a widget to destroy
     */
    __kill : function (w) {
        try {
            if (w && w.destroyRecursive) {
                w.destroyRecursive();
            }
            else if (w && w.destroy) {
                w.destroy();
            }
        }
        catch (e){
            //ignore errors thrown by IE when doing teardown of Grids whose domNode's get removed early
        }
    }

});
