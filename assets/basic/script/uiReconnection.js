var uiPanel = require("uiPanel");
var mvs = require("Matchvs");
cc.Class({
    extends: uiPanel,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._super();
        this.nodeDict["reconnection"].on("click", this.gameReconnection, this);
        this.time = 10;
        this.schedule(this.countOut,1);
    },
    init(string){
        this.nodeDict["label"].getComponent(cc.Label).string = string;
    },
    close() {
        uiFunc.closeUI(this.node.name);
        this.node.destroy();
    },
    gameOut(){
        Game.GameManager.recurLobby();
        this.close();
    },
    gameReconnection(){
        Game.GameManager.bUiReconnection = true;
        mvs.engine.reconnect();
        this.close();
    },
    countOut(){
        this.time--;
        this.nodeDict["time"].getComponent(cc.Label).string = this.time;
        if (this.time <= 0){
            this.gameOut();
            this.unschedule(this.countOut);
        }
    },
});
