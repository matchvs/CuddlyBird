// 工具类
BK.Script.loadlib('GameRes://libs/element/sha1.min.js');
BK.Script.loadlib('GameRes://libs/element/base64js.min.js');
BK.Script.loadlib('GameRes://libs/element/text-encoder-lite.min.js');

var qpAdapter = {};

qpAdapter.generateTempFileName = function(src){
    var tempName;
    tempName = window["sha1"](src);
    return tempName;
};

qpAdapter.saveFile = function(saveFile, buffer) {
    var folderPath = saveFile.replace(/[^\/\\]+$/, "");
    if (!BK.FileUtil.isFileExist(folderPath)) {
        BK.FileUtil.makeDir(folderPath);
    }
    BK.FileUtil.writeBufferToFile(saveFile, buffer);
};

qpAdapter.downloadFile = function(src, saveFile, callback){
    var httpReq = new BK.HttpUtil(src);
    httpReq.setHttpMethod('get');
    httpReq.requestAsync(function (buffer, status) {
        // if (status >= 400 && status <= 417 || status >= 500 && status <= 505) {
        if (status !== 200) {
            callback && callback(status);
        }
        else {
            saveFile && qpAdapter.saveFile(saveFile, buffer);
            callback && callback(0, buffer);
        }
    });
};

qpAdapter.isFileAvailable = function(fileName) {
    var buffer = BK.FileUtil.readFile(fileName);
    return buffer && buffer.length > 0;
};

//--------base64 ----------------------------------------------
function Base64Encode(str) {
    var encoding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'utf-8';
    var bytes = new TextEncoderLite(encoding).encode(str);
    return base64js.fromByteArray(bytes);
}

function Base64Decode(str) {
    var encoding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'utf-8';
    var bytes = base64js.toByteArray(str);
    return new TextDecoderLite(encoding).decode(bytes);
}
//--------base64 ----------------------------------------------
