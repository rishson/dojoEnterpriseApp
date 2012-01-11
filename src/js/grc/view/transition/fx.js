define([
    "dojo/_base/Deferred",
    "dojo/_base/fx",
    "dojo/aspect",
    "dijit/_base/manager" // for defaultDuration
], function(Deferred, baseFx, aspect, manager){
    
    var opposites = {
        left: "right",
        top: "bottom",
        right: "left",
        bottom: "top"
    };
    
    function properCase(str){
        return str.substr(0, 1).toUpperCase() + str.substr(1);
    }
    
    function startAnimation(anim){
        // adds after advice to an animation's onEnd to resolve a Deferred,
        // then plays the animation and returns the Deferred's promise.
        var dfd = new Deferred(),
            handle = aspect.after(anim, "onEnd", function(){
                handle.remove();
                dfd.resolve(anim.node);
            });
        anim.play();
        return dfd.promise;
    }
    
    return {
        slideNode: function(node, start, end, options){
            var props = {},
                side = options.side,
                // main property to animate
                prop = "margin" + properCase(opposites[side]),
                // complement to main property, also animated to maintain size
                oppositeProp = "margin" + properCase(side),
                reverse = side == "left" || side == "top",
                anim;
            
            props[prop] = {
                start: reverse ? -start : start,
                end: reverse ? -end : end,
                units: "%"
            };
            props[oppositeProp] = {
                start: reverse ? start : -start,
                end: reverse ? end : -end,
                units: "%"
            };
            
            anim = baseFx.animateProperty({
                node: node,
                properties: props,
                duration: options.duration || manager.defaultDuration
            });
            
            return startAnimation(anim); // promise
        },
        
        slideReset: function(node, options){
            // summary:
            //      Resets the position of a node that was previously transitioned.
            
            var side = options.side,
                style = node.style;
            
            style["margin" + properCase(side)] =
                style["margin" + properCase(opposites[side])] = "0";
        }
    };
});
