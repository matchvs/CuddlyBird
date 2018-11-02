var uiPanel = require("uiPanel");
var mvs = require("Matchvs");
cc.Class({
    extends: uiPanel,
    properties: {},

    onLoad() {
        this._super();
        this.playerCntLb = this.nodeDict["playerCnt"].getComponent(cc.Label);
        this.playerCnt = GLB.PLAYER_COUNTS[0];
        this.playerCntLb.string = this.playerCnt;
        this.refreshBtnState();
        this.nodeDict["quit"].on("click", this.quit, this);
        this.nodeDict["addNode"].on("click", this.addPlayerCount, this);
        this.nodeDict["subNode"].on("click", this.subPlayerCount, this);
        this.nodeDict["create"].on("click", this.createRoom, this);
        this.roomName = this.nodeDict["roomName"].getComponent(cc.EditBox);

        this.nodeDict["roomName"].on("editing-did-began",this.editingDidBegan,this);
        this.nodeDict["roomName"].on("editing-return",this.editingReturn,this);

        clientEvent.on(clientEvent.eventType.createRoomResponse, this.createRoomResponse, this);
    },

    addPlayerCount: function() {
        for (var i = 0; i < GLB.PLAYER_COUNTS.length; i++) {
            if (this.playerCnt === GLB.PLAYER_COUNTS[i]) {
                if (GLB.PLAYER_COUNTS.length > i + 1) {
                    this.playerCnt = GLB.PLAYER_COUNTS[i + 1];
                    break;
                }
            }
        }

        this.playerCntLb.string = this.playerCnt;
        this.refreshBtnState();
    },

    editingReturn(){
        if (window.BK){
            BK.Editor.hideKeyBoard();
        }
        if (this.roomName.string.length > 8){
            var string = this.roomName.string.slice(0,8);
            this.roomName.string = string;

        }

    },
    editingDidBegan(){
        if (window.BK){
            BK.Editor.setText(this.roomName.string);
        }
    },

    subPlayerCount: function() {
        for (var i = 0; i < GLB.PLAYER_COUNTS.length; i++) {
            if (this.playerCnt === GLB.PLAYER_COUNTS[i]) {
                if (i > 0) {
                    this.playerCnt = GLB.PLAYER_COUNTS[i - 1];
                    break;
                }
            }
        }
        this.playerCntLb.string = this.playerCnt;
        this.refreshBtnState();
    },

    refreshBtnState() {
        if (this.playerCnt === GLB.PLAYER_COUNTS[0]) {
            this.nodeDict["subNode"].getComponent(cc.Button).interactable = false;
        } else {
            this.nodeDict["subNode"].getComponent(cc.Button).interactable = true;
        }

        if (this.playerCnt === GLB.PLAYER_COUNTS[GLB.PLAYER_COUNTS.length - 1]) {
            this.nodeDict["addNode"].getComponent(cc.Button).interactable = false;
        } else {
            this.nodeDict["addNode"].getComponent(cc.Button).interactable = true;
        }
    },

    quit: function() {
        uiFunc.closeUI(this.node.name);
        this.node.destroy();
    },

    createRoom: function() {
        Game.GameManager.blockInput();

        var create = new mvs.CreateRoomInfo();
        create.roomName = this.nodeDict["roomName"].getComponent(cc.EditBox).string;
        GLB.MAX_PLAYER_COUNT = this.playerCnt;
        create.maxPlayer = GLB.MAX_PLAYER_COUNT;
        create.mode = 0;
        create.canWatch = 0;
        create.visibility = 1;
        create.roomProperty = GLB.MAX_PLAYER_COUNT;
        var result = mvs.engine.createRoom(create, { maxPlayer: GLB.MAX_PLAYER_COUNT });
        if (result !== 0) {
            console.log('创建房间失败,错误码:' + result);
        }
    },

    createRoomResponse: function(data) {
        var status = data.rsp.status;
        if (status !== 200) {
            console.log('创建房间失败,异步回调错误码: ' + status);
        } else {
            console.log('创建房间成功:' + JSON.stringify(data.rsp));
            console.log('房间号: ' + data.rsp.roomID);
            GLB.roomId = data.rsp.roomID;

            if (cc.Canvas.instance.designResolution.height > cc.Canvas.instance.designResolution.width) {
                uiFunc.openUI("uiRoomVer", function(obj) {
                    var room = obj.getComponent('uiRoom');
                    room.createRoomInit(data.rsp);
                    uiFunc.closeUI(this.node.name);
                    this.node.destroy();
                }.bind(this));
            } else {
                uiFunc.openUI("uiRoom", function(obj) {
                    var room = obj.getComponent('uiRoom');
                    room.createRoomInit(data.rsp);
                    uiFunc.closeUI(this.node.name);
                    this.node.destroy();
                }.bind(this));
            }
        }
    },

    onDestroy: function() {
        clientEvent.off(clientEvent.eventType.createRoomResponse, this.createRoomResponse, this);
        this.nodeDict["roomName"].off("editing-did-began",this.editingDidBegan,this);
        this.nodeDict["roomName"].off("editing-return",this.editingReturn,this);
    }

});
