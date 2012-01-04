//FIXME: debug Opera, if it is to be supported (increasing timeout seems to help)
define([
    "dojo/_base/Deferred",
    "dojo/DeferredList",
    "dojo/on",
    "dojo/has",
    "dojo/dom-style",
    "dijit/_base/manager", // for defaultDuration
], function(Deferred, DeferredList, on, has, domStyle, manager){
    var hasTransition = has("csstransitions"),
        hasTransform = has("csstransforms"),
        hasTransform3d = has("csstransforms3d"),
        // variables derived from has features retrieved above - computed below
        transitionPrefix = hasTransition.css ?
            hasTransition.css + "Transition" : "transition",
        transitionend = hasTransition.transitionend,
        translatePrefix,
        translateSuffix,
        transform;
    
    // Determine whether to use 3D or 2D transforms
    if (hasTransform3d) {
        translatePrefix = "translate3d(";
        translateSuffix = ",0,0)";
        transform = hasTransform3d.css;
    } else if (hasTransform) {
        translatePrefix = "translateX(";
        translateSuffix = ")";
        transform = hasTransform.css;
    }
    
    // at this point, there is enough info to validate and bail out on failure
    if (!translatePrefix || !hasTransition) {
        throw new Error("css3 transition module loaded in an unsupported browser");
    }
    
    // expand transform from prefix to include [Tt]ransform
    if (transform) {
        transform += "Transform";
    } else {
        transform = "transform";
    }
    
    // expand transitionend to entire event name
    if (transitionend) {
        // Append camel-case to vendor prefix, and also attempt to be
        // forward-compatible when more browsers support transitionend.
        // (This is used as the target parameter to on.once)
        transitionend += "TransitionEnd, transitionend";
    } else {
        transitionend = "transitionend"; // no vendor prefix, standard name
    }
    
    function slideNode(node, out, options){
        // Handles "slide" transition of a node.
        // If out is true, node is sliding "out" (from 0); else "in" (to 0)
        
        var start = "0",
            end = "0",
            dfd = new Deferred(),
            style = node.style,
            reverse = options.reverse,
            duration = options.duration || manager.defaultDuration;
        
        if (out) {
            // reverse == out to the right, forward == out to the left
            end = (reverse ? "" : "-") + "100%";
        } else {
            // reverse == in from the left, forward == in from the right
            start = (reverse ? "-" : "") + "100%";
        }
        
        // embed start and end within translate values
        start = translatePrefix + start + translateSuffix;
        end = translatePrefix + end + translateSuffix;
        
        // initialize node styles without transition, before beginning slide
        style[transitionPrefix + "Duration"] = "0ms";
        style[transform] = start;
        
        on.once(node, transitionend, function(){
            dfd.resolve();
        });
        
        // need to set end styles separately to allow browser to redraw first
        setTimeout(function(){
            // update properties to kick off transition
            style[transitionPrefix + "Property"] = "all";
            style[transitionPrefix + "Duration"] = duration + "ms";
            style[transform] = end;
        }, 0);
        
        return dfd.promise;
    }
    
    return {
        slide: function(newNode, oldNode, options){
            // summary:
            //      Performs a slide transition, moving the old node out and
            //      new node in simultaneously.
            // options: Object
            //      * reverse: if true, node is moving to the right; else to the left
            //      * duration: how long the transition should take; default is 250ms
            // returns: promise
            //      Returns a promise which resolves when the transition ends.
            return new DeferredList([
                slideNode(oldNode, true, options),
                slideNode(newNode, false, options)
            ]);
        },
        
        cover: function(newNode, oldNode, options){
            // summary:
            //      Performs a cover transition, moving the new node in.
            // options: Object
            //      * reverse: if true, node is moving to the right; else to the left
            //      * duration: how long the transition should take; default is 250ms
            // returns: promise
            //      Returns a promise which resolves when the transition ends.
            
            // ensure that new node "covers" old one
            newNode.style.zIndex = 2;
            oldNode.style.zIndex = 1;
            
            return slideNode(newNode, false, options);
        },
        
        reveal: function(newNode, oldNode, options){
            // summary:
            //      Performs a reveal transition, moving the old node out.
            // options: Object
            //      * reverse: if true, node is moving to the right; else to the left
            //      * duration: how long the transition should take; default is 250ms
            // returns: promise
            //      Returns a promise which resolves when the transition ends.
            
            // ensure that old node "reveals" new one
            newNode.style.zIndex = 1;
            oldNode.style.zIndex = 2;
            // reset placement of new node (in case it had been translated)
            newNode.style[transitionPrefix + "Property"] = "";
            newNode.style[transform] = translatePrefix + "0" + translateSuffix;
            
            return slideNode(oldNode, true, options);
        }
    };
});
