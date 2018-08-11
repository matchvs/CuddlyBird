var uiPanel = require("uiPanel");
cc.Class({
    extends: uiPanel,

    properties: {

    },

    // onLoad () {},

    onLoad () {
        this._super();
        this.count = 1;
        this.schedule(this.callFunc,0.1);
    },
    close() {
        this.unschedule(this.callFunc);
        uiFunc.closeUI(this.node.name);
        this.node.destroy();
    },
    callFunc(){
        this.count = this.count >= 6 ? 1 : this.count++;
        var str = ".";
        switch (this.count){
            case 1 : str=".";
                break;
            case 2 : str="..";
                break;
            case 3 : str="...";
                break;
            case 4 : str="....";
                break;
            case 5 : str=".....";
                break;
            case 6 : str="......";
                break;
        }
        this.nodeDict['label'].getComponent(cc.Label).string = "等待对手重连中" + str;
    }
    // update (dt) {},
});
