/*

TODOs:

* use Deferred.when to hook animation logic to resolution of promise
  potentially returned by _showChild

*/

define([
    "dojo/_base/declare",
    "dijit/layout/StackContainer",
    "dojo/dom-style",
    "dojo/has",
    "require",
    "dojo/i18n!./nls/SceneGraph",
    "dojo/_base/sniff"
], function(declare, StackContainer, domStyle, has, require, l10n){
    var transitions = {}; // placeholder for transition methods
    
    var SceneGraph = declare(StackContainer, {
        // replace baseClass of StackContainer.
        // This only loses one common style from dijit.css, which we re-add in
        // the LESS resource for this widget.
        baseClass: "grcSceneGraph",
        
        l10n: l10n,
        
        transitionType: "slide",
        
        startup: function(){
            if(this._started){ return; }
            
            this.inherited(arguments);
        },
        
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
                
                // perform any init logic for this transition type
                // TODO: remove if unneeded
                typeof transitions[animate + "Init"] == "function" &&
                    transitions[animate + "Init"](newNode, oldNode, reverse);
                
                // ensure new child is displayed and its size is calculated
                this._showChild(newChild);
                if (this.doLayout && newChild.resize) {
                    // ensure child is sized properly to container
                    newChild.resize(this._containerContentBox || this._contentBox);
                }
                
                // Invoke transition method.  It returns a promise, which
                // resolves when the animation completes.
                return transitions[animate](newNode, oldNode, reverse).then(
                    function(){ self._hideChild(oldChild); }
                );
            } else {
                // unknown/unhandled animation; don't perform any
                return this.inherited(arguments);
            }
        }
    });
    
    //TODO: feature-detect and replace dojox/css3/transit
    require(has("mozilla") || has("webkit") ? ["./transition/css3"] : ["./transition/fx"],
    function(t){
        transitions = t;
    });
    
    return SceneGraph;
});
