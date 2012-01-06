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
    
    function slideNode(node, start, end, duration){
        // Handles "slide" transition of a node.
        
        var dfd = new Deferred(),
            style = node.style;
        
        duration = duration || manager.defaultDuration;
        
        // embed start and end within translate values
        start = translatePrefix + start + "%" + translateSuffix;
        end = translatePrefix + end + "%" + translateSuffix;
        
        // initialize node styles without transition, before beginning slide
        style[transitionPrefix + "Duration"] = "0ms";
        style[transform] = start;
        
        on.once(node, transitionend, function(){
            dfd.resolve(node);
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
                slideNode(options.oldNode, 0, oldEnd, duration),
                slideNode(options.newNode, newStart, 0, duration)
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
            
            return slideNode(node, start, end, options.duration);
        }
    };
});
