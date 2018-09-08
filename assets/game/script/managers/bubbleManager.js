

cc.Class({
    extends: cc.Component,

    properties: {
        bubblePrefab:{
            type:cc.Prefab,
            default:null
        },
        bubbleClip:{
            default: null,
            url: cc.AudioClip
        },
        bubbleSpriteFrame:{
            default:[],
            type: cc.SpriteFrame
        }
    },
    start () {
        Game.BubbleManager = this;
        this.selfBubblePool = new cc.NodePool();
        this.rivalBubblePool = new cc.NodePool();
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
        if (id !== Game.PlayerManager.self.playerId){
            var bubble = this.selfBubblePool.get();
            if (!bubble){
                bubble = cc.instantiate(this.bubblePrefab);
            }
            bubble.getComponent(cc.Sprite).spriteFrame = this.bubbleSpriteFrame[i];
            bubble.scaleX = -1;
            var pos = cc.p(-x,y);
            bubble.type = "self";
        }else {
            var bubble = this.rivalBubblePool.get();
            if (!bubble){
                bubble = cc.instantiate(this.bubblePrefab);
            }
            bubble.getComponent(cc.Sprite).spriteFrame = this.bubbleSpriteFrame[i];
            var pos = cc.p(x,y);
            bubble.type = "rival";
        }
        bubble.parent = this.node;
        bubble.setPosition(pos);
        var moveTo = cc.moveTo(3, cc.p(0, y));
        var callFunc = cc.callFunc(this.removeSprite, bubble, this);
        var seq = cc.sequence(moveTo,callFunc);
        bubble.runAction(seq);

    },
    removeSprite(target){
        if (target.type === "self"){
            Game.BubbleManager.selfBubblePool.put(target);
        }else{
            Game.BubbleManager.rivalBubblePool.put(target);
        }

    }
    // update (dt) {},
});
