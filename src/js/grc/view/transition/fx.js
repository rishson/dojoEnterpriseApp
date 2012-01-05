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
            dfd.resolve(anim.node);
        });
    }
    
    return {
        slide: function(options){
            var dfd = new Deferred(),
                newNode = options.newNode,
                oldNode = options.oldNode,
                side = options.side,
                duration = options.duration || manager.defaultDuration,
                reverse = (side == "left" ^ options.reverse),
                anim;
            
            anim = fx.combine([
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
        
        cover: function(options){
            var dfd = new Deferred(),
                reverse = options.reverse,
                node = options.node ||
                    (reverse ? options.oldNode : options.newNode),
                max = options.side == "right" ? 100 : -100,
                props = {}, prop = {},
                anim, handle;
            
            prop = { units: "%" };
            prop[reverse ? "end" : "start"] = max;
            prop[reverse ? "start" : "end"] = 0;
            
            props.left = prop;
            
            anim = baseFx.animateProperty({
                node: node,
                properties: props,
                duration: options.duration || manager.defaultDuration
            });
            
            handleOnEnd(anim, dfd);
            anim.play();
            return dfd.promise;
        }
    };
});
