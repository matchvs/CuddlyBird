var uiPanel = require("uiPanel");
var mvs = require("Matchvs");
cc.Class({
    extends: uiPanel,

    properties: {},

    start() {
        this.nodeDict["guide"].on("click", this.beginnerCourse, this);
        this.nodeDict["randomRoom"].on("click", this.randomRoom, this);
        this.nodeDict["createRoom"].on("click", this.createRoom, this);
        this.nodeDict["joinRoom"].on("click", this.joinRoom, this);
        this.nodeDict["inviteFriend"].on("click", this.inviteFriend, this);
        this.nodeDict["exit"].on("click", this.exit, this);
        if (Game.GameManager.nickName) {
            this.nodeDict["name"].getComponent(cc.Label).string = Game.GameManager.nickName;
        } else {
            this.nodeDict["name"].getComponent(cc.Label).string = GLB.userInfo.id;
        }
        if (Game.GameManager.avatarUrl) {
            cc.loader.load({url: Game.GameManager.avatarUrl, type: 'png'}, function(err, texture) {
                var spriteFrame = new cc.SpriteFrame(texture, cc.Rect(0, 0, texture.width, texture.height));
                this.nodeDict["userIcon"].getComponent(cc.Sprite).spriteFrame = spriteFrame;
            }.bind(this));
        }
        this.nodeDict["rank"].on("click", this.rank, this);
    },

    rank: function() {
        Game.GameManager.blockInput();

        Game.GameManager.getRankData(function(data) {
            uiFunc.openUI("uiRankPanelVer", function(obj) {
                var uiRankPanelScript = obj.getComponent("uiRankPanel");
                if (uiRankPanelScript) {
                    uiRankPanelScript.setData(data);
                }
            })
        });
    },

    exit: function() {
        mvs.engine.logout("");
        uiFunc.closeUI(this.node.name);
        this.node.destroy();
    },

    onEnable() {
        GLB.isRoomOwner = false;
        GLB.MAX_PLAYER_COUNT = 2;
    },

    randomRoom: function() {
        Game.GameManager.blockInput();

        GLB.matchType = GLB.RANDOM_MATCH; // 修改匹配方式为随机匹配
        console.log('开始随机匹配');
        if (GLB.gameType === GLB.COOPERATION) {
            if (GLB.MAX_PLAYER_COUNT > 1) {
                if (cc.Canvas.instance.designResolution.height > cc.Canvas.instance.designResolution.width) {
                    uiFunc.openUI("uiMatchingVer", function(obj) {
                        var matching = obj.getComponent("uiMatching");
                        matching.joinRandomRoom();
                    });
                } else {
                    uiFunc.openUI("uiMatching", function(obj) {
                        var matching = obj.getComponent("uiMatching");
                        matching.joinRandomRoom();
                    });
                }
            } else {
                cc.director.loadScene('game');
            }
        } else if (GLB.gameType === GLB.COMPETITION) {
            if (GLB.MAX_PLAYER_COUNT === 2) {
                if (cc.Canvas.instance.designResolution.height > cc.Canvas.instance.designResolution.width) {
                    uiFunc.openUI("uiMatching1v1Ver", function(obj) {
                        var matching = obj.getComponent("uiMatching1v1Ver");
                        matching.joinRandomRoom();
                    });
                } else {
                    uiFunc.openUI("uiMatching1v1", function(obj) {
                        var matching = obj.getComponent("uiMatching1v1");
                        matching.joinRandomRoom();
                    });
                }
            } else if (GLB.MAX_PLAYER_COUNT === 4) {
                if (cc.Canvas.instance.designResolution.height > cc.Canvas.instance.designResolution.width) {
                    uiFunc.openUI("uiMatching2v2Ver", function(obj) {
                        var matching = obj.getComponent("uiMatching2v2Ver");
                        matching.joinRandomRoom();
                    });
                } else {
                    uiFunc.openUI("uiMatching2v2Ver", function(obj) {
                        var matching = obj.getComponent("uiMatching2v2Ver");
                        matching.joinRandomRoom();
                    });
                }
            }
        }
    },

    createRoom: function() {
        Game.GameManager.blockInput();

        if (cc.Canvas.instance.designResolution.height > cc.Canvas.instance.designResolution.width) {
            uiFunc.openUI("uiCreateRoomVer");
        } else {
            uiFunc.openUI("uiCreateRoom");
        }
    },

    joinRoom: function() {
        Game.GameManager.blockInput();

        if (cc.Canvas.instance.designResolution.height > cc.Canvas.instance.designResolution.width) {
            uiFunc.openUI("uiRoomListVer");
        } else {
            uiFunc.openUI("uiRoomList");
        }
    },

    inviteFriend: function() {
        if (window.BK) {
            BK.QQ.shareToArk(0, "萌鸟连连看", "https://data.tianziyou.com/matchvsGamesRes/logo/linkGameLogo.png", true)
        }
    },

    beginnerCourse: function() {
        uiFunc.openUI("uiBeginnerCourse");
        this.nodeDict["guide"].getComponent(cc.Button).interactable = false;
    },
    openBotton: function() {
        this.nodeDict["guide"].getComponent(cc.Button).interactable = true;
    }


});
