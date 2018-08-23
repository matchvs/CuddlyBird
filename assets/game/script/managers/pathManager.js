var mvs = require("Matchvs");
cc.Class({
    extends: cc.Component,

    properties: {
        blueHead:{
            type: cc.Prefab,
            default: null
        },
        blueCorner:{
            type: cc.Prefab,
            default: null
        },
        blueStraight:{
            type: cc.Prefab,
            default: null
        },
        redHead:{
            type: cc.Prefab,
            default: null
        },
        redCorner:{
            type: cc.Prefab,
            default: null
        },
        redStraight:{
            type: cc.Prefab,
            default: null
        },
    },
    onLoad () {
        Game.PathManager = this;
        this.arrMap = [];
    },
    addPath(arrPath,id){
        this.arrMap = Game.BlockManager.arrMap;
        if (this.arrMap.length <= 0){
            return;
        }
        for(let path =0; path < arrPath.length; path++){
            if (path === 0){
                let angle = this.twoNodeRotation(arrPath[path],arrPath[path+1]);
                let pos1 = this.arrMap[arrPath[path].row][arrPath[path].col].pos;
                let pos2 = this.arrMap[arrPath[path+1].row][arrPath[path+1].col].pos;
                this.setHead(id,angle,pos1);
                let data = this.straightPosAndLong(pos1,pos2);
                this.setStraight(id,angle,data.pos,data.long);

            }else if(path === arrPath.length - 1){
                 let angle = this.twoNodeRotation(arrPath[path],arrPath[path-1]);
                let pos = this.arrMap[arrPath[path].row][arrPath[path].col].pos;
                this.setHead(id,angle,pos);
            }else{
                let angleCorner = this.threeNodeRotation(arrPath[path-1],arrPath[path],arrPath[path+1]);
                let pos1 = this.arrMap[arrPath[path].row][arrPath[path].col].pos;
                let pos2 = this.arrMap[arrPath[path+1].row][arrPath[path+1].col].pos;
                this.setCorner(id,angleCorner,pos1);
                let data = this.straightPosAndLong(pos1,pos2);
                let angle  = this.twoNodeRotation(arrPath[path],arrPath[path+1]);
                this.setStraight(id,angle,data.pos,data.long);
            }

        }
    },
    twoNodeRotation(path1,path2){
        let angle = 0;
        if (path1.row !== path2.row){
            angle = path1.row > path2.row ? 180 : 0;
        }
        else if(path1.col !== path2.col){
            angle = path1.col > path2.col ? 90 : 270;
        }
        return angle;
    },
    threeNodeRotation(path1,path2,path3){
        let angle = 0;
        if (path1.row !== path2.row){
            if (path1.row > path2.row){
                angle = path2.col > path3.col ? 0 : 270;
            }
            else if(path1.row < path2.row){
                angle = path2.col > path3.col ? 90 : 180;
            }
        }else{
            if (path1.col > path2.col){
                angle = path2.row > path3.row ? 180 : 270;
            }
            else if(path1.col < path2.col){
                angle = path2.row > path3.row ? 90 : 0;
            }
        }
        return angle;
    },
    setHead(id,angle,pos){
        var head = null;
        if (id === Game.PlayerManager.self.playerId){
            head = cc.instantiate(this.blueHead);
        } else{
            head = cc.instantiate(this.redHead);
        }
        head.parent = this.node;
        head.rotation = angle;
        head.setPosition(pos);
        head.getComponent("path").initDelete(0.4);
        Game.EffectManager.initEffect(pos);
    },
    setCorner(id,angle,pos){
        var corner = null;
        if (id === Game.PlayerManager.self.playerId){
            corner = cc.instantiate(this.blueCorner);
        } else{
            corner = cc.instantiate(this.redCorner);
        }
        corner.parent = this.node;
        corner.rotation = angle;
        corner.setPosition(pos);
        corner.getComponent("path").initDelete(0.4);
    },
    setStraight(id,angle,pos,long){
        var straight = null;
        if (id === Game.PlayerManager.self.playerId){
            straight = cc.instantiate(this.blueStraight);
        } else{
            straight = cc.instantiate(this.redStraight);
        }
        straight.parent = this.node;0
        straight.rotation = angle;
        straight.setPosition(pos);
        straight.height = long;
        straight.getChildByName("electric").width = long * 2 + 50;
        straight.getComponent("path").initDelete(0.4);
    },
    straightPosAndLong(pos1,pos2){
        var long = 0;
        var pos = cc.p();
        if (pos1.x === pos2.x){
            if (pos1.y > pos2.y){
                pos = cc.p(pos1.x, pos1.y - 20);
                long = pos1.y - pos2.y - 20;
            }else{
                pos = cc.p(pos1.x, pos1.y + 20);
                long = pos2.y - pos1.y - 20;
            }
        } else if (pos1.y === pos2.y){
            if (pos1.x > pos2.x){
                pos = cc.p(pos1.x - 20, pos1.y);
                long = pos1.x - pos2.x - 20;
            }else{
                pos = cc.p(pos1.x + 20, pos1.y);
                long = pos2.x - pos1.x - 20;
            }
        }
        let data = {
            pos: pos,
            long: long
        }
        return data;
    }

    // update (dt) {},
});
