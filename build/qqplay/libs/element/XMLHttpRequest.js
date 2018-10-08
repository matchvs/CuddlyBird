
function _triggerEvent (type) {
    if (typeof this['on' + type] === 'function') {
        this['on' + type].apply(this, arguments)
    }
}

function _changeReadyState (readyState) {
    this.readyState = readyState;
    _triggerEvent.call(this, 'readystatechange');
}

function _onError (status) {
    this.responseText = '';
    this.response = null;
    console.log("Failed to XMLHttpRequest send: The status is " + status);
    _triggerEvent.call(this, 'error', 'Failed to XMLHttpRequest send: The status is ' + status);
    _triggerEvent.call(this, 'loadend');
}

function _onSuccess (buffer) {
    var _response = null, _responseText = '';
    if (this.responseType === 'arraybuffer') {
        _response = BK.Misc.BKBufferToArrayBuffer(buffer);

        var bytes = new Uint8Array(_response);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            _responseText += String.fromCharCode(bytes[i]);
        }
    }
    else {
        _responseText = buffer.readAsString(true);
        _response = _responseText;
    }
    this.responseText = _responseText;
    this.response = _response;
    _changeReadyState.call(this, XMLHttpRequest.DONE);
    _triggerEvent.call(this, 'load');
    _triggerEvent.call(this, 'loadend');
}

function XMLHttpRequest () {
    this.method = null;
    this.url = null;
    this.header = {};
    this.onabort = null;// todo 不支持
    this.onerror = null;
    this.onload = null;
    this.onloadstart = null;
    this.onprogress = null;// todo 不支持
    this.ontimeout = null;// todo 暂不支持
    this.onloadend = null;
    this.onreadystatechange = null;
    this.readyState = 0;
    this.response = null;
    this.responseText = null;
    this.responseType = '';
    this.responseXML = null;// todo 不支持
    this.status = XMLHttpRequest.DONE;
    this.statusText = '';
    this.upload = {};// todo 不支持
    this.withCredentials = false;// todo 不支持
    this.timeout = 0;
}

XMLHttpRequest.UNSEND = 0;
XMLHttpRequest.OPENED = 1;
XMLHttpRequest.HEADERS_RECEIVED = 2;
XMLHttpRequest.LOADING = 3;
XMLHttpRequest.DONE = 4;

(function (prop) {

    prop.open = function (method, url/* async, user, password 这几个参数在玩一玩内不支持*/) {
        this.method = method;
        this.url = url;
        this.header = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        _changeReadyState.call(this, XMLHttpRequest.OPENED);
    };

    prop.getAllResponseHeaders = function () {
        var responseHeader = this.header;
        return Object.keys(responseHeader).map(function (header) {
            return header + ': ' + responseHeader[header];
        }).join('\n');
    };

    prop.getResponseHeader = function (type) {
        return this.header[type];
    };

    prop.setRequestHeader = function (type, value) {
        this.header[type] = value;
    };

    prop.send = function () {
        var _this = this;
        if (_this.readyState !== XMLHttpRequest.OPENED) {
            throw new Error("Failed to execute 'send' on 'XMLHttpRequest': The object's state must be OPENED.");
        }
        else {
            var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

            _triggerEvent.call(_this, 'loadstart');
            _changeReadyState.call(_this, XMLHttpRequest.HEADERS_RECEIVED);
            _changeReadyState.call(_this, XMLHttpRequest.LOADING);

            if (_this.url.indexOf('http') >= 0) {
                var httpReq = new BK.HttpUtil(_this.url);
                if (_this.method.toLowerCase() === 'post') {
                    httpReq.setHttpMethod('post');
                    httpReq.setHttpPostData(data);
                    httpReq.setBodyCompatible(false);
                }
                else {
                    httpReq.setHttpMethod('get');
                }
                for(var key in this.header){
                    if(key === "Referer"){
                        httpReq.setHttpReferer && httpReq.setHttpReferer(this.header["Referer"]);
                    }else if(key === "Cookie"){
                        httpReq.setHttpCookie && httpReq.setHttpCookie(this.header["Cookie"]);
                    }
                    httpReq.setHttpHeader(key, this.header[key]);
                }

                httpReq.requestAsync(function (buffer, status) {
                    _this.status = status;
                    // if (status >= 400 && status <= 417 || status >= 500 && status <= 505) {
                    if (status !== 200) {
                        _onError.call(_this, status);
                    }
                    else {
                        _onSuccess.call(_this, buffer);
                    }
                });
            }
            else {
                try {
                    var buff = BK.FileUtil.readFile(_this.url);
                    _this.status = 200;
                    _onSuccess.call(_this, buff);
                }
                catch (e) {
                    _this.status = 404;
                    _onError.call(_this, 'Read file ' + _this.url + ' Failed');
                }

            }
        }
    }

})(XMLHttpRequest.prototype);
