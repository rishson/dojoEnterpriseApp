/*

TODOs:

* use Deferred.when to hook animation logic to resolution of promise
  potentially returned by _showChild

*/

define([
    "dojo/_base/declare",
    "dijit/layout/StackContainer",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/has",
    "require",
    "dojo/i18n!./nls/SceneGraph",
    "dojo/_base/sniff"
], function(declare, StackContainer, domStyle, domConstruct, has, require, l10n){
    var transitions = {}, // placeholder for transition methods to be loaded
        // variables for feature tests
        testDiv = document.createElement("div"),
        cssPrefixes = ["ms", "O", "Moz", "Webkit"];
    
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
        var style = testDiv.style;
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
    require(has("csstransitions") &&
            (has("csstransforms") || has("csstransforms3d")) ?
        ["./transition/css3"] : ["./transition/fx"],
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
        //      Currently supported: "slide", "cover", "reveal"
        transitionType: "slide",
        
        // duration: Number
        //      Number of milliseconds each transition should last.
        //      If falsy (e.g. 0), transition implementations fall back to
        //      Dijit's defaultDuration (currently defaults to 200).
        duration: 0,
        
        forward: function(){
            // summary:
            //      Advances to next page, passing specific animation type.
            return this.selectChild(this._adjacent(true), this.transitionType);
        },
        
        back: function(){
            // summary:
            //      Advances to previous page, passing specific animation type.
            return this.selectChild(this._adjacent(false),
                { type: this.transitionType, reverse: true });
        },
        
        _transition: function(newChild, oldChild, animate){
            var self = this,
                oldNode = oldChild.domNode,
                newNode = newChild.domNode,
                reverse;
            
            // if only newChild was specified, don't perform a transition
            if (!oldChild) { return this.inherited(arguments); }
            
            // normalize animate/reverse variables
            if (animate === undefined) {
                animate = this.transitionType;
            } else if (typeof animate != "string") {
                // convert from object with type and reverse properties
                reverse = animate.reverse;
                animate = animate.type;
            }
            
            if (typeof transitions[animate] == "function") {
                oldNode.style.position = newNode.style.position = "absolute";
                
                // ensure new child is displayed and its size is calculated
                this._showChild(newChild);
                if (this.doLayout && newChild.resize) {
                    // ensure child is sized properly to container
                    newChild.resize(this._containerContentBox || this._contentBox);
                }
                
                // Invoke transition method.  It returns a promise, which
                // resolves when the animation completes.
                return transitions[animate](newNode, oldNode, {
                    reverse: reverse,
                    duration: this.duration
                }).then(
                    function(){ self._hideChild(oldChild); }
                );
            } else {
                // unknown/unhandled animation; don't perform any
                return this.inherited(arguments);
            }
        }
    });
});
