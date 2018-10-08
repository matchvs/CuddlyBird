/****************************************************************************
 Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
 worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
 not use Cocos Creator software for developing other software or tools that's
 used for developing games. You are not granted to publish, distribute,
 sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

function HTMLDocumentElement () {
    _HTMLBaseElemenet.call(this);

    this.html = new _HTMLBaseElemenet();
    this.head = new _HTMLBaseElemenet();
    this.body = new _HTMLBaseElemenet();

    this.html.tagName = 'HTML';

    this.children = [
        this.html,
        this.head,
        this.body,
    ];
}

(function (prop) {
    prop.constructor = HTMLDocumentElement;

    prop.createElement = function (tag) {
        tag = tag.toLowerCase();
        if (tag === 'canvas') {
            var canvas = new BK.Canvas(1, 1);
            canvas.strokewidth = 0;
            canvas.strokeColor ={r:0,g:0,b:0,a:0};
            canvas.useH5Mode();
            return canvas;
        }
        
        if (tag === 'audio') {
            return new HTMLAudioElement();
        }

        if (tag === 'video') {
            return new HTMLVideoElement();
        }

        if (tag === 'script') {
            return new HTMLScriptElement();
        }

        return new _HTMLBaseElemenet();
    };

    prop.getElementsByName = function () {
        return new _HTMLBaseElemenet();
    };

    Object.defineProperty(prop, 'ontouchstart', {
        get: function () {
            return true;
        },
    });

    Object.defineProperty(prop, 'documentElement', {
        get: function () {
            var sps = BK.Director.screenPixelSize;
            return {
                clientLeft: 0,
                clientTop: 0,
                clientWidth: sps.width,
                clientHeight: sps.height,
            };
        },
    });

})(HTMLDocumentElement.prototype = new _HTMLBaseElemenet);