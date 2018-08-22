cc.Class({
    extends: cc.Component,

    properties: {
      comboPrefab:{
          type: cc.Prefab,
          default: null
      }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        Game.ComboManager = this;
    },
    addCombo(pos,id){

        if (id === Game.PlayerManager.self.playerId){
            if (Game.PlayerManager.self.combo <= 2){
                return;
            }
            var comboPrefab = cc.instantiate(this.comboPrefab);
            comboPrefab.parent = this.node;
            comboPrefab.setPosition(pos);
            comboPrefab.color = new cc.Color(89, 213, 252);
            comboPrefab.getComponent(cc.Label).string = "combo" + (Game.PlayerManager.self.combo - 2);
        }else{
            if (Game.PlayerManager.rival.combo <= 2){
                return;
            }
            var comboPrefab = cc.instantiate(this.comboPrefab);
            comboPrefab.parent = this.node;
            comboPrefab.setPosition(pos);
            comboPrefab.color = new cc.Color(245, 100, 100);
            comboPrefab.getComponent(cc.Label).string = "combo" + (Game.PlayerManager.rival.combo - 2);
        }
        var moveBy = cc.moveBy(0.5,cc.p(0,20));
        var callFunc = cc.callFunc(this.comboDelete, comboPrefab);
        var seq = cc.sequence(moveBy,callFunc);
        comboPrefab.runAction(seq);
    },
    comboDelete(combo){
        combo.destroy();
    }

    // update (dt) {},
});
