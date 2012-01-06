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
                dfd.resolve(anim.node);
            });
        anim.play();
        return dfd.promise;
    }
    
    function slideNode(node, start, end, duration){
        var props = {},
            anim;
        
        props.left = {
            start: start,
            end: end,
            units: "%"
        };
        
        anim = baseFx.animateProperty({
            node: node,
            properties: props,
            duration: duration
        });
        
        return startAnimation(anim); // promise
    }
    
    return { slideNode: slideNode };
});
