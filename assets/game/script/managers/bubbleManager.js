

cc.Class({
    extends: cc.Component,

    properties: {
        arrBubblePrefab:{
            type:cc.Prefab,
            default:[]
        },
        bubbleClip:{
            default: null,
            url: cc.AudioClip
        }
    },
    start () {
        Game.BubbleManager = this;
    },
    initBubble(type,id){
        cc.audioEngine.play(this.bubbleClip, false, 1);
        var i = null;
        switch (type){
            case "one": i = 0;
                break;
            case "two": i = 1;
                break;
            case "three": i = 2;
                break;
            case "four": i = 3;
                break;
            case "five": i = 4;
                break;
            case "six": i = 5;
                break;
        }
        var x = -200;
        var y = Math.random() * 100;
        var bubble = cc.instantiate(this.arrBubblePrefab[i]);
        bubble.parent = this.node;
        if (id !== Game.PlayerManager.self.playerId){
            bubble.scaleX = -1;
            let pos = cc.p(-x,y)
            bubble.setPosition(pos);
        }else {
            let pos = cc.p(x,y)
            bubble.setPosition(pos);
        }
        var moveTo = cc.moveTo(3, cc.p(0, y));
        var callFunc = cc.callFunc(this.removeSprite, bubble, this);
        var seq = cc.sequence(moveTo,callFunc);
        bubble.runAction(seq);

    },
    removeSprite(sprite){
        sprite.removeFromParent();
    }
    // update (dt) {},
});
