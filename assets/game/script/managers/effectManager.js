cc.Class({
    extends: cc.Component,

    properties: {
        effect:{
            type: cc.Prefab,
            default: null
        }
    },
    onLoad () {
        Game.EffectManager = this;
        //this.effectPool = new cc.NodePool();
    },
    initEffect(pos){
        // var effect = this.effectPool.get();
        // if (!effect) {
        //     effect = cc.instantiate(this.effect);
        // }
        var effect = cc.instantiate(this.effect);
        effect.parent = this.node;
        effect.setPosition(pos);
    },
    recycleEffect(target) {
        //this.effectPool.put(target);
    },

    // update (dt) {},
});
