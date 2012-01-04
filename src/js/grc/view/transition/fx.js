define([
    "dojo/_base/Deferred",
    "dojo/_base/fx",
    "dojo/fx",
    "dojo/aspect",
    "dijit/_base/manager" // for defaultDuration
], function(Deferred, baseFx, fx, aspect, manager){
    
    function handleOnEnd(anim, dfd){
        // adds after advice to an animation's onEnd to resolve a Deferred;
        // used by all animation methods in order to return a promise
        var handle = aspect.after(anim, "onEnd", function(){
            handle.remove();
            dfd.resolve();
        });
    }
    
    return {
        slide: function(newNode, oldNode, options){
            var dfd = new Deferred(),
                reverse = options.reverse,
                duration = options.duration || manager.defaultDuration,
                anim;
            
            anim = fx.combine([
                // duration matches the one unfortunately hard-coded in css3/transit
                baseFx.animateProperty({
                    node: oldNode,
                    properties: { left: {
                        start: 0,
                        end: reverse ? 100 : -100,
                        units: "%"
                    } },
                    duration: duration
                }),
                baseFx.animateProperty({
                    node: newNode,
                    properties: { left: {
                        start: reverse ? -100 : 100,
                        end: 0,
                        units: "%"
                    } },
                    duration: duration
                })
            ]);
            
            handleOnEnd(anim, dfd);
            anim.play();
            return dfd.promise;
        },
        
        cover: function(newNode, oldNode, options){
            var dfd = new Deferred(), anim, handle;
            
            // ensure that new node "covers" old one
            newNode.style.zIndex = 2;
            oldNode.style.zIndex = 1;
            
            anim = baseFx.animateProperty({
                node: newNode,
                properties: { left: {
                    start: options.reverse ? -100 : 100,
                    end: 0,
                    units: "%"
                } },
                duration: options.duration || manager.defaultDuration
            });
            
            handleOnEnd(anim, dfd);
            anim.play();
            return dfd.promise;
        },
        
        reveal: function(newNode, oldNode, options){
            var dfd = new Deferred(),
                anim, handle;
            
            // ensure that old node "reveals" new one
            newNode.style.zIndex = 1;
            oldNode.style.zIndex = 2;
            
            anim = baseFx.animateProperty({
                node: oldNode,
                properties: { left: {
                    start: 0,
                    end: options.reverse ? 100 : -100,
                    units: "%"
                } },
                duration: options.duration || manager.defaultDuration
            });
            
            handleOnEnd(anim, dfd);
            anim.play();
            return dfd.promise;
        }
    };
});
