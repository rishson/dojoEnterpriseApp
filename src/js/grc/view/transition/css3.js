//FIXME: debug Opera, if it is to be supported (increasing timeout seems to help)
define([
    "dojo/_base/Deferred",
    "dojo/on",
    "dojo/has",
    "dijit/_base/manager", // for defaultDuration
], function(Deferred, on, has, manager){
    var hasTransition = has("csstransitions"),
        hasTransform = has("csstransforms"),
        hasTransform3d = has("csstransforms3d"),
        // variables derived from has features retrieved above - computed below
        transitionPrefix = hasTransition.css ?
            hasTransition.css + "Transition" : "transition",
        transitionend = hasTransition.transitionend,
        translateStrings,
        transform;
    
    // Determine whether to use 3D or 2D transforms
    if (hasTransform3d) {
        translateStrings = {
            x: {
                prefix: "translate3d(",
                suffix: ",0,0)"
            },
            y: {
                prefix: "translate3d(0,",
                suffix: ",0)"
            }
        };
        transform = hasTransform3d.css;
    } else if (hasTransform) {
        translateStrings = {
            x: { prefix: "translateX(" },
            y: { prefix: "translateY(" }
        };
        translateStrings.x.suffix = translateStrings.y.suffix = ")";
        transform = hasTransform.css;
    }
    
    // at this point, there is enough info to validate and bail out on failure
    if (!translateStrings || !hasTransition) {
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
    
    var ret = {
        slideNode: function(node, start, end, options){
            var dfd = new Deferred(),
                style = node.style,
                duration = options.duration,
                side = options.side,
                tlStrings = translateStrings[side == "top" || side == "bottom" ?
                    "y" : "x"];
            
            duration = duration || manager.defaultDuration;
            
            // embed start and end within translate values
            start = (start ?
                tlStrings.prefix + start + "%" + tlStrings.suffix : "");
            end = (end ?
                tlStrings.prefix + end + "%" + tlStrings.suffix : "");
            
            console.log(node.id, "start", start, "end", end);
            
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
        },
        
        slideReset: function(node, options){
            // summary:
            //      Resets the position of a previously-transitioned node.
            
            var style = node.style;
            style[transitionPrefix + "Duration"] = "0ms";
            style[transform] = "";
        }
    };
    return ret;
});
