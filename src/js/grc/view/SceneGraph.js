define([
    "dojo/_base/declare",
    "dijit/layout/StackContainer",
    "dojo/_base/array",
    "dojo/_base/Deferred",
    "dojo/DeferredList",
    "dojo/on",
    "dojo/topic",
    "dijit/registry", // for byNode
    "./transitions!", // plugin which loads CSS3- or fx-based transition logic
    "dojo/i18n!./nls/SceneGraph"
], function(declare, StackContainer, arrayUtil, Deferred, DeferredList,
        on, topic, registry, transitions, l10n){
    
    var opposites = {
        left: "right",
        top: "bottom",
        right: "left",
        bottom: "top"
    };
    
    function makePromise(value){
        // simple function to create and immediately resolve/return a promise
        var dfd = new Deferred();
        dfd.resolve(value);
        return dfd.promise;
    }
    
    return declare(StackContainer, {
        // summary:
        //      Widget based on StackContainer which adds transition
        //      functionality, using CSS3 features where available, falling
        //      back to a dojo/_base/fx implementation in older browsers.
        
        // baseClass: String
        // Overrides baseClass of StackContainer.
        // This only loses one common style from dijit.css, which is re-added in
        // the LESS resource for this widget.
        baseClass: "grcSceneGraph",
        
        l10n: l10n,
        
        // transitionType: String
        //      Type of transition to engage when panes are switched.
        //      Transition direction is reversed during back() calls.
        //      Currently supported: "slide", "cover"
        transitionType: "slide",
        
        // transitionSide: String
        //      Side which new panes will slide in from when transitioning
        //      "forward".  Valid values are "right", "left", "bottom", "top".
        transitionSide: "right",
        
        // gap: Number
        //      When transitionType is "cover" and this is a positive number,
        //      subsequent panes will not occupy the full width of the viewport,
        //      instead leaving a gap at the far edge where the previous child
        //      is still visible.
        gap: 0,
        
        // gapUnits: String
        //      Defines whether gap is measured in "px" or "%".
        gapUnits: "%",
        
        // duration: Number
        //      Number of milliseconds each transition should last.
        //      If falsy (e.g. 0), transition implementations fall back to
        //      Dijit's defaultDuration (currently defaults to 200).
        duration: 0,
        
        // loadBeforeTransition: Boolean
        //      For ContentPane children, setting this to true waits for the
        //      newly-selected ContentPane to finish loading its href (if
        //      applicable) before animating.
        loadBeforeTransition: false,
        
        constructor: function(args){
            // force doLayout to false to prevent child resize from being forced
            if (!args) { args = {}; }
            args.doLayout = false;
        },
        
        postCreate: function(){
            var self = this;
            
            this.inherited(arguments);
            
            this._clickHandle =
                on(this.domNode, "." + this.baseClass + "-child:click",
                function(evt){
                    self.selectChild(registry.byNode(this));
                }
            );
        },
        
        uninitialize: function(){
            this.inherited(arguments);
            this._clickHandle.remove();
        },
        
        forward: function(page, destroyRemoved){
            // summary:
            //      Advances to next page.
            // page: Widget?
            //      Optionally, a widget to add to the container before advancing.
            //      Note that this will cause any existing later children to be
            //      removed, so that the specified page is transitioned in next.
            // destroyRemoved: Boolean?
            //      If true, any children removed in the process of adding
            //      the widget specified by `page` will also be destroyed.
            
            var current, children, child, i;
            
            if (page) {
                // remove and optionally destroy any existing next-children
                current = this.selectedChildWidget;
                children = this.getChildren();
                for (i = children.length; i--;) {
                    child = children[i];
                    if (child == current) { break; }
                    
                    this.removeChild(child);
                    if (destroyRemoved) { child.destroyRecursive(); }
                }
                
                // add new next child
                this.addChild(page);
            }
            return this._selectChild(this._adjacent(true));
        },
        
        back: function(removePrevious, destroyRemoved){
            // summary:
            //      Advances to previous page.
            // removePrevious: Boolean?
            //      If specified true, the previously-active child will be
            //      removed from the container.
            // destroyRemoved: Boolean?
            //      If true, the removed child will also be destroyed.
            //      (Not applicable if `removePrevious` is false.)
            
            var self = this,
                prev = this.selectedChildWidget, // soon-to-be-previous child
                promise;
            
            promise = this._selectChild(this._adjacent(false), true);
            
            if (removePrevious) {
                promise = promise.then(function(r){
                    if (r !== false) {
                        self.removeChild(prev);
                        if (destroyRemoved) {
                            prev.destroyRecursive();
                        }
                    }
                });
            }
            return promise;
        },
        
        selectChild: function(page){
            // summary:
            //      Complete override of StackContainer.selectChild;
            //      uses back/forward to drive the stack.
            
            if (this.selectedChildWidget == page) { return; }
            
            var self = this,
                children = this.getChildren(),
                newIndex = arrayUtil.indexOf(children, page),
                i = arrayUtil.indexOf(children, this.selectedChildWidget),
                dfd = new Deferred(),
                promise = dfd; // will be chained in loop
            
            // functions used in loops for promise chaining
            function forward(){ return self.forward(); }
            function back(){ return self.back(); }
            
            // one of the following loops will execute, depending on direction
            while (i < newIndex) {
                promise = promise.then(forward);
                i++;
            }
            while (i > newIndex) {
                promise = promise.then(back);
                i--;
            }
            
            dfd.resolve(); // resolve the initial Deferred to start the chain
            return promise;
        },
        
        addChild: function(child){
            // summary:
            //      Augments StackContainer.addChild to set the z-index of the
            //      newly added child so that "younger" children are in front.
            //      NOTE: insertIndex not supported, since this widget is
            //      intended to be used purely like a stack.
            
            child.domNode.style.zIndex = this.getChildren().length;
            this.inherited(arguments);
        },
        
        layout: function(){
            // summary:
            //      Overrides StackContainer.layout to account for resizing
            //      previous children that are still visible in cover mode.
            
            var current = this.selectedChildWidget,
                children, i;
            
            if (!current) { return; } // no child to resize
            
            if (this.transitionType != "cover" || this.gap < 1) {
                return this.inherited(arguments);
            }
            
            // In cover mode, we need to call resize on all children up to the
            // currently selected one.
            // This is unnecessary in slide mode since the appropriate child
            // is resized when a new transition occurs.
            children = this.getChildren();
            i = children.indexOf(current);
            while (i >= 0) {
                children[i--].resize();
            }
        },
        
        _selectChild: function(page, reverse){
            // summary:
            //      Performs common logic for all back/forward processes.
            // returns: Promise
            //      Promise representing when the ensuing transition completes.
            //      Resolves to false if no transition is to take place.
            
            var old = this.selectedChildWidget,
                dfd, transition;
            
            if (this._transitionPromise || old == page) {
                // return a pre-resolved promise to keep API consistent;
                // resolve with false value to indicate no change
                return makePromise(false);
            }
            
            this._set("selectedChildWidget", page);
            topic.publish(this.id + "selectChild", page);
            transition = this._transition(page, old, {
                type: this.transitionType,
                reverse: reverse
            });
            
            // normalize to promise, resolving to true to indicate that
            // a change took place even if no transition occurred
            return transition.then ? transition : makePromise(true);
        },
        
        _adjacent: function(forward){
            // summary:
            //      Extends StackContainer._adjacent to not wrap.
            //      If already at the end, returns the current pane.
            
            var children = this.getChildren(),
                current = this.selectedChildWidget,
                index = arrayUtil.indexOf(children, current);
            
            index += forward ? 1 : -1;
            return index >= 0 && index < children.length ?
                children[index] : current;
        },
        
        _transition: function(newChild, oldChild, animate){
            // summary:
            //      Overridden from StackContainer, this method kicks off
            //      the desired transition effect.
            // newChild: Widget
            //      Widget to become the active child of the container.
            // oldChild: Widget
            //      Widget which was previously the active child.
            // animate: String||Object
            //      Specifies transition type and, if an object, whether the
            //      transition is to be reversed.  This argument is normally
            //      determined automatically based on public API calls.
            
            var self = this,
                oldNode = oldChild.domNode,
                newNode = newChild.domNode,
                reverse, showChildResult, promise,
                gapSide, gapSize;
            
            // if only newChild was specified (first navigation),
            // don't perform a transition
            if (!oldChild) {
                return this._showChild(newChild);
            }
            
            oldChild._set("selected", false);
            newChild._set("selected", true);
            
            function transition(){
                newNode.style.visibility = ""; // unhide
                
                return transitions[animate]({
                    newNode: newNode,
                    oldNode: oldNode,
                    side: self.transitionSide,
                    duration: self.duration,
                    reverse: reverse
                }).then(function(r){
                    delete self._transitionPromise;
                    return r;
                });
            }
            
            // normalize animate/reverse variables
            if (animate === undefined) {
                animate = this.transitionType;
            } else if (typeof animate != "string") {
                // convert from object with type and reverse properties
                reverse = animate.reverse;
                animate = animate.type;
            }
            
            if (typeof transitions[animate] == "function") {
                if (!reverse) {
                    // when sliding in, ensure new node is hidden until the
                    // the transition is to be performed; applicable in case of
                    // loadBeforeTransition + ContentPane with unloaded href
                    newNode.style.visibility = "hidden";
                }
                
                // ensure new child is displayed and its size is calculated
                showChildResult = this._showChild(newChild);
                
                if (!reverse && this.gap > 0 && this.transitionType == "cover") {
                    // calculate gap and apply style to node
                    gapSide = opposites[this.transitionSide];
                    gapSize = this.gap * arrayUtil.indexOf(this.getChildren(), newChild);
                    newChild.domNode.style[gapSide] = gapSize + this.gapUnits;
                }
                // prompt child to recalculate size after any gap is calculated
                newChild.resize();
                
                // Invoke transition method.  It returns a promise, which
                // resolves when the animation completes.
                if (this.loadBeforeTransition && showChildResult.then) {
                    // If loadBeforeTransition is set and _showChild returned a
                    // promise (e.g. ContentPane w/ unloaded href), chain
                    // the transition to the completion (or failure) of the load.
                    promise = showChildResult.then(transition, transition);
                } else {
                    // Otherwise, return a promise that resolves when both the
                    // transition and load (if applicable) are complete.
                    promise = showChildResult.then ?
                        new DeferredList([showChildResult, transition()]) :
                        transition();
                }
                
                if (reverse) {
                    // hide "younger" child which was scrolled out of view
                    // (allows css3 logic to reset styles)
                    promise = promise.then(function(){
                        oldNode.style.visibility = "hidden";
                    });
                }
                
                // store transition promise on instance to flag activity,
                // cleared when transition completes
                return this._transitionPromise = promise;
            } else {
                // unknown/unhandled animation; don't perform any
                this._hideChild(oldChild);
                return this._showChild(newChild);
            }
        }
    });
});
