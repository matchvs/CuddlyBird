var mvs = require("Matchvs");
var uiPanel = require("uiPanel");
cc.Class({
    extends: uiPanel,

    properties: {
        bgmAudio: {
            default: null,
            url: cc.AudioClip
        },
        startAudio: {
            default: null,
            url: cc.AudioClip
        },
        selfScore:{
            default:null,
            type: cc.Label
        },
        rivalScore:{
            default:null,
            type: cc.Label
        },
        progressBar:{
            default:null,
            type: cc.Node
        },
        numberSpriteFrame:{
            default:[],
            type: cc.SpriteFrame
        }
    },
    onLoad() {
        this._super();
        this.round = 0;
        this.count = 0;
        clientEvent.on(clientEvent.eventType.aaa, this.aaa, this);
        this.node.on(clientEvent.eventType.nextRound,this.initArrBlock,this);
        this.node.on(clientEvent.eventType.setScoreProgressBar,this.setScoreProgressBar,this);
        clientEvent.on(clientEvent.eventType.roundStart, this.roundStart, this);
        clientEvent.on(clientEvent.eventType.gameOver, this.gameOver, this);
        clientEvent.on(clientEvent.eventType.getRoomDetailResponse, this.setPlayerId, this);
        clientEvent.on(clientEvent.eventType.leaveRoomMedNotify, this.leaveRoom, this);
        clientEvent.on(clientEvent.eventType.getReconnectionData, this.getReconnectionData, this);
        clientEvent.on(clientEvent.eventType.setReconnectionData, this.setReconnectionData, this);
        clientEvent.on(clientEvent.eventType.setCount, this.setCount, this);
        this.nodeDict["exit"].on(cc.Node.EventType.TOUCH_START, this.exit, this);
        this.nodeDict['round'].getComponent(cc.Animation).on('finished', this.gameStart, this);
        this.bgmId = cc.audioEngine.play(this.bgmAudio, true, 1);
    },
    sendExpressionMsg(event, customEventData){
        if (Game.GameManager.gameState !== GameState.Over) {
            mvs.engine.sendFrameEvent(JSON.stringify({
                action: GLB.BUBBLE,
                type: customEventData,
                id: Game.PlayerManager.self.playerId
            }));
        }
    },
    aaa(){
        //this.nodeDict["aaa"].getComponent(cc.Label).string = "接受到断线连接消息";
    },
    showLcon(){
        this.playerLcon = this.nodeDict["player"].getComponent("resultPlayerIcon");
        this.playerLcon.setData(GLB.playerUserIds[0]);
        this.rivalLcon = this.nodeDict["rival"].getComponent("resultPlayerIcon");
        this.rivalLcon.setData(GLB.playerUserIds[1]);
    },
    setPlayerId(data){
        var arrPlayer = data.rsp.userInfos;
        for (let player of arrPlayer){
            if (player.userId === GLB.userInfo.id){
                GLB.playerUserIds[0] = player.userId;
            }else{
                GLB.playerUserIds[1] = player.userId;
            }
        }
        Game.PlayerManager.playerInit();
    },
    initArrBlock(){
        if (!this.playPrompt()){
            this.gameOver();
           return;
        }
        Game.BlockManager.arrMap = [];
        Game.BlockManager.index = 0;
        if(!GLB.isRoomOwner){
            return;
        }
        //初始化地图数组
        var arrMap = [];
        for(let row = 0; row < 8; row++){
            arrMap[row] = [];
            for (let col = 0; col < 9; col++){
                arrMap[row][col] = this.arrBlcokData(row,col);
            }
        }
        //随机一个id，通过id从表中拿取数组
        var lenght = window.dataManager.layoutDtMgr.getArrLayoutLenght()
        var removeId = Math.floor(Math.random() * lenght + 1);
        var arrRemove = window.dataManager.layoutDtMgr.getDataByID(removeId).array;
        //根据拿到的id，把地图数组中相应的部分置为null
        for (let data of arrRemove){
            arrMap[data[0]][data[1]].type = null;
        }
        //number为需要生成方块的数量
        var number = 72 - arrRemove.length;
        //随机生成方块种类
        var arrBlock = [];
        for(let i = 0; i < number / 2; i++){
            let blockType = Math.floor(Math.random()*10)
            arrBlock.push(blockType);
            arrBlock.push(blockType);
        }
        //循环给地图数组赋予方块种类
        for (let row = 0;row < 8 ; row++){
            for (let col = 0; col < 9; col++){
                if (arrMap[row][col].type !== null) {
                    let index = Math.floor(Math.random() * arrBlock.length);
                    arrMap[row][col].type = arrBlock[index];
                    arrBlock.splice(index,1);
                }
            }
        }
        this.sendInitMapMsg(arrMap);
    },
    arrBlcokData(row,col){
        let y = GLB.limitY - GLB.range * row;
        let x = GLB.limitX + GLB.range * col;
        let data = {
            pos: cc.p(x,y),
            type: 0,
            sprite: null
        }
        return data;
    },
    leaveRoom(data) {
        if (Game.GameManager.gameState !== GameState.Over) {
            uiFunc.openUI("uiTip", function(obj) {
                var uiTip = obj.getComponent("uiTip");
                if (uiTip) {
                    if (data.leaveRoomInfo.userId !== GLB.userInfo.id) {
                        uiTip.setData("对手离开了游戏");
                    }
                }
            }.bind(this));
        }
    },
    sendInitMapMsg(arrMap) {
        for (let i = 0; i < arrMap.length; i++){
            if (Game.GameManager.gameState !== GameState.Over) { //&& GLB.isRoomOwner
                mvs.engine.sendFrameEvent(JSON.stringify({
                    action: GLB.INITMAP,
                    array: arrMap[i]
                }));
            }
        }
    },
    exit() {
        if (!Game.ClickManager.bClick){
            return;
        }
        uiFunc.openUI("uiExit");
        cc.audioEngine.stop(this.bgmId);
    },
    gameOver: function() {
        //游戏结束--
        if (GLB.isRoomOwner) {
            var msg = {
                action: GLB.GAME_OVER_EVENT
            };
            Game.GameManager.sendEventEx(msg);
        }
        cc.audioEngine.stop(this.bgmId);
    },
    roundStart: function() {
        this.initArrBlock();
        this.showLcon();
    },
    leaveRoom() {
        Game.GameManager.bExit = false;
        this.scheduleOnce(()=>{
            Game.GameManager.bExit = true;
        },2.0)
        if (Game.GameManager.gameState !== GameState.Over) {
            uiFunc.openUI("uiTip", function(obj) {
                var uiTip = obj.getComponent("uiTip");
                if (uiTip) {
                    uiTip.setData("对手离开了游戏");
                }
            }.bind(this));
        }
    },
    onDestroy() {
        clientEvent.off(clientEvent.eventType.aaa, this.aaa, this);
        clientEvent.off(clientEvent.eventType.roundStart, this.roundStart, this);
        clientEvent.off(clientEvent.eventType.gameOver, this.gameOver, this);
        clientEvent.off(clientEvent.eventType.refreshSlateBtn, this.refreshSlateBtn, this);
        clientEvent.off(clientEvent.eventType.leaveRoomMedNotify, this.leaveRoom, this);
        clientEvent.off(clientEvent.eventType.getRoomDetailResponse, this.setPlayerId, this);
        clientEvent.off(clientEvent.eventType.getReconnectionData, this.getReconnectionData, this);
        clientEvent.off(clientEvent.eventType.setCount, this.setCount, this);
        this.node.off(clientEvent.eventType.nextRound,this.initArrBlock,this);
        this.node.off(clientEvent.eventType.setScoreProgressBar,this.setScoreProgressBar,this);
        this.nodeDict["exit"].off(cc.Node.EventType.TOUCH_START, this.exit, this);
        clearInterval(this.scheduleCountDown);
        cc.audioEngine.stop(this.bgmId);
    },
    setScoreProgressBar(){
        var ratio = Game.PlayerManager.self.score / (Game.PlayerManager.self.score + Game.PlayerManager.rival.score);
        if (Game.PlayerManager.self.score === 0
            && Game.PlayerManager.rival.score === 0) {
            ratio = 0.5;
        }
        this.progressBar.getComponent(cc.ProgressBar).progress = ratio;
        this.progressBar.getChildByName("light").x = ratio * 500 - 250;
    },
    playPrompt(){
        this.round++;
        this.nodeDict['prompt'].active = true;
        Game.ClickManager.bClick = false;
        if (this.round >= 4){
            clearInterval(this.scheduleCountDown);
            this.nodeDict['gameOver'].opacity = 255;
            return false;
        }
        this.count = 60;
        clearInterval(this.scheduleCountDown);
        this.nodeDict['countDown'].getComponent(cc.Label).string = "剩余时间 " + this.count;
        this.nodeDict['tab'].getComponent(cc.Label).string = "Round "+this.round+"/3";
        this.nodeDict['number'].getComponent(cc.Sprite).spriteFrame = this.numberSpriteFrame[this.round - 1];
        this.nodeDict['round'].getComponent(cc.Animation).play("round1");
        this.scheduleOnce(()=>{
            cc.audioEngine.play(this.startAudio, false, 1);
        },2.5)
        return true;
    },
    gameStart(){
        clearInterval(this.scheduleCountDown);
        Game.ClickManager.bClick = true;
        this.nodeDict['prompt'].active = false;
        this.scheduleCountDown = setInterval(function(){
            this.countDown();
        }.bind(this), 1000);
    },
    countDown(){
        if (this.count > 0){
            this.count--;
        }
        this.nodeDict['countDown'].getComponent(cc.Label).string = "剩余时间 " + this.count;
        if (this.count <= 0){
            this.sendNextRound();
        }
    },
    setCount(count){
        this.count = count;
    },
    sendNextRound(){
        clearInterval(this.scheduleCountDown);
        if (Game.GameManager.gameState !== GameState.Over && GLB.isRoomOwner) {
            mvs.engine.sendFrameEvent(JSON.stringify({
                action: GLB.TIME_OUT,
            }));
        }
    },
    getReconnectionData(){
        cc.log("发送重新连接数据");
        this.regenerationArrMap();
        var selfData = Game.PlayerManager.self.getData();
        var rivalData = Game.PlayerManager.rival.getData();
        var gameData = {
            round: this.round,
            count: this.count,
            selfData: selfData,
            rivalData: rivalData,
            gamestate: Game.GameManager.gameState
        }
        if (Game.GameManager.gameState !== GameState.Over) {
            mvs.engine.sendFrameEvent(JSON.stringify({
                action: GLB.RECONNECTION_DATA,
                playerId: Game.PlayerManager.self.playerId,
                gameData: gameData
            }));
        }
    },
    regenerationArrMap(){
        cc.log("发送掉线玩家地图")
        var arrMap = Game.BlockManager.getArrMap();
        if (arrMap === []){
            return;
        }
        for (let i = 0; i < arrMap.length; i++){
            if (Game.GameManager.gameState !== GameState.Over) { //&& GLB.isRoomOwner
                mvs.engine.sendFrameEvent(JSON.stringify({
                    action: GLB.UPDATA_ARR_MAP,
                    array: arrMap[i],
                    id: GLB.userInfo.id
                }));
            }
        }
    },
    setReconnectionData(cpProto){
        cc.log("掉线玩家接受并更新数据");
        var data = cpProto.gameData;
        var id = cpProto.playerId;
        if (data.gamestate !== GameState.Play){
            return;
        }
        Game.GameManager.bReconnect = true;
        this.round = data.round;
        this.count = data.count;
        if (id === GLB.userInfo.id){
            Game.PlayerManager.self.setData(data.selfData);
            Game.PlayerManager.rival.setData(data.rivalData);
        }else{
            Game.PlayerManager.self.setData(data.rivalData);
            Game.PlayerManager.rival.setData(data.selfData);
        }
        this.gameStart();
        Game.PlayerManager.self.changeScore();
        Game.PlayerManager.rival.changeScore();
        this.nodeDict['tab'].getComponent(cc.Label).string = "Round "+this.round+"/3";
        this.showLcon();
        Game.GameManager.gameState = GameState.Play;
    }


});
