define(["dojo/DeferredList"], function(DeferredList){
    // summary:
    //      This plugin defines the exposed APIs for available transitions,
    //      but defers to specific underlying implementations for CSS3- and
    //      dojo/_base/fx-based logic.
    
    var transitions; // stores css3 or fx transitions loaded (never both)
    
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
            
            return transitions.slideNode(node, start, end, options.duration);
        }
    };
    
    return {
        normalize: function(id, toAbsMid){
            // id is expected to be "fx" or "css3"
            return toAbsMid("./transition/" + id);
        },
        
        load: function(id, require, load){
            require([id], function(t){
                transitions = t; // store into module-local variable
                load(api); // pass exposed API to become the plugin's "return"
            })
        }
    }
});
