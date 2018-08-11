cc.Class({
    extends: cc.Component,

    properties: {
       time: 0
    },

    start () {
        this.scheduleOnce(this.playAnim,this.time);
    },
    playAnim(){
        this.node.getComponent(cc.Animation).play("electric");
    }
    // update (dt) {},
});
