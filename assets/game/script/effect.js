// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        arrParticle:{
            default: [],
            type: cc.Node
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    init () {
        this.scheduleOnce(this.stop,1);
    },
    stop(){
        for (let particle of this.arrParticle){
            particle.getComponent(cc.ParticleSystem).stopSystem();
        }
        this.scheduleOnce(this.destroyBullet,1);
    },
    destroyBullet() {
        //Game.EffectManager.recycleEffect(this.node);
        this.node.destroy();
    },

    // update (dt) {},
});
