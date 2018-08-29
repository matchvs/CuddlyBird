cc.Class({
    extends: cc.Component,

    properties: {

    },
    onLoad () {
        this.node.on("click",this.click,this);
    },
    click(){
        Game.ClickManager.clickBlock(this.node);
    }
});
