var uiPanel = require("uiPanel");

cc.Class({
    extends: uiPanel,

    properties: {
        bgNode:{
            type:cc.Node,
            default:null
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },
    hideBg(){
        this.bgNode.active = false;
    },
    exit: function() {
        uiFunc.closeUI(this.node.name);
        this.node.destroy();
    },

    // update (dt) {},
});
