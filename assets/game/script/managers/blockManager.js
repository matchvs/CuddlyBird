var mvs = require("Matchvs");
cc.Class({
    extends: cc.Component,

    properties: {
        arrBlockPrefab:{
            type: cc.Prefab,
            default: []
        },
        linkAudio: {
            default: null,
            url: cc.AudioClip
        },
    },

    onLoad () {
        Game.BlockManager = this;
        this.index = 0;
        this.arrMap = [];
        this.newArrMap = [];
    },
    receiveArrMap(array){
        this.arrMap.push(array);//unshift
        this.index++;
        if(this.index === 8) {
            //this.arrMap.reverse();
            this.bubblingSort(this.arrMap);
            this.initMap(this.arrMap);
        }

    },
    updataArrMap(array){
        this.newArrMap.push(array);
        this.index++;
        if(this.index === 8) {
            this.deleteWholeBlock();
            this.arrMap.push(...this.newArrMap);
            this.newArrMap = [];
            this.bubblingSort(this.arrMap);
            this.initMap(this.arrMap);
        }
    },

    bubblingSort(array){
        for (let i = 0 ; i < array.length - 1 ;i++){
            for (let j = 0; j < array.length - 1 -i;j++){
                if (array[j][0].pos.y < array[j + 1][0].pos.y){
                    var temp = array[j];
                    array[j] = array[j+1];
                    array[j+1] = temp;
                }
            } 
        }
    },
    initMap(arrMap){
        for(let row = 0; row < 8; row++){
            for (let col = 0; col < 9; col++){
                if(arrMap[row][col].type !== null){
                    var block = cc.instantiate(this.arrBlockPrefab[arrMap[row][col].type]);
                    block.parent = this.node;
                    block.setPosition(arrMap[row][col].pos);
                    block.row = row;
                    block.col = col;
                    block.type = arrMap[row][col].type;
                    //block.on("click",block.getComponent("block").click);
                    arrMap[row][col].sprite = block;
                }
            }
        }
        Game.ClickManager.setArrMap(arrMap)
        Game.PlayerManager.self.combo = 1;
        Game.PlayerManager.rival.combo = 1;
    },
    deleteBlock(first,last,id){
        if (this.arrMap[first.row][first.col].sprite === null
            || this.arrMap[last.row][last.col].sprite === null){

            return false;
        }
        cc.audioEngine.play(this.linkAudio, false, 1);
        this.arrMap[first.row][first.col].type = null;
        this.arrMap[first.row][first.col].sprite.removeFromParent();
        this.arrMap[first.row][first.col].sprite = null;
        this.arrMap[last.row][last.col].type = null;
        this.arrMap[last.row][last.col].sprite.removeFromParent();
        this.arrMap[last.row][last.col].sprite = null;

        var pos = this.arrMap[last.row][last.col].pos;
        if (Game.GameManager.gameState !== GameState.Over && GLB.isRoomOwner) {
            mvs.engine.sendFrameEvent(JSON.stringify({
                action: GLB.ADD_COMBO,
                playerId: id,
                pos: pos,
            }));
        }
        if (!this.automaticClearing()){
            this.node.dispatchEvent(new cc.Event.EventCustom(clientEvent.eventType.nextRound,true));
        }
        return true;
    },
    deleteWholeBlock(){
        this.arrMap = [];
        if(this.node.children.length > 0){
            this.node.removeAllChildren();
        }
        Game.ClickManager.curSelec = null;
        Game.ClickManager.setChoiceBox();
    },
    getArrMap(){
        var arrMap = [];
        for (let row = 0; row < 8 ; row++){
            arrMap[row] = [];
            for(let col = 0; col < 9; col++){
                let data = {
                    pos:this.arrMap[row][col].pos,
                    type:this.arrMap[row][col].type,
                    sprite:null
                }
                arrMap[row][col] = data;

            }
        }
        return arrMap;
    },
    nextRound(){
        this.deleteWholeBlock()
        this.node.dispatchEvent(new cc.Event.EventCustom(clientEvent.eventType.nextRound,true));
    },
    automaticClearing(){
        let arrBlock = this.node.children;
        for (let i = 0; i < arrBlock.length; i++){
            for (let j = i + 1; j < arrBlock.length; j++){
                if (Game.ClickManager.link(arrBlock[i],arrBlock[j])){
                    return true;
                }
            }
        }
        return false;
    },
    // update (dt) {},
});
