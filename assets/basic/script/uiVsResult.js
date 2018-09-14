var uiPanel = require("uiPanel");
var mvs = require("Matchvs");
cc.Class({
    extends: uiPanel,

    properties: {
        loseClip: {
            default: null,
            url: cc.AudioClip
        },
        victoryClip: {
            default: null,
            url: cc.AudioClip
        }
    },

    start() {
        var isLose = Game.GameManager.isRivalLeave ? false : Game.PlayerManager.self.score < Game.PlayerManager.rival.score;
        clientEvent.on(clientEvent.eventType.checkLcon, this.checkLcon, this);
        this.player = this.nodeDict["player"].getComponent("resultPlayerIcon");
        this.rival = this.nodeDict["rival"].getComponent("resultPlayerIcon");
        this.showLcon();
        this.nodeDict["vs"].active = true;
        //this.nodeDict["score"].active = true;
        this.nodeDict["quit"].on("click", this.quit, this);

        this.nodeDict["lose"].active = isLose;
        this.nodeDict["win"].active = !isLose;

        if (!isLose) {
            cc.audioEngine.play(this.victoryClip, false, 1);
            // 发送胜局记录--
        } else {
            cc.audioEngine.play(this.loseClip, false, 1);
        }
        this.showScore();
    },

    showLcon(){
        this.player.setData(Game.PlayerManager.self.playerId);
        this.rival.setData(Game.PlayerManager.rival.playerId);
    },

    checkLcon(){
        if (this.player.icon.spriteFrame === null){
            Game.GameManager.network.connect(GLB.IP, GLB.PORT,function(){});
            this.scheduleOnce(this.showLcon,1);
        }
    },

    quit: function() {
        mvs.engine.leaveRoom("");
        var gamePanel = uiFunc.findUI("uiGamePanel");
        if (gamePanel) {
            uiFunc.closeUI("uiGamePanel");
            gamePanel.destroy();
        }
        uiFunc.closeUI(this.node.name);
        this.node.destroy();
        Game.GameManager.lobbyShow();
    },
    showScore(){
        var self = Game.PlayerManager.self;
        var rival = Game.PlayerManager.rival;
        Game.GameManager.setRankData(self.score);
        this.nodeDict["scoreOne"].getChildByName("self").getComponent(cc.Label).string = self.score;
        this.nodeDict["scoreOne"].getChildByName("rival").getComponent(cc.Label).string = rival.score;
        var ratio = self.score / (self.score + rival.score);
        if (self.score === 0 && rival.score === 0) {
            ratio = 0.5;
        }
        this.nodeDict["scoreOne"].getComponent(cc.ProgressBar).progress = ratio;

        this.nodeDict["scoreTwo"].getChildByName("self").getComponent(cc.Label).string = self.blockNumber;
        this.nodeDict["scoreTwo"].getChildByName("rival").getComponent(cc.Label).string = rival.blockNumber;
        ratio = self.blockNumber / (self.blockNumber + rival.blockNumber);
        if (self.blockNumber === 0 && rival.blockNumber === 0) {
            ratio = 0.5;
        }
        this.nodeDict["scoreTwo"].getComponent(cc.ProgressBar).progress = ratio;
        self.maxCombo = self.maxCombo > 2 ? self.maxCombo - 2 : 0;
        rival.maxCombo = rival.maxCombo > 2 ? rival.maxCombo - 2 : 0;
        this.nodeDict["scoreThree"].getChildByName("self").getComponent(cc.Label).string = self.maxCombo;
        this.nodeDict["scoreThree"].getChildByName("rival").getComponent(cc.Label).string = rival.maxCombo;
        ratio = self.maxCombo / (self.maxCombo + rival.maxCombo);
        if (self.maxCombo === 0 && rival.maxCombo === 0) {
            ratio = 0.5;
        }
        this.nodeDict["scoreThree"].getComponent(cc.ProgressBar).progress = ratio;
    },
    onDestroy(){
        clientEvent.off(clientEvent.eventType.checkLcon, this.checkLcon, this);
    }
});
