define([
    "dojo/dom-style",
    "dojox/css3/transit" // TODO: replace
], function(domStyle, transit){
    var ret = {
        slide: function(newNode, oldNode, reverse){
            // use transit to take advantage of CSS3 transitions/transforms
            return transit(oldNode, newNode, {
                transition: "slide",
                reverse: reverse
            });
        }
    };
    // FIXME: temporarily wiring cover/reveal to behave same as slide
    ret.cover = ret.reveal = ret.slide;
    return ret;
    
    /* Doesn't work, unfortunately (dojox/css3 assumes both from and to nodes exist)
        coverInit: function(newNode, oldNode, reverse){
            // ensure that new node "covers" old one
            domStyle.set(oldNode, { zIndex: 1 });
            domStyle.set(newNode, { zIndex: 2 });
        },
        cover: function(newNode, oldNode, reverse){
            return transit(null, newNode, {
                transition: "slide",
                reverse: reverse
            });
        },
        
        revealInit: function(newNode, oldNode, reverse){
            // ensure that old node "reveals" new one
            domStyle.set(oldNode, { zIndex: 2 });
            domStyle.set(newNode, { zIndex: 1 });
        },
        reveal: function(newNode, oldNode, reverse){
            return transit(oldNode, null, {
                transition: "slide",
                reverse: reverse
            });
        }
    */
});