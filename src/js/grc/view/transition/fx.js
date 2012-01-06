define([
    "dojo/_base/Deferred",
    "dojo/_base/fx",
    "dojo/aspect",
    "dijit/_base/manager" // for defaultDuration
], function(Deferred, baseFx, aspect, manager){
    
    function startAnimation(anim){
        // adds after advice to an animation's onEnd to resolve a Deferred,
        // then plays the animation and returns the Deferred's promise.
        var dfd = new Deferred(),
            handle = aspect.after(anim, "onEnd", function(){
                handle.remove();
                anim.node.style.overflow = "";
                dfd.resolve(anim.node);
            });
        anim.play();
        return dfd.promise;
    }
    
    return {
        slideNode: function(node, start, end, options){
            var props = {},
                side = options.side,
                prop = side == "right" ? "marginLeft" : "marginRight",
                reverse = side == "left",
                anim;
            
            props[prop] = {
                start: reverse ? -start : start,
                end: reverse ? -end : end,
                units: "%"
            };
            
            anim = baseFx.animateProperty({
                node: node,
                properties: props,
                duration: options.duration || manager.defaultDuration
            });
            
            node.style.overflow = "hidden"
            return startAnimation(anim); // promise
        },
        
        slideReset: function(node, options){
            // summary:
            //      Resets the position of a node that was previously transitioned.
            
            var side = options.side,
                prop = side == "left" ? "marginRight" : "marginLeft";
                //prop = "margin" + side.substr(0, 1).toUpperCase() + side.substr(1);
            node.style[prop] = "0";
        }
    };
});
