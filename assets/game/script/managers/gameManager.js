var mvs = require("Matchvs");
cc.Class({
    extends: cc.Component,
    properties: {
        uiTip:{
            type: cc.Prefab,
            default: null
        }
    },
    blockInput() {
        Game.GameManager.getComponent(cc.BlockInputEvents).enabled = true;
        setTimeout(function() {
            Game.GameManager.node.getComponent(cc.BlockInputEvents).enabled = false;
        }, 1000);
    },
    onLoad() {
        Game.GameManager = this;
        cc.game.addPersistRootNode(this.node);
        cc.director.getCollisionManager().enabled = true;
        clientEvent.init();
        dataFunc.loadConfigs();
        cc.view.enableAutoFullScreen(false);

        clientEvent.on(clientEvent.eventType.gameOver, this.gameOver, this);
        clientEvent.on(clientEvent.eventType.leaveRoomNotify, this.leaveRoom, this);

        this.bUiReconnection = true;
        this.bReconnect = false;
        this.bExit = true;
        this.number = 0;

        this.start_game_time = new Date().getTime();
        this.network = window.network;
        this.network.chooseNetworkMode();
        this.findPlayerByAccountListener();
        this.getUserInfoFromRank();

        this.uiTipBk = cc.instantiate(this.uiTip);
        this.uiTipBk.parent = this.node;
        this.uiTipBk.active = false;
    },

    leaveRoom: function(data) {
        // 离开房间--
        if (this.gameState === GameState.Play) {
            if (data.leaveRoomInfo.userId !== GLB.userInfo.id) {
                this.isRivalLeave = true;
            }
            clientEvent.dispatch(clientEvent.eventType.leaveRoomMedNotify, this.leaveRoom, this);
            this.gameOver();
        }
    },

    gameOver: function() {
        console.log("游戏结束");
        var gamePanel = uiFunc.findUI("uiGamePanel");
        if (gamePanel && Game.GameManager.gameState !== GameState.Over) {
            Game.GameManager.gameState = GameState.Over;
            this.readyCnt = 0;
            setTimeout(function() {
                clientEvent.dispatch(clientEvent.eventType.gameOver);
            }.bind(this), 1500);
            setTimeout(function() {
                uiFunc.openUI("uiVsResultVer");
            }.bind(this), 3000);
        }
    },

    matchVsInit: function() {
        mvs.response.initResponse = this.initResponse.bind(this);
        mvs.response.errorResponse = this.errorResponse.bind(this);
        mvs.response.joinRoomResponse = this.joinRoomResponse.bind(this);
        mvs.response.joinRoomNotify = this.joinRoomNotify.bind(this);
        mvs.response.leaveRoomResponse = this.leaveRoomResponse.bind(this);
        mvs.response.leaveRoomNotify = this.leaveRoomNotify.bind(this);
        mvs.response.joinOverResponse = this.joinOverResponse.bind(this);
        mvs.response.createRoomResponse = this.createRoomResponse.bind(this);
        mvs.response.getRoomListResponse = this.getRoomListResponse.bind(this);
        mvs.response.getRoomDetailResponse = this.getRoomDetailResponse.bind(this);
        mvs.response.getRoomListExResponse = this.getRoomListExResponse.bind(this);
        mvs.response.kickPlayerResponse = this.kickPlayerResponse.bind(this);
        mvs.response.kickPlayerNotify = this.kickPlayerNotify.bind(this);
        mvs.response.registerUserResponse = this.registerUserResponse.bind(this);
        mvs.response.loginResponse = this.loginResponse.bind(this); // 用户登录之后的回调
        mvs.response.logoutResponse = this.logoutResponse.bind(this); // 用户登录之后的回调
        mvs.response.sendEventNotify = this.sendEventNotify.bind(this);
        mvs.response.frameUpdate = this.frameUpdate.bind(this);
        mvs.response.setFrameSyncResponse = this.setFrameSyncResponse.bind(this);
        mvs.response.reconnectResponse = this.reconnectResponse.bind(this);
        mvs.response.networkStateNotify = this.networkStateNotify.bind(this);

        var result = mvs.engine.init(mvs.response, GLB.channel, GLB.platform, GLB.gameId);
        if (result !== 0) {
            console.log('初始化失败,错误码:' + result);
        }
        Game.GameManager.blockInput();
        this.loginServer();
    },
    networkStateNotify: function(netNotify) {
        console.log("netNotify");
        console.log("netNotify.owner:" + netNotify.owner);
        if (netNotify.userID !== GLB.userInfo.id) {
            GLB.isRoomOwner = true;
        }
        uiFunc.openUI("uiTip", function(obj) {
            var uiTip = obj.getComponent("uiTip");
            if (uiTip) {
                uiTip.setData("对手离开了游戏");
            }
        });
        console.log("玩家：" + netNotify.userID + " state:" + netNotify.state);
        clientEvent.dispatch(clientEvent.eventType.leaveRoomMedNotify, netNotify);
    },

    kickPlayerNotify: function(kickPlayerNotify) {
        var data = {
            kickPlayerNotify: kickPlayerNotify
        };
        clientEvent.dispatch(clientEvent.eventType.kickPlayerNotify, data);
    },

    kickPlayerResponse: function(kickPlayerRsp) {
        if (kickPlayerRsp.status !== 200) {
            console.log("失败kickPlayerRsp:" + kickPlayerRsp);
            return;
        }
        var data = {
            kickPlayerRsp: kickPlayerRsp
        };
        clientEvent.dispatch(clientEvent.eventType.kickPlayerResponse, data);
    },

    getRoomListExResponse: function(rsp) {
        if (rsp.status !== 200) {
            console.log("失败 rsp:" + rsp);
            return;
        }
        var data = {
            rsp: rsp
        };
        clientEvent.dispatch(clientEvent.eventType.getRoomListExResponse, data);
    },

    getRoomDetailResponse: function(rsp) {
        if (rsp.status !== 200) {
            console.log("失败 rsp:" + rsp);
            return;
        }
        var data = {
            rsp: rsp
        };
        cc.log(data.rsp.userInfos);
        clientEvent.dispatch(clientEvent.eventType.getRoomDetailResponse, data);
    },

    getRoomListResponse: function(status, roomInfos) {
        if (status !== 200) {
            console.log("失败 status:" + status);
            return;
        }
        var data = {
            status: status,
            roomInfos: roomInfos
        };
        clientEvent.dispatch(clientEvent.eventType.getRoomListResponse, data);
    },

    createRoomResponse: function(rsp) {
        if (rsp.status !== 200) {
            console.log("失败 createRoomResponse:" + rsp);
            return;
        }
        var data = {
            rsp: rsp
        };
        clientEvent.dispatch(clientEvent.eventType.createRoomResponse, data);
    },

    joinOverResponse: function(joinOverRsp) {
        if (joinOverRsp.status !== 200) {
            console.log("失败 joinOverRsp:" + joinOverRsp);
            return;
        }
        var data = {
            joinOverRsp: joinOverRsp
        };
        clientEvent.dispatch(clientEvent.eventType.joinOverResponse, data);
    },

    joinRoomResponse: function(status, roomUserInfoList, roomInfo) {
        if (status !== 200) {
            console.log("失败 joinRoomResponse:" + status);
            return;
        }
        var data = {
            status: status,
            roomUserInfoList: roomUserInfoList,
            roomInfo: roomInfo
        };
        clientEvent.dispatch(clientEvent.eventType.joinRoomResponse, data);
    },

    joinRoomNotify: function(roomUserInfo) {
        var data = {
            roomUserInfo: roomUserInfo
        };
        console.log("GameManager.joinRoomNotify");
        clientEvent.dispatch(clientEvent.eventType.joinRoomNotify, data);
    },

    leaveRoomResponse: function(leaveRoomRsp) {
        if (leaveRoomRsp.status !== 200) {
            console.log("失败 leaveRoomRsp:" + leaveRoomRsp);
            return;
        }
        var data = {
            leaveRoomRsp: leaveRoomRsp
        };
        clientEvent.dispatch(clientEvent.eventType.leaveRoomResponse, data);
    },

    leaveRoomNotify: function(leaveRoomInfo) {
        var data = {
            leaveRoomInfo: leaveRoomInfo
        };
        clientEvent.dispatch(clientEvent.eventType.leaveRoomNotify, data);
    },

    logoutResponse: function(status) {
        Game.GameManager.network.disconnect();
        cc.game.removePersistRootNode(this.node);
        cc.director.loadScene('lobby');
    },

    errorResponse: function(error, msg) {
        clientEvent.dispatch(clientEvent.eventType.aaa);
        let recurLobby = true;
        this.openTip("网络连接中断");
        GLB.isRoomOwner = false;
        console.log("错误信息：" + error);
        console.log("错误信息：" + msg);
        if (error === 0 || error === 1001){
            var gamePanel = uiFunc.findUI("uiGamePanel");
            if (gamePanel) {
                if (this.bUiReconnection) {
                    this.bUiReconnection = false;
                    Game.GameManager.gameState = GameState.None;
                    this.schedule(this.reconnectCountDown,1);
                }
                recurLobby = false;
                cc.log("游戏界面存在");
            }
            if (recurLobby) {
                setTimeout(function() {
                    if (error === 0){
                        this.closeUiPanel();
                    }else{
                        this.recurLobby();
                    }
                }.bind(this), 2000);
            }
        }
    },
    openTip(string){
        var uiTip = cc.instantiate(this.uiTipBk);
        uiTip.active = true;
        uiTip.parent = cc.Canvas.instance.node;
        uiTip.getComponent("uiTip").setData(string);
        uiTip.setPosition(cc.p(0,0));
    },
    closeUiPanel(){
        //var scene = cc.director.getScene().getName();
        var uiList = uiFunc.getUiList();
        for (let uiPanel of uiList){
            var uiPanelName = uiPanel.getName();
            if (uiPanelName !== ""){
                uiFunc.closeUI(uiPanelName);
                uiPanel.destroy();
            }
        }
    },
    reconnectCountDown(){
        this.number++;
        cc.log("当前断线重连计数:" + this.number);
        mvs.engine.reconnect();
        if (this.number >= 15){
            this.stopReconnectCountDown(false);
        }
    },
    stopReconnectCountDown(success){
        this.number = 0;
        this.unschedule(this.reconnectCountDown);
        if(!success) {
            //this.closeUiPanel();
            this.recurLobby();
        }
    },
    reconnect() {
        if (this.bReconnect) {
            return;
        }
        uiFunc.openUI("uiTip", function(obj) {
            var uiTip = obj.getComponent("uiTip");
            if (uiTip) {
                uiTip.setData("无法获取房间信息，不能进行重新连接");
            }
        });
        var gamePanel = uiFunc.findUI("uiGamePanel");
        if (gamePanel) {
            uiFunc.closeUI("uiGamePanel");
            gamePanel.destroy();
            cc.audioEngine.stop(gamePanel.getComponent("uiGamePanel").bgmId);
        }
        this.recurLobby();
    },
    reconnectResponse: function(status, roomUserInfoList, roomInfo) {
        if (status === 200) {
            cc.log("重新连接成功" + status);
            cc.log("重连玩家信息" + GLB.userInfo.id);
            if (roomUserInfoList.length <= 0) {
                cc.log("无法获取房间信息，不能进行重新连接")
                this.stopReconnectCountDown(false);
                uiFunc.openUI("uiTip", function(obj) {
                    var uiTip = obj.getComponent("uiTip");
                    if (uiTip) {
                        uiTip.setData("无法获取房间信息，不能进行重新连接");
                    }
                });
                this.recurLobby();
                return;
            }
            this.stopReconnectCountDown(true);
            uiFunc.openUI("uiTip", function(obj) {
                var uiTip = obj.getComponent("uiTip");
                if (uiTip) {
                    uiTip.setData("正在重新连接");
                }
            });
            var gamePanel = uiFunc.findUI("uiGamePanel");
            if (gamePanel) {
                cc.log("游戏界面已存在");
                mvs.engine.sendFrameEvent(JSON.stringify({
                    action: GLB.GET_GAME_DATA,
                    playerId: GLB.userInfo.id,
                }));
            } else {
                cc.log("游戏界面不存在");
                cc.director.loadScene('game', function() {
                    uiFunc.openUI("uiGamePanel", function() {
                        mvs.engine.getRoomDetail(roomInfo.roomID);
                        mvs.engine.sendFrameEvent(JSON.stringify({
                            action: GLB.GET_GAME_DATA,
                            playerId: GLB.userInfo.id,
                        }));
                    }.bind(this));
                }.bind(this));
            }
            this.bUiReconnection = true;
        } else {
            cc.log("重新连接失败" + status);
            uiFunc.openUI("uiTip", function(obj) {
                var uiTip = obj.getComponent("uiTip");
                if (uiTip) {
                    uiTip.setData("重新连接失败");
                }
            });
            this.stopReconnectCountDown(false);
            this.recurLobby();
        }
    },
    recurLobby() {
        mvs.engine.logout("");
        setTimeout(function() {
            cc.game.removePersistRootNode(this.node);
            cc.director.loadScene('lobby');
        }.bind(this), 1500);
    },
    initResponse: function() {
        console.log('初始化成功，开始注册用户');
        var result = mvs.engine.registerUser();
        if (result !== 0) {
            console.log('注册用户失败，错误码:' + result);
        } else {
            console.log('注册用户成功');
        }
    },

    registerUserResponse: function(userInfo) {
        var deviceId = 'abcdef';
        var gatewayId = 0;
        GLB.userInfo = userInfo;

        console.log('开始登录,用户Id:' + userInfo.id);

        var result = mvs.engine.login(
            userInfo.id, userInfo.token,
            GLB.gameId, GLB.gameVersion,
            GLB.appKey, GLB.secret,
            deviceId, gatewayId
        );
        if (result !== 0) {
            console.log('登录失败,错误码:' + result);
        }
    },

    loginResponse: function(info) {
        if (info.status !== 200) {
            console.log('登录失败,异步回调错误码:' + info.status);
        } else {
            console.log('登录成功');
            if (info.roomID !== null && info.roomID !== "0") {
                mvs.engine.reconnect();
                //mvs.engine.reconnect();
            } else {
                this.lobbyShow();
            }
        }
    },

    lobbyShow: function() {
        this.gameState = GameState.None;
        if (cc.Canvas.instance.designResolution.height > cc.Canvas.instance.designResolution.width) {
            uiFunc.openUI("uiLobbyPanelVer");
        } else {
            uiFunc.openUI("uiLobbyPanel");
        }
    },

    // 收到的消息
    sendEventNotify: function(info) {
        //console.log(info);
        var cpProto = JSON.parse(info.cpProto);
        if (info.cpProto.indexOf(GLB.GAME_START_EVENT) >= 0) {
            GLB.playerUserIds = [GLB.userInfo.id];
            var remoteUserIds = JSON.parse(info.cpProto).userIds;
            remoteUserIds.forEach(function(id) {
                if (GLB.userInfo.id !== id) {
                    GLB.playerUserIds.push(id);
                }
            });
            this.startGame();
        }

        if (info.cpProto.indexOf(GLB.GAME_OVER_EVENT) >= 0) {
            this.gameOver();
        }

        if (info.cpProto.indexOf(GLB.READY) >= 0) {
            this.readyCnt++;
            if (GLB.isRoomOwner && this.readyCnt >= GLB.playerUserIds.length) {
                this.sendRoundStartMsg();
            }
        }

        if (info.cpProto.indexOf(GLB.ROUND_START) >= 0) {
            setTimeout(function() {
                Game.GameManager.gameState = GameState.Play;
            }.bind(this), 2000);

            if (GLB.syncFrame === true && GLB.isRoomOwner === true) {
                var result = mvs.engine.setFrameSync(GLB.FRAME_RATE);
                if (result !== 0) {
                    console.log('设置帧同步率失败,错误码:' + result);
                }
            }
            clientEvent.dispatch(clientEvent.eventType.roundStart);
        }
    },


    frameUpdate: function(rsp) {
        for (var i = 0; i < rsp.frameItems.length; i++) {
            if (Game.GameManager.gameState === GameState.Over) {
                return;
            }
            var info = rsp.frameItems[i];
            var cpProto = JSON.parse(info.cpProto);

            if (info.cpProto.indexOf(GLB.INITMAP) >= 0) {
                Game.BlockManager.receiveArrMap(cpProto.array);
            }

            if (info.cpProto.indexOf(GLB.DELETE_BLOCK) >= 0) {
               Game.BlockManager.deleteBlock(cpProto.firstPos, cpProto.lastPos, cpProto.playerId ,cpProto.arrPath);

            }
            if (info.cpProto.indexOf(GLB.BUBBLE) >= 0) {
                Game.BubbleManager.initBubble(cpProto.type, cpProto.id);
            }
            if (info.cpProto.indexOf(GLB.ADD_COMBO) >= 0) {
                Game.ComboManager.addCombo(cpProto.pos, cpProto.playerId);
            }
            if (info.cpProto.indexOf(GLB.TIME_OUT) >= 0) {
                Game.BlockManager.nextRound();
            }
            if (info.cpProto.indexOf(GLB.GET_GAME_DATA) >= 0) {
                if (GLB.userInfo.id === cpProto.playerId) {
                    this.bReconnect = false;
                    this.scheduleOnce(this.reconnect, 3);
                }
                if (GLB.userInfo.id !== cpProto.playerId) {
                    cc.log("精灵帧，准备获取未断线玩家数据");
                    clientEvent.dispatch(clientEvent.eventType.getReconnectionData);
                }
            }
            if (info.cpProto.indexOf(GLB.UPDATA_ARR_MAP) >= 0) {
                Game.BlockManager.updataArrMap(cpProto.array);
            }
            if (info.cpProto.indexOf(GLB.RECONNECTION_DATA) >= 0) {
                if (cpProto.playerId === GLB.userInfo.id){
                    uiFunc.openUI("uiTip", function(obj) {
                        var uiTip = obj.getComponent("uiTip");
                        if (uiTip) {
                            uiTip.setData("对手重新连接");
                        }
                    });
                }
                if (cpProto.playerId !== GLB.userInfo.id) {
                    uiFunc.openUI("uiTip", function(obj) {
                        var uiTip = obj.getComponent("uiTip");
                        if (uiTip) {
                            uiTip.setData("重新连接成功");
                        }
                    });
                }
                clientEvent.dispatch(clientEvent.eventType.setReconnectionData, cpProto);
            }
        }
        if (Game.GameManager.gameState === GameState.Play) {
            Game.PlayerManager.self.buffTime();
            Game.PlayerManager.rival.buffTime();
        }
    },

    sendReadyMsg: function() {
        var msg = {action: GLB.READY};
        this.sendEventEx(msg);
    },

    sendRoundStartMsg: function() {
        var msg = {action: GLB.ROUND_START};
        this.sendEventEx(msg);
    },

    sendEventEx: function(msg) {
        var result = mvs.engine.sendEventEx(0, JSON.stringify(msg), 0, GLB.playerUserIds);
        if (result.result !== 0) {
            console.log(msg.action, result.result);
        }
    },

    sendEvent: function(msg) {
        var result = mvs.engine.sendEvent(JSON.stringify(msg));
        if (result.result !== 0) {
            console.log(msg.action, result.result);
        }
    },

    startGame: function() {
        this.readyCnt = 0;
        this.isRivalLeave = false;
        cc.director.loadScene('game', function() {
            uiFunc.openUI("uiGamePanel", function() {
                this.sendReadyMsg();
            }.bind(this));
        }.bind(this));
    },

    setFrameSyncResponse: function(rsp) {
        if (rsp.mStatus !== 200) {
            console.log('设置同步帧率失败，status=' + rsp.status);
        } else {
            console.log('设置同步帧率成功, 帧率为:' + GLB.FRAME_RATE);
        }
    },


    findPlayerByAccountListener: function() {
        this.network.on("connector.entryHandler.findPlayerByAccount", function(recvMsg) {
            clientEvent.dispatch(clientEvent.eventType.playerAccountGet, recvMsg);
        });
    },

    loginServer: function() {
        if (!this.network.isConnected()) {
            try {
                this.network.connect(GLB.IP, GLB.PORT, function() {
                        this.network.send("connector.entryHandler.login", {
                            "account": GLB.userInfo.id + "",
                            "channel": "0",
                            "userName": Game.GameManager.nickName ? Game.GameManager.nickName : GLB.userInfo.id + "",
                            "headIcon": Game.GameManager.avatarUrl ? Game.GameManager.avatarUrl : "-"
                        });
                    }.bind(this)
                );
            }
            catch (e) {

            }
        }
    },


    // 排行榜相关--
    getUserInfoFromRank() {
        if (window.BK) {
            var attr = "score";
            var order = 1;
            var rankType = 0;
            BK.QQ.getRankListWithoutRoom(attr, order, rankType, function(errCode, cmd, data) {
                var isContainSelf = false;
                if (data) {
                    for (var i = 0; i < data.data.ranking_list.length; ++i) {
                        var rd = data.data.ranking_list[i];
                        if (rd.selfFlag) {
                            isContainSelf = true;
                            Game.GameManager.avatarUrl = rd.url;
                            Game.GameManager.nickName = rd.nick;
                            break;
                        }
                    }
                }
                if (!isContainSelf) {
                    this.setRankData(0, function() {
                        // 设置成功，取值--
                        this.getUserInfoFromRank();
                    }.bind(this));
                }
            }.bind(this));
        }
    },

    userInfoReq: function(userId) {
        if (!Game.GameManager.network.isConnected()) {
            try {
                Game.GameManager.network.connect(GLB.IP, GLB.PORT, function() {
                        Game.GameManager.network.send("connector.entryHandler.login", {
                            "account": GLB.userInfo.id + "",
                            "channel": "0",
                            "userName": Game.GameManager.nickName ? Game.GameManager.nickName : GLB.userInfo.id + "",
                            "headIcon": Game.GameManager.avatarUrl ? Game.GameManager.avatarUrl : "-"
                        });
                        setTimeout(function() {
                            Game.GameManager.network.send("connector.entryHandler.findPlayerByAccount", {
                                "account": userId + "",
                            });
                        }, 200);
                    }
                );
            }
            catch (e) {

            }
        } else {
            Game.GameManager.network.send("connector.entryHandler.findPlayerByAccount", {
                "account": userId + "",
            });
        }
    },

    getRankData(callback) {
        if (!window.BK) {
            return;
        }
        // 先拉 score 排行榜
        var attr = "score";//使用哪一种上报数据做排行，可传入score，a1，a2等
        var order = 1;     //排序的方法：[ 1: 从大到小(单局)，2: 从小到大(单局)，3: 由大到小(累积)]
        var rankType = 0; //要查询的排行榜类型，0: 好友排行榜，1: 群排行榜，2: 讨论组排行榜，3: C2C二人转 (手Q 7.6.0以上支持)
        // 必须配置好周期规则后，才能使用数据上报和排行榜功能
        BK.QQ.getRankListWithoutRoom(attr, order, rankType, function(errCode, cmd, data) {
            BK.Script.log(1, 1, "getRankListWithoutRoom callback  cmd" + cmd + " errCode:" + errCode + "  data:" + JSON.stringify(data));
            // 返回错误码信息
            if (errCode !== 0) {
                BK.Script.log(1, 1, '获取排行榜数据失败!错误码：' + errCode);
                return;
            }
            // 解析数据
            var isContainSelf = false;
            if (data) {
                for (var i = 0; i < data.data.ranking_list.length; ++i) {
                    var rd = data.data.ranking_list[i];
                    // rd 的字段如下:
                    //var rd = {
                    //    url: '',            // 头像的 url
                    //    nick: '',           // 昵称
                    //    score: 1,           // 分数
                    //    selfFlag: false,    // 是否是自己
                    //};
                    if (rd.selfFlag) {
                        isContainSelf = true;
                    }
                }
                if (callback) {
                    callback(data.data.ranking_list);
                }
            }
            if (!isContainSelf) {
                this.setRankData(0);
            }
        });
    },

    setRankData(score, callback) {
        if (!window.BK) {
            return;
        }
        var data = {
            userData: [
                {
                    openId: GameStatusInfo.openId,
                    startMs: this.start_game_time.toString(),    //必填。 游戏开始时间。单位为毫秒，<font color=#ff0000>类型必须是字符串</font>
                    endMs: ((new Date()).getTime()).toString(),  //必填。 游戏结束时间。单位为毫秒，<font color=#ff0000>类型必须是字符串</font>
                    scoreInfo: {
                        score: score
                    },
                },
            ],
            // type 描述附加属性的用途
            // order 排序的方式，
            // 1: 从大到小，即每次上报的分数都会与本周期的最高得分比较，如果大于最高得分则覆盖，否则忽略
            // 2: 从小到大，即每次上报的分数都会与本周期的最低得分比较，如果低于最低得分则覆盖，否则忽略（比如酷跑类游戏的耗时，时间越短越好）
            // 3: 累积，即每次上报的积分都会累积到本周期已上报过的积分上
            // 4: 直接覆盖，每次上报的积分都会将本周期的得分覆盖，不管大小
            // 如score字段对应，上个属性.
            attr: {
                score: {
                    type: 'rank',
                    order: 1,
                }
            },
        };
        // gameMode: 游戏模式，如果没有模式区分，直接填 1
        // 必须配置好周期规则后，才能使用数据上报和排行榜功能
        BK.QQ.uploadScoreWithoutRoom(1, data, function(errCode, cmd, data) {
            // 返回错误码信息
            if (errCode !== 0) {
                BK.Script.log(1, 1, '上传分数失败!错误码：' + errCode);
            } else {
                if (callback) {
                    callback();
                }
            }
        });
    },
    onDestroy() {
        clientEvent.off(clientEvent.eventType.gameOver, this.gameOver, this);
        clientEvent.off(clientEvent.eventType.leaveRoomNotify, this.leaveRoom, this);
    }

});
