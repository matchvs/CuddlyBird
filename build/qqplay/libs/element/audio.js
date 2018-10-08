
var AudioCachePath = 'GameSandBox://AudioCache7dwe/';

function HTMLAudioElement () {
    _HTMLBaseElemenet.call(this);

    this._src = '';
    this._audioPath = '';
    this._paused = true;
    this._loaded = false;
    this._currentTime = 0;

    this.addEventListener('load', function () {
        this.onload && this.onload();
        this._loaded = true;
    }.bind(this));
    this.addEventListener('error', function () {
        this.onerror && this.onerror();
    }.bind(this));
}

(function (prop) {

    prop.play = function () {
        this._paused = false;
        if(!this._loaded){
            return;
        }
        var loop = this._loop ? -1 : 1;
        this._handle = new BK.Audio(this._loop ? 0 : 1, this._audioPath, loop);
        this._handle.startMusic(function () {
            this.emit('ended');
        }.bind(this));
        this._currentTime = 0.00001;// todo 这里预先赋值为 0.00001 让 audio 的 resume 有效，后续如果 qqplay 支持了 currentTime 在进行完善
    };

    prop.pause = function () {
        this._paused = true;
        if (!this._handle) {
            return;
        }
        this._handle.pauseMusic();
    };

    prop.resume = function () {
        this._paused = false;
        if (!this._handle) {
            return;
        }
        this._handle.resumeMusic();
    };

    prop.stop = function () {
        this._paused = true;
        if (!this._handle) {
            return;
        }
        this._handle.stopMusic();
    };

    prop.canPlayType = function () {
        return true;
    };

    prop.appendChild = function (element) {
        _HTMLBaseElemenet.prototype.appendChild.call(this, element);

        var first = this.children[0];
        if (first.src !== this.src) {
            this.src = first.src;
        }
    };

    Object.defineProperty(prop, 'paused', {
        get: function () {
            return this._paused;
        },
        set: function (val) {
            this._paused = val;
        },
    });

    Object.defineProperty(prop, 'loop', {
        get: function () {
            // api 限制，无法单独设置音频是否循环播放
            return this._loop;
        },
    
        set:function (bool) {
            this._loop = bool;
        },
    });

    Object.defineProperty(prop, 'volume', {
        get: function () {
            // api 限制，无法进行音量调节
            return this._volume;
        },
        set: function (num) {
            this._volume = num;
        },
    });

    Object.defineProperty(prop, 'currentTime', {
        get: function () {
            // api 限制，无法获取音频当前播放的时间
            return this._currentTime;
        },
        set: function (num) {
            this._currentTime = num;
        },
    });

    Object.defineProperty(prop, 'duration', {
        get: function () {
            return 0;
        },
    });

    Object.defineProperty(prop, 'src', {
        get: function () {
            return this._src;
        },
        set: function (val) {
            if (val === this._src) {
                return;
            }

            if (this._handle) {
                this._handle.stopMusic();
                this._handle = null;
            }

            this._src = val;
            this.emit('canplaythrough');

            // loacl asset
            if (!/^http/.test(val)) {
                this._audioPath = val;
                this.emit('load');
                return;
            }
    
            var localFileName = this._src.replace(/\//g, '-_-');
            this._audioPath = AudioCachePath + localFileName;
            if (BK.FileUtil.isFileExist(this._audioPath)) {
                this.emit('load');
                return;
            }
    
            // GameSandBox://
            var httpReq = new BK.HttpUtil(val);
            httpReq.setHttpMethod('get');
            httpReq.requestAsync(function (buffer, status) {
                this.status = status;
                // if (status >= 400 && status <= 417 || status >= 500 && status <= 505) {
                if (status !== 200) {
                    this.emit('error', status);
                }
                //buffer
                if(BK.FileUtil.isFileExist(AudioCachePath)){
                    BK.FileUtil.makeDir(AudioCachePath);
                }
                var filePath = AudioCachePath + localFileName;
                BK.FileUtil.writeBufferToFile(filePath, buffer);
                this.emit('load');
            }.bind(this));
        },
    });

})(HTMLAudioElement.prototype = new _HTMLBaseElemenet);
