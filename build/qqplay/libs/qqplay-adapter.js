BK.Script.loadlib('GameRes://libs/qqPlayCore.js');

var gl;
var window = this;
window.addEventListener = function () {};
window.removeEventListener = function () {};

var navigator = window.navigator = {
    userAgent: 'qqplay ' + GameStatusInfo.platform + ' QQ/' + GameStatusInfo.QQVer,
    appVersion: ''
};

BK.Script.loadlib('GameRes://libs/xmldom/dom-parser.js');

// import element node
BK.Script.loadlib('GameRes://libs/element/utils.js');
BK.Script.loadlib('GameRes://libs/element/base.js');
BK.Script.loadlib('GameRes://libs/element/audio.js');
BK.Script.loadlib('GameRes://libs/element/image.js');
BK.Script.loadlib('GameRes://libs/element/document.js');
BK.Script.loadlib('GameRes://libs/element/canvas.js');
BK.Script.loadlib('GameRes://libs/element/other.js');
BK.Script.loadlib('GameRes://libs/element/XMLHttpRequest.js');

window['XMLHttpRequest'] = XMLHttpRequest;

HTMLElement = _HTMLBaseElemenet;
Image = window.Image = HTMLImageElement;
document = window.document = new HTMLDocumentElement();

var canvas = new HTMLMainCanvasElement();
canvas.id = 'GameCanvas';
document.body.appendChild(canvas);

var location = window.location = {
    href: "",
};
var console = window.console = {
    log: function (msg) {
        BK.Script.log(1, 0, msg);
    },
    warn: function (msg) {
        BK.Script.log(1, 0, msg);
    },
    error: function (msg) {
        BK.Script.log(1, 0, msg);
    },
    info: function(msg) {
        BK.Script.log(1, 0, msg);
    },
    debug: function(msg) {
        BK.Script.log(1, 0, msg);
    },
};

window["BK"] = BK;
window["isQQPlay"] = true;
alert = window.alert = console.warn;
window["pageXOffset"] = 0;
window["pageYOffset"] = 0;

var WebGLRenderingContext = function () {};

// 用于在加载引擎后对一些代码适配
function initAdapter () {

  var sps = BK.Director.screenPixelSize;
  window.innerWidth = sps.width;
  window.innerHeight = sps.height;

  canvas.width = sps.width;
  canvas.height = sps.height;


  // adapter RendererWebGL
  cc.rendererWebGL.__webGLRendering = cc.rendererWebGL.rendering;
  cc.rendererWebGL.rendering = function (ctx, cmds) {
      this.__webGLRendering(ctx, cmds);
      gl.glCommit();
  };

  // adapt _runMainLoop
  cc.game._setAnimFrame = function () {
      this._lastTime = new Date();
      var frameRate = this.config[this.CONFIG_KEY.frameRate];
      this._frameTime = 1000 / frameRate;
      window.requestAnimFrame = window.requestAnimationFrame;
      window.cancelAnimFrame = window.cancelAnimationFrame;
  };
  cc.game._runMainLoop = function () {
      var self = this, callback, config = self.config, CONFIG_KEY = self.CONFIG_KEY,
          director = cc.director,
          frameRate = config[CONFIG_KEY.frameRate];

      director.setDisplayStats(config[CONFIG_KEY.showFPS]);

      callback = function () {
          if (!self._paused) {
              self._intervalId = window.requestAnimFrame(callback);
              director.mainLoop();
          }
      };

      self._intervalId = window.requestAnimFrame(callback);
      self._paused = false;
  };
}

Float32Array.prototype.subarray = function (begin, end) {
    return new Float32Array(this.buffer, begin, end)
};

Uint16Array.prototype.subarray = function (begin, end) {
    return new Uint16Array(this.buffer, begin, end)
};

//--BK.Canvas------------------------------------------------

var prototype = BK.Canvas.prototype;
prototype.createImageData = function () {
    return {
        data: [],
        width: 0,
        height: 0
    };
};
prototype.putImageData = function () {};
prototype.addEventListener = function () {};
prototype.createLinearGradient = function () {};
prototype.setTransform = prototype.transforms;
var _fillText = prototype.strokeText = prototype.fillText;
prototype.fillText = function () {
    this.lineWidth = 0;
    _fillText.apply(this, arguments);
};
prototype.getImageData = function(){
    return {data : [1, 0, 1, 0]};
};
prototype.focus = function(){};
prototype.getContext = function () {
    return this;
};
Object.defineProperty(prototype, "width", {
    get: function () {
        return this.contentSize.width;
    },
    set: function (val) {
        var size = this.contentSize;
        size.width = val;
        this.contentSize = size;
        this.font = "";
        this.strokeColor = {r:0,g:0,b:0,a:0};
        this.strokewidth = 0;
    },
    enumerable: true,
    configurable: true
});
Object.defineProperty(prototype, "height", {
    get: function () {
        return this.contentSize.height;
    },
    set: function (val) {
        var size = this.contentSize;
        size.height = val;
        this.contentSize = size;
        this.font = "";
        this.strokeColor = {r:0,g:0,b:0,a:0};
        this.strokewidth = 0;
    },
    enumerable: true,
    configurable: true
});

var BOLD_REGEX = /bold/g;
Object.defineProperty(prototype, "font", {
    get: function () {
        return this._font || '';
    },
    set: function (val) {
        this._font = val;
        if (val) {
            var matchRet = val.match(/(\d*)px/);
            var size = (matchRet && !isNaN(matchRet[1])) ? parseInt(matchRet[1]) : 20;
            //console.log("size" + size)
            this.setTextSize(size);
            var isBold = BOLD_REGEX.test(val);
            this.setTextBold(isBold);
        }
    },
    enumerable: true,
    configurable: true
});

var tempColor = { r: 0, g: 0, b: 0, a: 1.0};
function rgbToColor (rgbStr) {
    if (/^\#/.test(rgbStr)) {
        if (rgbStr.length === 4) {
            return {
                r: parseInt(rgbStr[1] + rgbStr[1], 16) / 255,
                g: parseInt(rgbStr[2] + rgbStr[2], 16) / 255,
                b: parseInt(rgbStr[3] + rgbStr[3], 16) / 255,
                a: parseInt(rgbStr[4] + rgbStr[4], 16),
            }
        } else if (rgbStr.length === 7) {
            return {
                r: parseInt(rgbStr.substr(1, 2), 16) / 255,
                g: parseInt(rgbStr.substr(3, 2), 16) / 255,
                b: parseInt(rgbStr.substr(5, 2), 16) / 255,
                a: parseInt(rgbStr.substr(7, 2), 16),
            };
        } else {
            return {r: 0, g: 0, b: 0, a: 1};
        }
    }

    var strArr = rgbStr.match(/(\d|\.)+/g);
    if (!strArr || strArr.length > 4 || strArr.length < 3) {
        return {r: 0, g: 0, b: 0, a: 1};
    }
    tempColor.r = strArr[0] / 255 || 0;
    tempColor.g = strArr[1] / 255 || 0;
    tempColor.b = strArr[2] / 255 || 0;
    tempColor.a = strArr[3] || 1;
    return tempColor;
}

Object.defineProperty(prototype, "fillStyle", {
    get: function () {
        return this._fillStyle || '';
    },
    set: function (val) {
        this._fillStyle = val;
        this.fillColor = rgbToColor(val);
    },
    enumerable: true,
    configurable: true
});

Object.defineProperty(prototype, "strokeStyle", {
    get: function () {
        return this._strokeStyle || '';
    },
    set: function (val) {
        this._strokeStyle = val;
        this.strokeColor = rgbToColor(val);
    },
    enumerable: true,
    configurable: true
});

// requestAnimationFrame requestAnimationFrame

var _mainTicker;
var requestAnimationFrame = window.requestAnimationFrame = function (callback) {
    if (!_mainTicker) {
        _mainTicker = new BK.Ticker();
        var frameRate = cc.game.config[cc.game.CONFIG_KEY.frameRate];
        _mainTicker.interval = 60 / frameRate;
        _mainTicker.setTickerCallBack(function (ts, duration) {
            if (!cc.game._paused) {
                BK.inputManager && BK.inputManager.detectGesture();
                callback();
            }
        });
    }
    return 1;
};

var cancelAnimationFrame = window.cancelAnimationFrame = function () {
    if (_mainTicker) {
        _mainTicker.dispose();
        _mainTicker = null;
    }
};

// setTimeout, clearTimeout

var _windowTimeIntervalId = 0;
var _windowTimeFunHash = {};
var WindowTimeFun = function (code) {
    this._intervalId = _windowTimeIntervalId++;
    this._ticker = new BK.Ticker();
    this._ticker.interval = 1;
    this._code = code;
};

WindowTimeFun.prototype.fun = function () {
    if (!this._code) return;
    var code = this._code;

    if (typeof code === 'string') {
        Function(code)();
    }
    else if (typeof code === 'function') {
        code.apply(null, this._args);
    }
};

var setTimeout = window.setTimeout = function (code, delay) {
    var target = new WindowTimeFun(code);
    if (arguments.length > 2)
        target._args = Array.prototype.slice.call(arguments, 2);
    var original = target.fun;
    target.fun = function () {
        clearTimeout(this.target._intervalId);
        original.apply(this.target, arguments);
    };
    if (!delay) {
        delay = 0.001;
    }
    target._ticker.setTimeout(function(){
        try{
            target.fun.apply(this, arguments);
        }catch(e){
            debugger;
            console.error(e);
        }
    }, delay, target);
    _windowTimeFunHash[target._intervalId] = target;
    return target._intervalId;
};

var setInterval = window.setInterval = function(code, delay){
    var target = new WindowTimeFun(code);
    if (arguments.length > 2)
        target._args = Array.prototype.slice.call(arguments, 2);
    var original = target.fun;
    target.fun = function () {
        original.apply(this.target, arguments);
    };
    if (!delay) {
        delay = 0.001;
    }
    target._ticker.setInterval(target.fun, delay, target);
    _windowTimeFunHash[target._intervalId] = target;
    return target._intervalId;
};

var clearTimeout = window.clearTimeout = function (intervalId) {
    var target = _windowTimeFunHash[intervalId];
    if (target) {
        target._ticker.removeTimeout(target);
        target._ticker.dispose();
        delete _windowTimeFunHash[intervalId];
    }
};

var clearInterval = window.clearInterval = function (intervalId) {
    var target = _windowTimeFunHash[intervalId];
    if (target) {
        target._ticker.removeInterval(target);
        target._ticker.dispose();
        delete _windowTimeFunHash[intervalId];
    }
};

// WebSocket
var WebSocket = window.WebSocket = BK.WebSocket;

WebSocket.CONNECTING = 0;
WebSocket.OPEN = 1;
WebSocket.CLOSING = 2;
WebSocket.CLOSED = 3;

// adaptation readyState
// https://developer.mozilla.org/en-US/docs/Web/API/WebSocket#Ready_state_constants
Object.defineProperty(WebSocket.prototype, "readyState", {
    get: function () {
        var readyState = this.getReadyState();
        //console.log("defineProperty readyState" + readyState)
        if (readyState === 4 /* ESTABLISHED */)
            return WebSocket.OPEN;
        if (readyState === 2 /* HANDSHAKE_REQ */ || readyState === 3 /* HANDSHAKE_RESP */)
            return WebSocket.CONNECTING;
        if (readyState === 1 /* CLOSING */)
            return WebSocket.CLOSING;
        if (readyState === 0 /* CLOSED */)
            return WebSocket.CLOSED;
        return -1;
    }
});

// Local Storage

(function _adaptLocalStorage () {
    var LocalStoragePath = 'GameSandBox://cc_local_storage.json';
    window.localStorage = {//cc.sys.localStorage
        _readData: function () {
            if (!BK.FileUtil.isFileExist(LocalStoragePath)) {
                return {};
            }
            try {
                var buff = BK.FileUtil.readFile(LocalStoragePath);
                return JSON.parse(buff.readAsString());
            }
            catch (e){
                debugger;
                return {};
            }
        },
        _saveData: function (data) {
            if (!data) return;
            try {
                BK.FileUtil.writeFile(LocalStoragePath, JSON.stringify(data));
            }
            catch (e){
                debugger;
                console.log('save data failed: '+  data);
            }
        },
        getItem: function (key) {
            var data = this._readData();
            return data[key] || null;
        },
        setItem: function (key, content) {
            var data = this._readData();
            data[key] = content;
            this._saveData(data);
        },
        removeItem: function (key) {
            var data = this._readData();
            delete data[key];
            this._saveData(data);
        },
        clear: function () {
            this._saveData({});
        }
    };
})();

// other adapter
var performance = { now: function() { return BK.Time.timestamp * 1000; } };

