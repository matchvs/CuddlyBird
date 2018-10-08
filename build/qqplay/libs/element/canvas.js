var gl = window.gl = null;

function HTMLMainCanvasElement () {
    _HTMLBaseElemenet.call(this);
    this.tagName = 'CANVAS';
    if (gl) {
        return;
    }
    gl = bkWebGLGetInstance();
    gl.getImageData = gl.getExtension = gl.getSupportedExtensions = function () {
        return [];
    };
    var _gl_texImage2D = gl.texImage2D;
    gl.texImage2D = function() {
        // generate and dispose BKImage
        if (6 === arguments.length && arguments[5] instanceof Image) {
            // create temp arguments
            var tempArguments = [];
            for (var i = 0; i < arguments.length; ++i) {
                tempArguments.push(arguments[i]);
            }
            // generate bkimage
            var image = tempArguments[5];
            if (!image.bkImage) {
                image._generateBKImage();
            }
            tempArguments[5] = image.bkImage;
            // apply textImage2D
            _gl_texImage2D.apply(this, tempArguments);
            // dispose bkImage
            image._disposeBKImage();
        }
        else {
            _gl_texImage2D.apply(this, arguments);
        }
    };

    var isSupportTA = undefined;
    function __bkIsSupportTypedArray() {
        // Just need to judge once
        if (isSupportTA !== undefined) {
            return isSupportTA;
        }

        if (GameStatusInfo.platform === 'android') {
            isSupportTA = true;
        }
        var info = BK.Director.queryDeviceInfo();
        var vers = info.version.split('.');
        if ((info.platform === 'ios' && Number(vers[0]) >= 10) || info.platform === 'android') {
            isSupportTA = true;
        } else {
            BK.Script.log(1, 0, 'Current Device dont supoort TypedArray.[info = ' + JSON.stringify(info) + ']');
            isSupportTA = false;
        }
        return isSupportTA;
    }

    // FIX IOS 10 蓝屏的 bug
    gl.bufferDataOldIOS = function (target, data, dataUI32, usage) {
        if (Object.prototype.hasOwnProperty.call(data, '__rawBKData')) {
            return data.__rawBKData;
        } else if (Object.prototype.hasOwnProperty.call(data, '__nativeObj')) {
            return data.__nativeObj;
        }

        var buf;
        if (!__bkIsSupportTypedArray()) {
            buf = new BK.Buffer(data.byteLength, false);
            for (var i = 0; i < data.length; i += 6) {
                buf.writeFloatBuffer(data[i]);
                buf.writeFloatBuffer(data[i + 1]);
                buf.writeFloatBuffer(data[i + 2]);
                buf.writeUint32Buffer(dataUI32[i + 3]);
                buf.writeFloatBuffer(data[i + 4]);
                buf.writeFloatBuffer(data[i + 5]);
            }
        }
        else {
            buf = data;
        }
        gl.glBufferData(target, buf, usage);
    }
}

(function (prop) {
    prop.constructor = HTMLMainCanvasElement;

    prop.getContext = function () {
        return gl;
    };
})(HTMLMainCanvasElement.prototype = new _HTMLBaseElemenet);
