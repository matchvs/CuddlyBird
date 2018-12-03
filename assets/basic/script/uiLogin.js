var uiPanel = require("uiPanel");
cc.Class({
    extends: uiPanel,
    properties: {},

    onLoad() {
        this._super();
        this.nodeDict["start"].on("click", this.startGame, this);

    },
    start(){
        clientEvent.on(clientEvent.eventType.joinRoomResponse, this.joinRoomResponse, this);
    },

    startGame() {
        Game.GameManager.matchVsInit();
    },

    joinRoomResponse: function(data) {
        if (!Game.GameManager.roomId){
            return;
        }
        if (data.status !== 200) {
            console.log('进入房间失败,异步回调错误码: ' + data.status);
        } else {
            console.log('进入房间成功');
            console.log('房间号: ' + data.roomInfo.roomID);
            if (!data.roomUserInfoList.some(function(x) {
                return x.userId === GLB.userInfo.id;
            })) {
                data.roomUserInfoList.push({
                    userId: GLB.userInfo.id,
                    userProfile: ""
                });
            }

            if (cc.Canvas.instance.designResolution.height > cc.Canvas.instance.designResolution.width) {
                uiFunc.openUI("uiLobbyPanelVer");
                uiFunc.openUI("uiRoomVer", function(obj) {
                    var room = obj.getComponent('uiRoom');
                    room.joinRoomInit(data.roomUserInfoList, data.roomInfo);
                    uiFunc.closeUI(this.node.name);
                    this.node.destroy();
                }.bind(this));
            } else {
                uiFunc.openUI("uiLobbyPanelVer");
                uiFunc.openUI("uiRoom", function(obj) {
                    var room = obj.getComponent('uiRoom');
                    room.joinRoomInit(data.roomUserInfoList, data.roomInfo);
                    uiFunc.closeUI(this.node.name);
                    this.node.destroy();
                }.bind(this));
            }
        }
        Game.GameManager.roomId = null;
    },
    onDestroy(){
        clientEvent.off(clientEvent.eventType.joinRoomResponse, this.joinRoomResponse, this);
    }
});
