var mvs = require("Matchvs");
cc.Class({
    extends: cc.Component,

    properties: {
        choiceBoxPrefab:{
            default: null,
            type: cc.Prefab
        }
    },
    onLoad () {
        Game.ClickManager = this;
        this.curSelec = null;
        this.arrMap = [];
        this.bClick = false;
        this.arrPath = [];
        this.setChoiceBox();
    },
    setArrMap(arrMap){
        this.arrMap = arrMap;
    },
    setChoiceBox(){
        this.choiceBox = cc.instantiate(this.choiceBoxPrefab);
        this.choiceBox.parent = Game.BlockManager.node;
        this.choiceBox.setPosition(cc.p(0,0));
        this.choiceBox.setLocalZOrder(100);
        this.choiceBox.opacity = 0;
    },
    clickBlock(block){
        if (!this.bClick){
            return;
        }
        if (this.curSelec === null){
            this.curSelec = block;
            this.setJump(block);
        }else{
            if (block !== this.curSelec) {
                if (!this.link(this.curSelec, block)) {
                    this.setStop(this.curSelec);
                    this.curSelec = block;
                    this.setJump(block);
                }else{
                    this.sendEliminateBlock(this.curSelec,block,this.arrPath);
                    this.choiceBox.opacity = 0;
                }
            }
        }
    },
    setJump(block){
        //sprite.color = new cc.Color(127.5, 127.5, 127.5);
        let seq = cc.repeatForever(
            cc.sequence(
                cc.moveBy(1, 0, 5),
                cc.moveBy(0.5, 0, -5)
            ));
        block.runAction(seq);
        let pos = block.getPosition();
        this.choiceBox.setPosition(pos);
        this.choiceBox.opacity = 255;

    },
    setStop(block){
       //sprite.color = new cc.Color(255, 255, 255, 255);
        block.stopAllActions();
        let pos = this.arrMap[block.row][block.col].pos;
        block.setPosition(pos);
        this.choiceBox.opacity = 0;
    },
    link(first,last){
        if (first.type !== last.type){
            return false;
        }
        //用于存储路径的数组
        this.arrPath = [];
        //判断能否直连
        if (this.straightLine(first,last)){
            this.pushPath(first);
            this.pushPath(last);
            return true;
        }
        //一个拐角，对角可直连
        //取得拐角位置的精灵
        var corner = {
            row: first.row,
            col: last.col
        }
        if (this.arrMap[corner.row][corner.col].type === null){
            if (this.straightLine(first, corner)
                && this.straightLine(corner, last)){
                this.pushPath(first);
                this.pushPath(corner);
                this.pushPath(last);
                return true;
            }
        }
        //一个拐角的另一种方法
        corner = {
            row: last.row,
            col: first.col
        }
        if (this.arrMap[corner.row][corner.col].type === null){
            if (this.straightLine(first, corner)
                && this.straightLine(corner, last)){
                this.pushPath(first);
                this.pushPath(corner);
                this.pushPath(last);
                return true;

            }
        }
        //俩个精灵进行row扩展，判断是否有可直连的点
        var arrFirstRow = [];
        var arrLastRow = [];
        this.expandRow(first,arrFirstRow);
        this.expandRow(last,arrLastRow);
        for (let firstEx of arrFirstRow){
            for (let lastEx of arrLastRow){
                if (firstEx.row === lastEx.row){
                    if (this.straightLine(lastEx,firstEx)){
                        this.pushPath(first);
                        this.pushPath(firstEx);
                        this.pushPath(lastEx);
                        this.pushPath(last);
                        return true;
                    }
                }
            }
        }
        //俩个精灵进行col扩展，判断是否有可直连的点
        var arrFirstCol = [];
        var arrLastCol = [];
        this.expandCol(first,arrFirstCol);
        this.expandCol(last,arrLastCol);
        for (let firstEx of arrFirstCol){
            for (let lastEx of arrLastCol){
                if (firstEx.col === lastEx.col){
                    if (this.straightLine(lastEx,firstEx)){
                        this.pushPath(first);
                        this.pushPath(firstEx);
                        this.pushPath(lastEx);
                        this.pushPath(last);
                        return true;
                    }
                }
            }
        }
        return false;
    },
    straightLine(first,last){
        //查询row相同时，俩个精灵col直线中有没有其他精灵
        if (first.row === last.row){
            let col1 = Math.min(first.col,last.col);
            let col2 = Math.max(first.col,last.col);
            var flag = true;
            for (let col = col1 + 1;col < col2; col++){
                if (this.arrMap[first.row][col].type !== null){
                    flag = false;
                    this.arrPath = [];
                    break;
                }
            }
        }
        if (flag){
            return true;
        }
        //查询col相同时，俩个精灵row直线中有没有其他精灵
        if (first.col === last.col){
            var row1 = Math.min(first.row,last.row);
            var row2 = Math.max(first.row,last.row);
            flag = true;
            for (let row = row1 + 1;row < row2; row++){
                if (this.arrMap[row][first.col].type !== null){
                    flag = false;
                    this.arrPath = [];
                    break;
                }
            }
        }
        if (flag){
            return true;
        }
        return false;
    },
    expandRow(sprite,array){
        //row扩展到边界，如果都是空的就将扩展的点放入数组，知道触碰到边界或其他方块
        for(let row = sprite.row + 1; row < 8; row++){
            if (this.arrMap[row][sprite.col].type !== null){
                break
            }
            let data = {
                row: row,
                col: sprite.col
            }
            array.push(data);
        }
        for(let row = sprite.row - 1; row >= 0; row--){
            if (this.arrMap[row][sprite.col].type !== null){
                break
            }
            let data = {
                row: row,
                col: sprite.col
            }
            array.push(data);
        }
    },
    expandCol(sprite,array){
        //row扩展到边界，如果都是空的就将扩展的点放入数组，直到触碰到边界或其他方块
        for(let col = sprite.col + 1; col < 9; col++){
            if (this.arrMap[sprite.row][col].type !== null){
                break
            }
            let data = {
                row: sprite.row,
                col: col
            }
            array.push(data);
        }
        for(let col = sprite.col - 1; col >= 0; col--){
            if (this.arrMap[sprite.row][col].type !== null){
                break
            }
            let data = {
                row: sprite.row,
                col: col
            }
            array.push(data);
        }

    },
    sendEliminateBlock(first,last,arrPath){
        //cc.log(arrPath);
        var id = Game.PlayerManager.self.playerId
        if (Game.GameManager.gameState !== GameState.Over) {
            mvs.engine.sendFrameEvent(JSON.stringify({
                action: GLB.DELETE_BLOCK,
                firstPos: {row:first.row, col:first.col},
                lastPos: {row:last.row, col:last.col},
                playerId: id,
                arrPath: arrPath
            }));
        }

        this.curSelec = null;
    },
    pushPath(obj){
        let data = {
            row: obj.row,
            col: obj.col
        }
        this.arrPath.push(data);
    },
    curBlocBeDelete(obj){
        if (this.curSelec === null){
            return;
        }
        if (obj.row === this.curSelec.row && obj.col === this.curSelec.col){
            this.curSelec = null;
            this.choiceBox.opacity = 0;
        }
    }


    //start () {},

    // update (dt) {},
});
