define([
    "dojo/_base/Deferred",
    "dojo/DeferredList",
    "dojo/has",
    "dojo/dom-construct"
], function(Deferred, DeferredList, has, domConstruct){
    // summary:
    //      This plugin defines the exposed APIs for available transitions,
    //      but defers to specific underlying implementations for CSS3- and
    //      dojo/_base/fx-based logic.
    
    var transitions, // stores css3 or fx transitions loaded (never both)
        hasCSS3, // stores result of first-run tests
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
    
    // store result determining which implementation to load on demand
    hasCSS3 = has("csstransitions") &&
        (has("csstransforms") || has("csstransforms3d"));
    
    // transitions API to be returned
    var api = {
        slide: function(options){
            // summary:
            //      Performs a slide transition, moving the old node out and
            //      new node in simultaneously.
            // options: Object
            //      * side: which direction the transition is relative to
            //      * reverse: if true, nodes move towards `side` instead of away
            //      * duration: how long the transition should take
            // returns: promise
            //      Returns a promise which resolves when the transition ends.
            
            var side = options.side,
                duration = options.duration,
                reverse = (side == "left" ^ options.reverse),
                oldEnd = reverse ? 100 : -100,
                newStart = reverse ? -100 : 100;
            
            return new DeferredList([
                transitions.slideNode(options.oldNode, 0, oldEnd, duration),
                transitions.slideNode(options.newNode, newStart, 0, duration)
            ]);
        },
        
        cover: function(options){
            // summary:
            //      Performs a cover transition, moving the new node in.
            // options: Object
            //      * side: which direction the transition is relative to
            //      * reverse: if true, performs "uncover" rather than "cover"
            //      * duration: how long the transition should take
            // returns: promise
            //      Returns a promise which resolves when the transition ends.
            
            var reverse = options.reverse,
                node = options.node ||
                    (reverse ? options.oldNode : options.newNode),
                max = options.side == "right" ? 100 : -100,
                start = reverse ? 0 : max,
                end = reverse ? max : 0;
            
            transitions.resetSlideNode(reverse ? options.newNode : options.oldNode);
            return transitions.slideNode(node, start, end, options.duration);
        }
    };
    
    return {
        load: function(id, require, load){
            require(["./transition/" + (hasCSS3 ? "css3" : "fx")], function(t){
                transitions = t; // store into module-local variable
                load(api); // pass exposed API to become the plugin's "return"
            });
        }
    };
});
