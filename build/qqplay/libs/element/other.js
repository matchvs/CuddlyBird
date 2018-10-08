
function HTMLVideoElement () {
    _HTMLBaseElemenet.call(this);
    this.currentTime = -1;
    this.duration = -1;
}

(function (prop) {
    prop.play = function () {};
    prop.pause = function () {};
    prop.stop = function () {};

    prop.canPlayType = function () {
        return false;
    };
})(HTMLVideoElement.prototype = new _HTMLBaseElemenet);

function HTMLScriptElement () {
    _HTMLBaseElemenet.call(this);
    this._src = '';
    this._mounted = false;

    this.addEventListener('mount', function () {
        this._mounted = true;
        if (!this._src) {
            return;
        }
        require(this.src);
        setTimeout(function () {
            this.emit('load');
        }.bind(this), 1);
    }.bind(this));
}

(function (prop) {
    prop.constructor = HTMLImageElement;

    Object.defineProperty(prop, 'src', {
        set: function (src) {
            this._src = src;
            if (this._mounted) {
                this.emit('mount');
            }
        },
        get: function () {
            return this._src;
        },
    });

})(HTMLScriptElement.prototype = new _HTMLBaseElemenet);
