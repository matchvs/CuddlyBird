var uiPanel = require("uiPanel");

cc.Class({

    extends: uiPanel,
    properties: {
        rankPrefab: {
            default: null,
            type: cc.Node
        },
        rank1Node: {
            default: null,
            type: cc.Node
        },
        rank2Node: {
            default: null,
            type: cc.Node
        },
        rank3Node: {
            default: null,
            type: cc.Node
        }
    },

    onLoad: function() {
        this._super();
        var uiLoading = uiFunc.findUI("uiLoading");
        if (!uiLoading){
            uiFunc.openUI("uiLoading",function(obj) {
                var uiLoadingScript = obj.getComponent("uiLoading");
                if (uiLoadingScript) {
                    uiLoadingScript.hideBg();
                }
            });
        }
        this.rankPrefab.active = false;
        this.rank1Node.active = false;
        this.rank2Node.active = false;
        this.rank3Node.active = false;
        this.rank1Info = this.rank1Node.getComponent("rankUserInfo");
        this.rank2Info = this.rank2Node.getComponent("rankUserInfo");
        this.rank3Info = this.rank3Node.getComponent("rankUserInfo");
        this.nodeDict["exit"].on("click", this.quit, this);
    },

    quit: function() {
        uiFunc.closeUI(this.node.name);
        this.node.destroy();
    },

    setData: function(rankdata) {
        console.log("setData");
        rankdata = rankdata.filter(function(data) {
            return data.score !== Number.MAX_SAFE_INTEGER && data.score !== 0;
        });
        for (var i = 0; i < rankdata.length; i++) {
            if (i === 0) {
                this.rank1Node.active = true;
                this.rank1Info.setData(i, rankdata[i]);
            } else if (i === 1) {
                this.rank2Node.active = true;
                this.rank2Info.setData(i, rankdata[i]);
            } else if (i === 2) {
                this.rank3Node.active = true;
                this.rank3Info.setData(i, rankdata[i]);
            } else {
                var temp = cc.instantiate(this.rankPrefab);
                temp.active = true;
                temp.parent = this.rankPrefab.parent;
                var rankInfo = temp.getComponent("rankUserInfo");
                rankInfo.setData(i, rankdata[i]);
            }
        }
        this.schedule(this.closeLoading,0.5);

    },
    closeLoading(){
        this.unschedule(this.closeLoading);
        var uiLoading = uiFunc.findUI("uiLoading");
        uiLoading.getComponent("uiLoading").exit();
    }
});
