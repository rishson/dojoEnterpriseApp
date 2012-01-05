/*

TODOs:

* support for leaving a "gap" where the previous pane is still visible
  
*/

define([
    "dojo/_base/declare",
    "dijit/layout/StackContainer",
    "dojo/_base/array",
    "dojo/_base/Deferred",
    "dojo/DeferredList",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/topic",
    "dojo/has",
    "require",
    "dojo/i18n!./nls/SceneGraph"
], function(declare, StackContainer, arrayUtil, Deferred, DeferredList,
        domStyle, domConstruct, topic, has, require, l10n){
    var transitions = {}, // placeholder for transition methods to be loaded
        // variables for feature tests
        testDiv = document.createElement("div"),
        cssPrefixes = ["ms", "O", "Moz", "Webkit"];
    
    function makePromise(value){
        // simple function to create and immediately resolve/return a promise
        var dfd = new Deferred();
        dfd.resolve(value);
        return dfd.promise;
    }
    
    // add feature tests for CSS transitions and transforms,
    // and run them now since we'll need them shortly anyway
    has.add("csstransitions", function(){
        // rather than simply return true, this test returns an object with
        // information on vendor prefixes for style rules and events.
        
        var style = testDiv.style,
            // transitionend prefixes, in same order as cssPrefixes
            tePrefixes = ["MS", "o", "", "webkit"],
            i;
        
        if (style.transitionProperty !== undefined) {
            // standard, no vendor prefix
            return { css: "", transitionend: "" };
        }
        for (i = cssPrefixes.length; i--;) {
            if (style[cssPrefixes[i] + "TransitionProperty"] !== undefined) {
                return {
                    css: cssPrefixes[i], // css prefix
                    transitionend: tePrefixes[i] // vendor-specific event prefix
                };
            }
        }
        
        // otherwise, not supported
        return false;
    }, true);
    
    has.add("csstransforms", function(){
        var style = testDiv.style, i;
        if (style.transformProperty !== undefined) {
            // standard, no vendor prefix
            return { css: "" };
        }
        for (i = cssPrefixes.length; i--;) {
            if (style[cssPrefixes[i] + "Transform"] !== undefined) {
                return { css: cssPrefixes[i] };
            }
        }
        
        // otherwise, not supported
        return false;
    }, true);
    
    has.add("csstransforms3d", function(){
        var style = testDiv.style, left, prefix;
        
        // apply csstransforms3d class to test transform-3d media queries
        testDiv.className = "csstransforms3d";
        // add to body to allow measurement
        document.body.appendChild(testDiv);
        left = testDiv.offsetLeft;
        
        if (left === 9) {
            // standard, no prefix
            return { css: "" };
        } else if (left > 9){
            // Matched one of the vendor prefixes; offset indicates which
            prefix = cssPrefixes[left - 10];
            return prefix ? { css: prefix } : false;
        }
        
        // otherwise, not supported
        return false;
    }, true);
    
    // discard the test node after tests are done
    domConstruct.destroy(testDiv);
    testDiv = null;
    
    // Load CSS3-based transition logic if the browser supports it;
    // otherwise, fall back to a dojo/_base/fx-based solution.
    require(/*has("csstransitions") &&
            (has("csstransforms") || has("csstransforms3d")) ?
        ["./transition/css3"] : */["./transition/fx"],
    function(t){
        transitions = t;
    });
    
    return declare(StackContainer, {
        // summary:
        //      Widget based on StackContainer which adds transition
        //      functionality, using CSS3 features where available, falling
        //      back to an dojo/_base/fx implementation in older browsers.
        
        // baseClass: String
        // Overrides baseClass of StackContainer.
        // This only loses one common style from dijit.css, which we re-add in
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
        //      "forward".
        transitionSide: "right",
        
        // gap: Number
        //      When transitionType is "cover" and this is a positive number,
        //      subsequent panes will not occupy the full width of the viewport,
        //      instead leaving a gap at the far edge.
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
        
        forward: function(page){
            // summary:
            //      Advances to next page, passing specific animation type.
            // page: Widget?
            //      Optionally, a widget to add to the container before advancing.
            
            if (page) { this.addChild(page); }
            return this._selectChild(this._adjacent(true));
        },
        
        back: function(removePrevious){
            // summary:
            //      Advances to previous page, passing specific animation type.
            // removePrevious: Boolean?
            //      If specified true, the previously-active child will be
            //      removed from the container.
            
            var self = this,
                prev = this.selectedChildWidget, // soon-to-be-previous child
                promise;
            
            promise = this._selectChild(this._adjacent(false), true);
            
            if (removePrevious) {
                promise = promise.then(function(r){
                    if (r !== false) {
                        self.removeChild(prev);
                    }
                });
            }
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
        
        _hideChild: function(page){
            // summary:
            //      Overrides StackContainer._hideChild,
            //      since previous children are to potentially remain visible.
        },
        
        _transition: function(newChild, oldChild, animate){
            var self = this,
                oldNode = oldChild.domNode,
                newNode = newChild.domNode,
                reverse, showChildResult, promise;
            
            // if only newChild was specified, don't perform a transition
            if (!oldChild) { return this.inherited(arguments); }
            
            oldChild._set("selected", false);
            newChild._set("selected", true);
            
            function transition(){
                newNode.style.visibility = ""; // unhide
                
                // store transition promise on instance to flag activity,
                // cleared when transition completes
                var promise = self._transitionPromise =
                    transitions[animate]({
                        newNode: newNode,
                        oldNode: oldNode,
                        side: self.transitionSide,
                        duration: self.duration,
                        reverse: reverse
                    }).then(function(){
                        delete self._transitionPromise;
                    });
                return promise;
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
                // when sliding in, ensure new node remains hidden initially
                // until it's time to perform the transition; applicable in case of
                // loadBeforeTransition + ContentPane with unloaded href
                if (!reverse) { newNode.style.visibility = "hidden"; }
                
                // ensure new child is displayed and its size is calculated
                showChildResult = this._showChild(newChild);
                if (this.doLayout && newChild.resize) {
                    // ensure child is sized properly to container
                    newChild.resize(this._containerContentBox || this._contentBox);
                    // TODO: account for gap
                }
                
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
                
                return promise;
            } else {
                // unknown/unhandled animation; don't perform any
                return this.inherited(arguments);
            }
        }
    });
});
