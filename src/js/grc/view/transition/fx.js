define([
    "dojo/_base/Deferred",
    "dojo/_base/fx",
    "dojo/fx",
    "dojo/aspect",
    "dojo/dom-style"
], function(Deferred, baseFx, fx, aspect, domStyle){
    function handleOnEnd(anim, dfd){
        // adds after advice to an animation's onEnd to resolve a Deferred;
        // used by all animation methods in order to return a promise
        var handle = aspect.after(anim, "onEnd", function(){
            handle.remove();
            dfd.resolve();
        });
    }
    
    return {
        slide: function(newNode, oldNode, reverse){
            var dfd = new Deferred(), anim;
            
            anim = fx.combine([
                // duration matches the one unfortunately hard-coded in css3/transit
                baseFx.animateProperty({
                    node: oldNode,
                    properties: { left: {
                        start: 0,
                        end: reverse ? 100 : -100,
                        units: "%"
                    } },
                    duration: 250
                }),
                baseFx.animateProperty({
                    node: newNode,
                    properties: { left: {
                        start: reverse ? -100 : 100,
                        end: 0,
                        units: "%"
                    } },
                    duration: 250
                })
            ]);
            
            handleOnEnd(anim, dfd);
            anim.play();
            return dfd.promise;
        },
        
        coverInit: function(newNode, oldNode, reverse){
            // ensure that new node "covers" old one
            domStyle.set(oldNode, { zIndex: 1 });
            domStyle.set(newNode, { zIndex: 2 });
        },
        cover: function(newNode, oldNode, reverse){
            var dfd = new Deferred(), anim, handle;
            
            anim = baseFx.animateProperty({
                node: newNode,
                properties: { left: {
                    start: reverse ? -100 : 100,
                    end: 0,
                    units: "%"
                } },
                duration: 250
            });
            
            handleOnEnd(anim, dfd);
            anim.play();
            return dfd.promise;
        },
        
        revealInit: function(newNode, oldNode, reverse){
            // ensure that old node "reveals" new one
            domStyle.set(oldNode, { zIndex: 2 });
            domStyle.set(newNode, { zIndex: 1 });
        },
        reveal: function(newNode, oldNode, reverse){
            var dfd = new Deferred(), anim, handle;
            
            anim = baseFx.animateProperty({
                node: oldNode,
                properties: { left: {
                    start: 0,
                    end: reverse ? 100 : -100,
                    units: "%"
                } },
                duration: 250
            });
            
            handleOnEnd(anim, dfd);
            anim.play();
            return dfd.promise;
        }
    };
});