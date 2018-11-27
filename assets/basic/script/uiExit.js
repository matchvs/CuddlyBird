var uiPanel = require("uiPanel");
var mvs = require("Matchvs");
cc.Class({
    extends: uiPanel,
    properties: {},

    onLoad() {
        this._super();
        this.nodeDict["sure"].on("click", this.sure, this);
        this.nodeDict["close"].on("click", this.close, this);
        this.nodeDict["close2"].on("click", this.close, this);
        if (!Game.GameManager.bExit){

        }
    },

    close() {
        uiFunc.closeUI(this.node.name);
        this.node.destroy();
    },

    sure() {
        if(!Game.GameManager.bExit){
            return;
        }
        mvs.engine.leaveRoom("");
        Game.BlockManager.deleteWholeBlock();
        var gamePanel = uiFunc.findUI("uiGamePanel");
        if (gamePanel) {
            uiFunc.closeUI("uiGamePanel");
            gamePanel.destroy();
        }
        uiFunc.closeUI(this.node.name);
        this.node.destroy();
        Game.GameManager.lobbyShow();
    },
});
