cc.Class({
    extends: cc.Component,

    properties: {
        rankCntLb: cc.Label,
        userNameLb: cc.Label,
        userIcon: cc.Sprite,
        userScoreLb: cc.Label
    },

    setData(rankIndex, data) {
        if (this.rankCntLb) {
            this.rankCntLb.string = rankIndex + 1;
        }
        this.userNameLb.string = data.nick;
        cc.loader.load({url: data.url, type: 'png'}, function(err, texture) {
            var spriteFrame = new cc.SpriteFrame(texture, cc.Rect(0, 0, texture.width, texture.height));
            if(this.userIcon) {
                this.userIcon.spriteFrame = spriteFrame;
            }
        }.bind(this));
        this.userScoreLb.string = data.score;
    }
});
