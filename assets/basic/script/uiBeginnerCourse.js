var uiPanel = require("uiPanel");
cc.Class({
    extends: uiPanel,

    properties: {
        pageView:{
            default: null,
            type: cc.Node
        }
    },

    onLoad () {
        this._super();
        this.nodeDict["close"].on(cc.Node.EventType.TOUCH_END, this.close, this);
        this.nodeDict["left"].on(cc.Node.EventType.TOUCH_END, this.leftScroll, this);
        this.nodeDict["right"].on(cc.Node.EventType.TOUCH_END, this.rightScroll, this);
    },
    leftScroll(){
        var index = this.pageView.getComponent(cc.PageView).getCurrentPageIndex();
        this.pageView.getComponent(cc.PageView).setCurrentPageIndex(index-1);
    },
    rightScroll(){
        var index = this.pageView.getComponent(cc.PageView).getCurrentPageIndex();
        this.pageView.getComponent(cc.PageView).setCurrentPageIndex(index+1);
    },
    close() {
        var lobbyPanel = uiFunc.findUI("uiLobbyPanelVer");
        if (lobbyPanel) {
            lobbyPanel.getComponent("uiLobbyPanel").openBotton();
        }
        uiFunc.closeUI(this.node.name);
        this.node.destroy();
    },
    update(){
        var index = this.pageView.getComponent(cc.PageView).getCurrentPageIndex();
        this.nodeDict["left"].getComponent(cc.Button).interactable = true;
        this.nodeDict["right"].getComponent(cc.Button).interactable = true;
        if (index === 0){
            this.nodeDict["left"].getComponent(cc.Button).interactable = false;
        }
        else if (index === 2) {
            this.nodeDict["right"].getComponent(cc.Button).interactable = false;
        }
    }

});
