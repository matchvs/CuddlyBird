
var ImageCachePath = 'GameSandBox://ImageCache7dwe/';

function HTMLImageElement () {
    _HTMLBaseElemenet.call(this);

    this._src = '';
    this.width = 0;
    this.height = 0;
    this.onload = null;
    this.onerror = null;

    this.addEventListener('load', function () {
        this.onload && this.onload();
        if(!this.bkImage) {
            return;
        }
        this.width = this.bkImage.width;
        this.height = this.bkImage.height;
    }.bind(this));

    this.addEventListener('error', function () {
        this.onerror && this.onerror();
    }.bind(this));
}

(function (prop) {
    prop.constructor = HTMLImageElement;

    prop._loadedImage = function (val) {
        this._src = val;
        var bkImage = BK.Image.loadImage(val);
        if (bkImage) {
            this.width = bkImage.width;
            this.height = bkImage.height;
        }
        this.bkImage = bkImage;
        this.emit('load');
    };

    prop._generateBKImage = function () {
        if (!this._src) {
            console.warn('The image src value is empty. please check it');
            return;
        }

        if (this.bkImage) {
            return;
        }

        this.bkImage = BK.Image.loadImage(this._src);
        if (this.bkImage) {
            this.width = this.bkImage.width;
            this.height = this.bkImage.height;
        }
    };

    prop._disposeBKImage = function () {
        this.bkImage && this.bkImage.dispose();
        this.bkImage = null;
    };

    Object.defineProperty(prop, 'src', {
        get: function () {
            return this._src;
        },

        set: function (val) {
            if (!val) {
                this._src = val;
                this.width = this.height = 0;
                this.bkImage = null;
                this.emit('load');
                return;
            }

            var filePath = '', isFileValid = '';
            if (/^http/.test(val)) {
                this._localFileName = qpAdapter.generateTempFileName(val);
                filePath = ImageCachePath + this._localFileName;
                isFileValid = qpAdapter.isFileAvailable(filePath);
                if (!isFileValid) {
                    qpAdapter.downloadFile(val, filePath, function (ret, buffer) {
                        if (ret) {
                            this.emit('error', ret);
                        }
                        else {
                            this._loadedImage(filePath);
                        }
                    }.bind(this));
                }
                else {
                    this._loadedImage(filePath);
                }
            }
            else if (/^data:image/.test(val)) {
                // decodeBase64 arraybuffer -> fs io -> BK.image.load
                this._localFileName = window["sha1"](this._src);
                filePath = ImageCachePath + this._localFileName;
                isFileValid = qpAdapter.isFileAvailable(filePath);
                if (!isFileValid) {
                    var base64str = val.replace(/data:image.+;base64,/, "");
                    var bytes = base64js.toByteArray(base64str);
                    var buffer = new BK.Buffer(bytes.length);
                    for (var i = 0; i < bytes.length; i++) {
                        buffer.writeUint8Buffer(bytes[i]);
                    }
                    qpAdapter.saveFile(filePath, buffer);
                }
                this._loadedImage(filePath);
            }
            else {
                this._loadedImage(val);
            }
        },
    });

})(HTMLImageElement.prototype = new _HTMLBaseElemenet);
