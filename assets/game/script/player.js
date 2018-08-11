var mvs = require("Matchvs");
cc.Class({
    extends: cc.Component,

    properties: {
        scoreLabel:{
            default: null,
            type: cc.Node
        }
    },
    onLoad(){
        this.score = 0;
        this.combo = 1;
        this.maxCombo = 0;
        this.blockNumber = 0;
        this.buff = 20;
    },
    init(playerId) {
        this.playerId = playerId;
    },
    addScore() {
        this.score += 10 * this.combo;
        this.blockNumber +=2;
        this.buff = 20;
        this.combo++;
        if (this.combo > this.maxCombo){
            this.maxCombo = this.combo;
        }
        this.changeScore();
    },
    buffTime() {
        if(!Game.ClickManager.bClick){
            return;
        }
        this.buff--;
        if (this.buff <=0){
            this.combo = 1;
        }
    },
    getData(){
        var data = {
                score:this.score,
                combo:this.combo,
                maxCombo:this.maxCombo,
                blockNumber:this.blockNumber,
                buff:this.buff
        }
        return data;
    },
    setData(data){
        this.score = data.score;
        this.combo = data.combo;
        this.maxCombo = data.maxCombo;
        this.blockNumber = data.blockNumber;
        this.buff = data.buff;

    },
    changeScore(){
        this.scoreLabel.getComponent(cc.Label).string = this.score;
        this.node.dispatchEvent(new cc.Event.EventCustom(clientEvent.eventType.setScoreProgressBar,true));
    },
});
