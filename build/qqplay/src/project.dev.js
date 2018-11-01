__require = function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var b = o.split("/");
        b = b[b.length - 1];
        if (!t[b]) {
          var a = "function" == typeof __require && __require;
          if (!u && a) return a(b, !0);
          if (i) return i(b, !0);
          throw new Error("Cannot find module '" + o + "'");
        }
      }
      var f = n[o] = {
        exports: {}
      };
      t[o][0].call(f.exports, function(e) {
        var n = t[o][1][e];
        return s(n || e);
      }, f, f.exports, e, t, n, r);
    }
    return n[o].exports;
  }
  var i = "function" == typeof __require && __require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s;
}({
  1: [ function(require, module, exports) {
    "use strict";
    exports.byteLength = byteLength;
    exports.toByteArray = toByteArray;
    exports.fromByteArray = fromByteArray;
    var lookup = [];
    var revLookup = [];
    var Arr = "undefined" !== typeof Uint8Array ? Uint8Array : Array;
    var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for (var i = 0, len = code.length; i < len; ++i) {
      lookup[i] = code[i];
      revLookup[code.charCodeAt(i)] = i;
    }
    revLookup["-".charCodeAt(0)] = 62;
    revLookup["_".charCodeAt(0)] = 63;
    function getLens(b64) {
      var len = b64.length;
      if (len % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");
      var validLen = b64.indexOf("=");
      -1 === validLen && (validLen = len);
      var placeHoldersLen = validLen === len ? 0 : 4 - validLen % 4;
      return [ validLen, placeHoldersLen ];
    }
    function byteLength(b64) {
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      return 3 * (validLen + placeHoldersLen) / 4 - placeHoldersLen;
    }
    function _byteLength(b64, validLen, placeHoldersLen) {
      return 3 * (validLen + placeHoldersLen) / 4 - placeHoldersLen;
    }
    function toByteArray(b64) {
      var tmp;
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
      var curByte = 0;
      var len = placeHoldersLen > 0 ? validLen - 4 : validLen;
      for (var i = 0; i < len; i += 4) {
        tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
        arr[curByte++] = tmp >> 16 & 255;
        arr[curByte++] = tmp >> 8 & 255;
        arr[curByte++] = 255 & tmp;
      }
      if (2 === placeHoldersLen) {
        tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
        arr[curByte++] = 255 & tmp;
      }
      if (1 === placeHoldersLen) {
        tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
        arr[curByte++] = tmp >> 8 & 255;
        arr[curByte++] = 255 & tmp;
      }
      return arr;
    }
    function tripletToBase64(num) {
      return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[63 & num];
    }
    function encodeChunk(uint8, start, end) {
      var tmp;
      var output = [];
      for (var i = start; i < end; i += 3) {
        tmp = (uint8[i] << 16 & 16711680) + (uint8[i + 1] << 8 & 65280) + (255 & uint8[i + 2]);
        output.push(tripletToBase64(tmp));
      }
      return output.join("");
    }
    function fromByteArray(uint8) {
      var tmp;
      var len = uint8.length;
      var extraBytes = len % 3;
      var parts = [];
      var maxChunkLength = 16383;
      for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
      if (1 === extraBytes) {
        tmp = uint8[len - 1];
        parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "==");
      } else if (2 === extraBytes) {
        tmp = (uint8[len - 2] << 8) + uint8[len - 1];
        parts.push(lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "=");
      }
      return parts.join("");
    }
  }, {} ],
  2: [ function(require, module, exports) {
    (function(global) {
      "use strict";
      var base64 = require("base64-js");
      var ieee754 = require("ieee754");
      var isArray = require("isarray");
      exports.Buffer = Buffer;
      exports.SlowBuffer = SlowBuffer;
      exports.INSPECT_MAX_BYTES = 50;
      Buffer.TYPED_ARRAY_SUPPORT = void 0 !== global.TYPED_ARRAY_SUPPORT ? global.TYPED_ARRAY_SUPPORT : typedArraySupport();
      exports.kMaxLength = kMaxLength();
      function typedArraySupport() {
        try {
          var arr = new Uint8Array(1);
          arr.__proto__ = {
            __proto__: Uint8Array.prototype,
            foo: function() {
              return 42;
            }
          };
          return 42 === arr.foo() && "function" === typeof arr.subarray && 0 === arr.subarray(1, 1).byteLength;
        } catch (e) {
          return false;
        }
      }
      function kMaxLength() {
        return Buffer.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823;
      }
      function createBuffer(that, length) {
        if (kMaxLength() < length) throw new RangeError("Invalid typed array length");
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          that = new Uint8Array(length);
          that.__proto__ = Buffer.prototype;
        } else {
          null === that && (that = new Buffer(length));
          that.length = length;
        }
        return that;
      }
      function Buffer(arg, encodingOrOffset, length) {
        if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) return new Buffer(arg, encodingOrOffset, length);
        if ("number" === typeof arg) {
          if ("string" === typeof encodingOrOffset) throw new Error("If encoding is specified then the first argument must be a string");
          return allocUnsafe(this, arg);
        }
        return from(this, arg, encodingOrOffset, length);
      }
      Buffer.poolSize = 8192;
      Buffer._augment = function(arr) {
        arr.__proto__ = Buffer.prototype;
        return arr;
      };
      function from(that, value, encodingOrOffset, length) {
        if ("number" === typeof value) throw new TypeError('"value" argument must not be a number');
        if ("undefined" !== typeof ArrayBuffer && value instanceof ArrayBuffer) return fromArrayBuffer(that, value, encodingOrOffset, length);
        if ("string" === typeof value) return fromString(that, value, encodingOrOffset);
        return fromObject(that, value);
      }
      Buffer.from = function(value, encodingOrOffset, length) {
        return from(null, value, encodingOrOffset, length);
      };
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        Buffer.prototype.__proto__ = Uint8Array.prototype;
        Buffer.__proto__ = Uint8Array;
        "undefined" !== typeof Symbol && Symbol.species && Buffer[Symbol.species] === Buffer && Object.defineProperty(Buffer, Symbol.species, {
          value: null,
          configurable: true
        });
      }
      function assertSize(size) {
        if ("number" !== typeof size) throw new TypeError('"size" argument must be a number');
        if (size < 0) throw new RangeError('"size" argument must not be negative');
      }
      function alloc(that, size, fill, encoding) {
        assertSize(size);
        if (size <= 0) return createBuffer(that, size);
        if (void 0 !== fill) return "string" === typeof encoding ? createBuffer(that, size).fill(fill, encoding) : createBuffer(that, size).fill(fill);
        return createBuffer(that, size);
      }
      Buffer.alloc = function(size, fill, encoding) {
        return alloc(null, size, fill, encoding);
      };
      function allocUnsafe(that, size) {
        assertSize(size);
        that = createBuffer(that, size < 0 ? 0 : 0 | checked(size));
        if (!Buffer.TYPED_ARRAY_SUPPORT) for (var i = 0; i < size; ++i) that[i] = 0;
        return that;
      }
      Buffer.allocUnsafe = function(size) {
        return allocUnsafe(null, size);
      };
      Buffer.allocUnsafeSlow = function(size) {
        return allocUnsafe(null, size);
      };
      function fromString(that, string, encoding) {
        "string" === typeof encoding && "" !== encoding || (encoding = "utf8");
        if (!Buffer.isEncoding(encoding)) throw new TypeError('"encoding" must be a valid string encoding');
        var length = 0 | byteLength(string, encoding);
        that = createBuffer(that, length);
        var actual = that.write(string, encoding);
        actual !== length && (that = that.slice(0, actual));
        return that;
      }
      function fromArrayLike(that, array) {
        var length = array.length < 0 ? 0 : 0 | checked(array.length);
        that = createBuffer(that, length);
        for (var i = 0; i < length; i += 1) that[i] = 255 & array[i];
        return that;
      }
      function fromArrayBuffer(that, array, byteOffset, length) {
        array.byteLength;
        if (byteOffset < 0 || array.byteLength < byteOffset) throw new RangeError("'offset' is out of bounds");
        if (array.byteLength < byteOffset + (length || 0)) throw new RangeError("'length' is out of bounds");
        array = void 0 === byteOffset && void 0 === length ? new Uint8Array(array) : void 0 === length ? new Uint8Array(array, byteOffset) : new Uint8Array(array, byteOffset, length);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          that = array;
          that.__proto__ = Buffer.prototype;
        } else that = fromArrayLike(that, array);
        return that;
      }
      function fromObject(that, obj) {
        if (Buffer.isBuffer(obj)) {
          var len = 0 | checked(obj.length);
          that = createBuffer(that, len);
          if (0 === that.length) return that;
          obj.copy(that, 0, 0, len);
          return that;
        }
        if (obj) {
          if ("undefined" !== typeof ArrayBuffer && obj.buffer instanceof ArrayBuffer || "length" in obj) {
            if ("number" !== typeof obj.length || isnan(obj.length)) return createBuffer(that, 0);
            return fromArrayLike(that, obj);
          }
          if ("Buffer" === obj.type && isArray(obj.data)) return fromArrayLike(that, obj.data);
        }
        throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.");
      }
      function checked(length) {
        if (length >= kMaxLength()) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + kMaxLength().toString(16) + " bytes");
        return 0 | length;
      }
      function SlowBuffer(length) {
        +length != length && (length = 0);
        return Buffer.alloc(+length);
      }
      Buffer.isBuffer = function isBuffer(b) {
        return !!(null != b && b._isBuffer);
      };
      Buffer.compare = function compare(a, b) {
        if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) throw new TypeError("Arguments must be Buffers");
        if (a === b) return 0;
        var x = a.length;
        var y = b.length;
        for (var i = 0, len = Math.min(x, y); i < len; ++i) if (a[i] !== b[i]) {
          x = a[i];
          y = b[i];
          break;
        }
        if (x < y) return -1;
        if (y < x) return 1;
        return 0;
      };
      Buffer.isEncoding = function isEncoding(encoding) {
        switch (String(encoding).toLowerCase()) {
         case "hex":
         case "utf8":
         case "utf-8":
         case "ascii":
         case "latin1":
         case "binary":
         case "base64":
         case "ucs2":
         case "ucs-2":
         case "utf16le":
         case "utf-16le":
          return true;

         default:
          return false;
        }
      };
      Buffer.concat = function concat(list, length) {
        if (!isArray(list)) throw new TypeError('"list" argument must be an Array of Buffers');
        if (0 === list.length) return Buffer.alloc(0);
        var i;
        if (void 0 === length) {
          length = 0;
          for (i = 0; i < list.length; ++i) length += list[i].length;
        }
        var buffer = Buffer.allocUnsafe(length);
        var pos = 0;
        for (i = 0; i < list.length; ++i) {
          var buf = list[i];
          if (!Buffer.isBuffer(buf)) throw new TypeError('"list" argument must be an Array of Buffers');
          buf.copy(buffer, pos);
          pos += buf.length;
        }
        return buffer;
      };
      function byteLength(string, encoding) {
        if (Buffer.isBuffer(string)) return string.length;
        if ("undefined" !== typeof ArrayBuffer && "function" === typeof ArrayBuffer.isView && (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) return string.byteLength;
        "string" !== typeof string && (string = "" + string);
        var len = string.length;
        if (0 === len) return 0;
        var loweredCase = false;
        for (;;) switch (encoding) {
         case "ascii":
         case "latin1":
         case "binary":
          return len;

         case "utf8":
         case "utf-8":
         case void 0:
          return utf8ToBytes(string).length;

         case "ucs2":
         case "ucs-2":
         case "utf16le":
         case "utf-16le":
          return 2 * len;

         case "hex":
          return len >>> 1;

         case "base64":
          return base64ToBytes(string).length;

         default:
          if (loweredCase) return utf8ToBytes(string).length;
          encoding = ("" + encoding).toLowerCase();
          loweredCase = true;
        }
      }
      Buffer.byteLength = byteLength;
      function slowToString(encoding, start, end) {
        var loweredCase = false;
        (void 0 === start || start < 0) && (start = 0);
        if (start > this.length) return "";
        (void 0 === end || end > this.length) && (end = this.length);
        if (end <= 0) return "";
        end >>>= 0;
        start >>>= 0;
        if (end <= start) return "";
        encoding || (encoding = "utf8");
        while (true) switch (encoding) {
         case "hex":
          return hexSlice(this, start, end);

         case "utf8":
         case "utf-8":
          return utf8Slice(this, start, end);

         case "ascii":
          return asciiSlice(this, start, end);

         case "latin1":
         case "binary":
          return latin1Slice(this, start, end);

         case "base64":
          return base64Slice(this, start, end);

         case "ucs2":
         case "ucs-2":
         case "utf16le":
         case "utf-16le":
          return utf16leSlice(this, start, end);

         default:
          if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
          encoding = (encoding + "").toLowerCase();
          loweredCase = true;
        }
      }
      Buffer.prototype._isBuffer = true;
      function swap(b, n, m) {
        var i = b[n];
        b[n] = b[m];
        b[m] = i;
      }
      Buffer.prototype.swap16 = function swap16() {
        var len = this.length;
        if (len % 2 !== 0) throw new RangeError("Buffer size must be a multiple of 16-bits");
        for (var i = 0; i < len; i += 2) swap(this, i, i + 1);
        return this;
      };
      Buffer.prototype.swap32 = function swap32() {
        var len = this.length;
        if (len % 4 !== 0) throw new RangeError("Buffer size must be a multiple of 32-bits");
        for (var i = 0; i < len; i += 4) {
          swap(this, i, i + 3);
          swap(this, i + 1, i + 2);
        }
        return this;
      };
      Buffer.prototype.swap64 = function swap64() {
        var len = this.length;
        if (len % 8 !== 0) throw new RangeError("Buffer size must be a multiple of 64-bits");
        for (var i = 0; i < len; i += 8) {
          swap(this, i, i + 7);
          swap(this, i + 1, i + 6);
          swap(this, i + 2, i + 5);
          swap(this, i + 3, i + 4);
        }
        return this;
      };
      Buffer.prototype.toString = function toString() {
        var length = 0 | this.length;
        if (0 === length) return "";
        if (0 === arguments.length) return utf8Slice(this, 0, length);
        return slowToString.apply(this, arguments);
      };
      Buffer.prototype.equals = function equals(b) {
        if (!Buffer.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
        if (this === b) return true;
        return 0 === Buffer.compare(this, b);
      };
      Buffer.prototype.inspect = function inspect() {
        var str = "";
        var max = exports.INSPECT_MAX_BYTES;
        if (this.length > 0) {
          str = this.toString("hex", 0, max).match(/.{2}/g).join(" ");
          this.length > max && (str += " ... ");
        }
        return "<Buffer " + str + ">";
      };
      Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
        if (!Buffer.isBuffer(target)) throw new TypeError("Argument must be a Buffer");
        void 0 === start && (start = 0);
        void 0 === end && (end = target ? target.length : 0);
        void 0 === thisStart && (thisStart = 0);
        void 0 === thisEnd && (thisEnd = this.length);
        if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) throw new RangeError("out of range index");
        if (thisStart >= thisEnd && start >= end) return 0;
        if (thisStart >= thisEnd) return -1;
        if (start >= end) return 1;
        start >>>= 0;
        end >>>= 0;
        thisStart >>>= 0;
        thisEnd >>>= 0;
        if (this === target) return 0;
        var x = thisEnd - thisStart;
        var y = end - start;
        var len = Math.min(x, y);
        var thisCopy = this.slice(thisStart, thisEnd);
        var targetCopy = target.slice(start, end);
        for (var i = 0; i < len; ++i) if (thisCopy[i] !== targetCopy[i]) {
          x = thisCopy[i];
          y = targetCopy[i];
          break;
        }
        if (x < y) return -1;
        if (y < x) return 1;
        return 0;
      };
      function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
        if (0 === buffer.length) return -1;
        if ("string" === typeof byteOffset) {
          encoding = byteOffset;
          byteOffset = 0;
        } else byteOffset > 2147483647 ? byteOffset = 2147483647 : byteOffset < -2147483648 && (byteOffset = -2147483648);
        byteOffset = +byteOffset;
        isNaN(byteOffset) && (byteOffset = dir ? 0 : buffer.length - 1);
        byteOffset < 0 && (byteOffset = buffer.length + byteOffset);
        if (byteOffset >= buffer.length) {
          if (dir) return -1;
          byteOffset = buffer.length - 1;
        } else if (byteOffset < 0) {
          if (!dir) return -1;
          byteOffset = 0;
        }
        "string" === typeof val && (val = Buffer.from(val, encoding));
        if (Buffer.isBuffer(val)) {
          if (0 === val.length) return -1;
          return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
        }
        if ("number" === typeof val) {
          val &= 255;
          if (Buffer.TYPED_ARRAY_SUPPORT && "function" === typeof Uint8Array.prototype.indexOf) return dir ? Uint8Array.prototype.indexOf.call(buffer, val, byteOffset) : Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
          return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir);
        }
        throw new TypeError("val must be string, number or Buffer");
      }
      function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
        var indexSize = 1;
        var arrLength = arr.length;
        var valLength = val.length;
        if (void 0 !== encoding) {
          encoding = String(encoding).toLowerCase();
          if ("ucs2" === encoding || "ucs-2" === encoding || "utf16le" === encoding || "utf-16le" === encoding) {
            if (arr.length < 2 || val.length < 2) return -1;
            indexSize = 2;
            arrLength /= 2;
            valLength /= 2;
            byteOffset /= 2;
          }
        }
        function read(buf, i) {
          return 1 === indexSize ? buf[i] : buf.readUInt16BE(i * indexSize);
        }
        var i;
        if (dir) {
          var foundIndex = -1;
          for (i = byteOffset; i < arrLength; i++) if (read(arr, i) === read(val, -1 === foundIndex ? 0 : i - foundIndex)) {
            -1 === foundIndex && (foundIndex = i);
            if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
          } else {
            -1 !== foundIndex && (i -= i - foundIndex);
            foundIndex = -1;
          }
        } else {
          byteOffset + valLength > arrLength && (byteOffset = arrLength - valLength);
          for (i = byteOffset; i >= 0; i--) {
            var found = true;
            for (var j = 0; j < valLength; j++) if (read(arr, i + j) !== read(val, j)) {
              found = false;
              break;
            }
            if (found) return i;
          }
        }
        return -1;
      }
      Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
        return -1 !== this.indexOf(val, byteOffset, encoding);
      };
      Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
      };
      Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
      };
      function hexWrite(buf, string, offset, length) {
        offset = Number(offset) || 0;
        var remaining = buf.length - offset;
        if (length) {
          length = Number(length);
          length > remaining && (length = remaining);
        } else length = remaining;
        var strLen = string.length;
        if (strLen % 2 !== 0) throw new TypeError("Invalid hex string");
        length > strLen / 2 && (length = strLen / 2);
        for (var i = 0; i < length; ++i) {
          var parsed = parseInt(string.substr(2 * i, 2), 16);
          if (isNaN(parsed)) return i;
          buf[offset + i] = parsed;
        }
        return i;
      }
      function utf8Write(buf, string, offset, length) {
        return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
      }
      function asciiWrite(buf, string, offset, length) {
        return blitBuffer(asciiToBytes(string), buf, offset, length);
      }
      function latin1Write(buf, string, offset, length) {
        return asciiWrite(buf, string, offset, length);
      }
      function base64Write(buf, string, offset, length) {
        return blitBuffer(base64ToBytes(string), buf, offset, length);
      }
      function ucs2Write(buf, string, offset, length) {
        return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
      }
      Buffer.prototype.write = function write(string, offset, length, encoding) {
        if (void 0 === offset) {
          encoding = "utf8";
          length = this.length;
          offset = 0;
        } else if (void 0 === length && "string" === typeof offset) {
          encoding = offset;
          length = this.length;
          offset = 0;
        } else {
          if (!isFinite(offset)) throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
          offset |= 0;
          if (isFinite(length)) {
            length |= 0;
            void 0 === encoding && (encoding = "utf8");
          } else {
            encoding = length;
            length = void 0;
          }
        }
        var remaining = this.length - offset;
        (void 0 === length || length > remaining) && (length = remaining);
        if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) throw new RangeError("Attempt to write outside buffer bounds");
        encoding || (encoding = "utf8");
        var loweredCase = false;
        for (;;) switch (encoding) {
         case "hex":
          return hexWrite(this, string, offset, length);

         case "utf8":
         case "utf-8":
          return utf8Write(this, string, offset, length);

         case "ascii":
          return asciiWrite(this, string, offset, length);

         case "latin1":
         case "binary":
          return latin1Write(this, string, offset, length);

         case "base64":
          return base64Write(this, string, offset, length);

         case "ucs2":
         case "ucs-2":
         case "utf16le":
         case "utf-16le":
          return ucs2Write(this, string, offset, length);

         default:
          if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
          encoding = ("" + encoding).toLowerCase();
          loweredCase = true;
        }
      };
      Buffer.prototype.toJSON = function toJSON() {
        return {
          type: "Buffer",
          data: Array.prototype.slice.call(this._arr || this, 0)
        };
      };
      function base64Slice(buf, start, end) {
        return 0 === start && end === buf.length ? base64.fromByteArray(buf) : base64.fromByteArray(buf.slice(start, end));
      }
      function utf8Slice(buf, start, end) {
        end = Math.min(buf.length, end);
        var res = [];
        var i = start;
        while (i < end) {
          var firstByte = buf[i];
          var codePoint = null;
          var bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
          if (i + bytesPerSequence <= end) {
            var secondByte, thirdByte, fourthByte, tempCodePoint;
            switch (bytesPerSequence) {
             case 1:
              firstByte < 128 && (codePoint = firstByte);
              break;

             case 2:
              secondByte = buf[i + 1];
              if (128 === (192 & secondByte)) {
                tempCodePoint = (31 & firstByte) << 6 | 63 & secondByte;
                tempCodePoint > 127 && (codePoint = tempCodePoint);
              }
              break;

             case 3:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              if (128 === (192 & secondByte) && 128 === (192 & thirdByte)) {
                tempCodePoint = (15 & firstByte) << 12 | (63 & secondByte) << 6 | 63 & thirdByte;
                tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343) && (codePoint = tempCodePoint);
              }
              break;

             case 4:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              fourthByte = buf[i + 3];
              if (128 === (192 & secondByte) && 128 === (192 & thirdByte) && 128 === (192 & fourthByte)) {
                tempCodePoint = (15 & firstByte) << 18 | (63 & secondByte) << 12 | (63 & thirdByte) << 6 | 63 & fourthByte;
                tempCodePoint > 65535 && tempCodePoint < 1114112 && (codePoint = tempCodePoint);
              }
            }
          }
          if (null === codePoint) {
            codePoint = 65533;
            bytesPerSequence = 1;
          } else if (codePoint > 65535) {
            codePoint -= 65536;
            res.push(codePoint >>> 10 & 1023 | 55296);
            codePoint = 56320 | 1023 & codePoint;
          }
          res.push(codePoint);
          i += bytesPerSequence;
        }
        return decodeCodePointsArray(res);
      }
      var MAX_ARGUMENTS_LENGTH = 4096;
      function decodeCodePointsArray(codePoints) {
        var len = codePoints.length;
        if (len <= MAX_ARGUMENTS_LENGTH) return String.fromCharCode.apply(String, codePoints);
        var res = "";
        var i = 0;
        while (i < len) res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
        return res;
      }
      function asciiSlice(buf, start, end) {
        var ret = "";
        end = Math.min(buf.length, end);
        for (var i = start; i < end; ++i) ret += String.fromCharCode(127 & buf[i]);
        return ret;
      }
      function latin1Slice(buf, start, end) {
        var ret = "";
        end = Math.min(buf.length, end);
        for (var i = start; i < end; ++i) ret += String.fromCharCode(buf[i]);
        return ret;
      }
      function hexSlice(buf, start, end) {
        var len = buf.length;
        (!start || start < 0) && (start = 0);
        (!end || end < 0 || end > len) && (end = len);
        var out = "";
        for (var i = start; i < end; ++i) out += toHex(buf[i]);
        return out;
      }
      function utf16leSlice(buf, start, end) {
        var bytes = buf.slice(start, end);
        var res = "";
        for (var i = 0; i < bytes.length; i += 2) res += String.fromCharCode(bytes[i] + 256 * bytes[i + 1]);
        return res;
      }
      Buffer.prototype.slice = function slice(start, end) {
        var len = this.length;
        start = ~~start;
        end = void 0 === end ? len : ~~end;
        if (start < 0) {
          start += len;
          start < 0 && (start = 0);
        } else start > len && (start = len);
        if (end < 0) {
          end += len;
          end < 0 && (end = 0);
        } else end > len && (end = len);
        end < start && (end = start);
        var newBuf;
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          newBuf = this.subarray(start, end);
          newBuf.__proto__ = Buffer.prototype;
        } else {
          var sliceLen = end - start;
          newBuf = new Buffer(sliceLen, void 0);
          for (var i = 0; i < sliceLen; ++i) newBuf[i] = this[i + start];
        }
        return newBuf;
      };
      function checkOffset(offset, ext, length) {
        if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
        if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
      }
      Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
        offset |= 0;
        byteLength |= 0;
        noAssert || checkOffset(offset, byteLength, this.length);
        var val = this[offset];
        var mul = 1;
        var i = 0;
        while (++i < byteLength && (mul *= 256)) val += this[offset + i] * mul;
        return val;
      };
      Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
        offset |= 0;
        byteLength |= 0;
        noAssert || checkOffset(offset, byteLength, this.length);
        var val = this[offset + --byteLength];
        var mul = 1;
        while (byteLength > 0 && (mul *= 256)) val += this[offset + --byteLength] * mul;
        return val;
      };
      Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
        noAssert || checkOffset(offset, 1, this.length);
        return this[offset];
      };
      Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
        noAssert || checkOffset(offset, 2, this.length);
        return this[offset] | this[offset + 1] << 8;
      };
      Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
        noAssert || checkOffset(offset, 2, this.length);
        return this[offset] << 8 | this[offset + 1];
      };
      Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
        noAssert || checkOffset(offset, 4, this.length);
        return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + 16777216 * this[offset + 3];
      };
      Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
        noAssert || checkOffset(offset, 4, this.length);
        return 16777216 * this[offset] + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
      };
      Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
        offset |= 0;
        byteLength |= 0;
        noAssert || checkOffset(offset, byteLength, this.length);
        var val = this[offset];
        var mul = 1;
        var i = 0;
        while (++i < byteLength && (mul *= 256)) val += this[offset + i] * mul;
        mul *= 128;
        val >= mul && (val -= Math.pow(2, 8 * byteLength));
        return val;
      };
      Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
        offset |= 0;
        byteLength |= 0;
        noAssert || checkOffset(offset, byteLength, this.length);
        var i = byteLength;
        var mul = 1;
        var val = this[offset + --i];
        while (i > 0 && (mul *= 256)) val += this[offset + --i] * mul;
        mul *= 128;
        val >= mul && (val -= Math.pow(2, 8 * byteLength));
        return val;
      };
      Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
        noAssert || checkOffset(offset, 1, this.length);
        if (!(128 & this[offset])) return this[offset];
        return -1 * (255 - this[offset] + 1);
      };
      Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
        noAssert || checkOffset(offset, 2, this.length);
        var val = this[offset] | this[offset + 1] << 8;
        return 32768 & val ? 4294901760 | val : val;
      };
      Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
        noAssert || checkOffset(offset, 2, this.length);
        var val = this[offset + 1] | this[offset] << 8;
        return 32768 & val ? 4294901760 | val : val;
      };
      Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
        noAssert || checkOffset(offset, 4, this.length);
        return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
      };
      Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
        noAssert || checkOffset(offset, 4, this.length);
        return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
      };
      Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
        noAssert || checkOffset(offset, 4, this.length);
        return ieee754.read(this, offset, true, 23, 4);
      };
      Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
        noAssert || checkOffset(offset, 4, this.length);
        return ieee754.read(this, offset, false, 23, 4);
      };
      Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
        noAssert || checkOffset(offset, 8, this.length);
        return ieee754.read(this, offset, true, 52, 8);
      };
      Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
        noAssert || checkOffset(offset, 8, this.length);
        return ieee754.read(this, offset, false, 52, 8);
      };
      function checkInt(buf, value, offset, ext, max, min) {
        if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
        if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
        if (offset + ext > buf.length) throw new RangeError("Index out of range");
      }
      Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
        value = +value;
        offset |= 0;
        byteLength |= 0;
        if (!noAssert) {
          var maxBytes = Math.pow(2, 8 * byteLength) - 1;
          checkInt(this, value, offset, byteLength, maxBytes, 0);
        }
        var mul = 1;
        var i = 0;
        this[offset] = 255 & value;
        while (++i < byteLength && (mul *= 256)) this[offset + i] = value / mul & 255;
        return offset + byteLength;
      };
      Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
        value = +value;
        offset |= 0;
        byteLength |= 0;
        if (!noAssert) {
          var maxBytes = Math.pow(2, 8 * byteLength) - 1;
          checkInt(this, value, offset, byteLength, maxBytes, 0);
        }
        var i = byteLength - 1;
        var mul = 1;
        this[offset + i] = 255 & value;
        while (--i >= 0 && (mul *= 256)) this[offset + i] = value / mul & 255;
        return offset + byteLength;
      };
      Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 1, 255, 0);
        Buffer.TYPED_ARRAY_SUPPORT || (value = Math.floor(value));
        this[offset] = 255 & value;
        return offset + 1;
      };
      function objectWriteUInt16(buf, value, offset, littleEndian) {
        value < 0 && (value = 65535 + value + 1);
        for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) buf[offset + i] = (value & 255 << 8 * (littleEndian ? i : 1 - i)) >>> 8 * (littleEndian ? i : 1 - i);
      }
      Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 2, 65535, 0);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = 255 & value;
          this[offset + 1] = value >>> 8;
        } else objectWriteUInt16(this, value, offset, true);
        return offset + 2;
      };
      Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 2, 65535, 0);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 8;
          this[offset + 1] = 255 & value;
        } else objectWriteUInt16(this, value, offset, false);
        return offset + 2;
      };
      function objectWriteUInt32(buf, value, offset, littleEndian) {
        value < 0 && (value = 4294967295 + value + 1);
        for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) buf[offset + i] = value >>> 8 * (littleEndian ? i : 3 - i) & 255;
      }
      Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 4, 4294967295, 0);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset + 3] = value >>> 24;
          this[offset + 2] = value >>> 16;
          this[offset + 1] = value >>> 8;
          this[offset] = 255 & value;
        } else objectWriteUInt32(this, value, offset, true);
        return offset + 4;
      };
      Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 4, 4294967295, 0);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 24;
          this[offset + 1] = value >>> 16;
          this[offset + 2] = value >>> 8;
          this[offset + 3] = 255 & value;
        } else objectWriteUInt32(this, value, offset, false);
        return offset + 4;
      };
      Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
        value = +value;
        offset |= 0;
        if (!noAssert) {
          var limit = Math.pow(2, 8 * byteLength - 1);
          checkInt(this, value, offset, byteLength, limit - 1, -limit);
        }
        var i = 0;
        var mul = 1;
        var sub = 0;
        this[offset] = 255 & value;
        while (++i < byteLength && (mul *= 256)) {
          value < 0 && 0 === sub && 0 !== this[offset + i - 1] && (sub = 1);
          this[offset + i] = (value / mul >> 0) - sub & 255;
        }
        return offset + byteLength;
      };
      Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
        value = +value;
        offset |= 0;
        if (!noAssert) {
          var limit = Math.pow(2, 8 * byteLength - 1);
          checkInt(this, value, offset, byteLength, limit - 1, -limit);
        }
        var i = byteLength - 1;
        var mul = 1;
        var sub = 0;
        this[offset + i] = 255 & value;
        while (--i >= 0 && (mul *= 256)) {
          value < 0 && 0 === sub && 0 !== this[offset + i + 1] && (sub = 1);
          this[offset + i] = (value / mul >> 0) - sub & 255;
        }
        return offset + byteLength;
      };
      Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 1, 127, -128);
        Buffer.TYPED_ARRAY_SUPPORT || (value = Math.floor(value));
        value < 0 && (value = 255 + value + 1);
        this[offset] = 255 & value;
        return offset + 1;
      };
      Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 2, 32767, -32768);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = 255 & value;
          this[offset + 1] = value >>> 8;
        } else objectWriteUInt16(this, value, offset, true);
        return offset + 2;
      };
      Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 2, 32767, -32768);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 8;
          this[offset + 1] = 255 & value;
        } else objectWriteUInt16(this, value, offset, false);
        return offset + 2;
      };
      Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 4, 2147483647, -2147483648);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = 255 & value;
          this[offset + 1] = value >>> 8;
          this[offset + 2] = value >>> 16;
          this[offset + 3] = value >>> 24;
        } else objectWriteUInt32(this, value, offset, true);
        return offset + 4;
      };
      Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 4, 2147483647, -2147483648);
        value < 0 && (value = 4294967295 + value + 1);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 24;
          this[offset + 1] = value >>> 16;
          this[offset + 2] = value >>> 8;
          this[offset + 3] = 255 & value;
        } else objectWriteUInt32(this, value, offset, false);
        return offset + 4;
      };
      function checkIEEE754(buf, value, offset, ext, max, min) {
        if (offset + ext > buf.length) throw new RangeError("Index out of range");
        if (offset < 0) throw new RangeError("Index out of range");
      }
      function writeFloat(buf, value, offset, littleEndian, noAssert) {
        noAssert || checkIEEE754(buf, value, offset, 4, 3.4028234663852886e38, -3.4028234663852886e38);
        ieee754.write(buf, value, offset, littleEndian, 23, 4);
        return offset + 4;
      }
      Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
        return writeFloat(this, value, offset, true, noAssert);
      };
      Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
        return writeFloat(this, value, offset, false, noAssert);
      };
      function writeDouble(buf, value, offset, littleEndian, noAssert) {
        noAssert || checkIEEE754(buf, value, offset, 8, 1.7976931348623157e308, -1.7976931348623157e308);
        ieee754.write(buf, value, offset, littleEndian, 52, 8);
        return offset + 8;
      }
      Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
        return writeDouble(this, value, offset, true, noAssert);
      };
      Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
        return writeDouble(this, value, offset, false, noAssert);
      };
      Buffer.prototype.copy = function copy(target, targetStart, start, end) {
        start || (start = 0);
        end || 0 === end || (end = this.length);
        targetStart >= target.length && (targetStart = target.length);
        targetStart || (targetStart = 0);
        end > 0 && end < start && (end = start);
        if (end === start) return 0;
        if (0 === target.length || 0 === this.length) return 0;
        if (targetStart < 0) throw new RangeError("targetStart out of bounds");
        if (start < 0 || start >= this.length) throw new RangeError("sourceStart out of bounds");
        if (end < 0) throw new RangeError("sourceEnd out of bounds");
        end > this.length && (end = this.length);
        target.length - targetStart < end - start && (end = target.length - targetStart + start);
        var len = end - start;
        var i;
        if (this === target && start < targetStart && targetStart < end) for (i = len - 1; i >= 0; --i) target[i + targetStart] = this[i + start]; else if (len < 1e3 || !Buffer.TYPED_ARRAY_SUPPORT) for (i = 0; i < len; ++i) target[i + targetStart] = this[i + start]; else Uint8Array.prototype.set.call(target, this.subarray(start, start + len), targetStart);
        return len;
      };
      Buffer.prototype.fill = function fill(val, start, end, encoding) {
        if ("string" === typeof val) {
          if ("string" === typeof start) {
            encoding = start;
            start = 0;
            end = this.length;
          } else if ("string" === typeof end) {
            encoding = end;
            end = this.length;
          }
          if (1 === val.length) {
            var code = val.charCodeAt(0);
            code < 256 && (val = code);
          }
          if (void 0 !== encoding && "string" !== typeof encoding) throw new TypeError("encoding must be a string");
          if ("string" === typeof encoding && !Buffer.isEncoding(encoding)) throw new TypeError("Unknown encoding: " + encoding);
        } else "number" === typeof val && (val &= 255);
        if (start < 0 || this.length < start || this.length < end) throw new RangeError("Out of range index");
        if (end <= start) return this;
        start >>>= 0;
        end = void 0 === end ? this.length : end >>> 0;
        val || (val = 0);
        var i;
        if ("number" === typeof val) for (i = start; i < end; ++i) this[i] = val; else {
          var bytes = Buffer.isBuffer(val) ? val : utf8ToBytes(new Buffer(val, encoding).toString());
          var len = bytes.length;
          for (i = 0; i < end - start; ++i) this[i + start] = bytes[i % len];
        }
        return this;
      };
      var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;
      function base64clean(str) {
        str = stringtrim(str).replace(INVALID_BASE64_RE, "");
        if (str.length < 2) return "";
        while (str.length % 4 !== 0) str += "=";
        return str;
      }
      function stringtrim(str) {
        if (str.trim) return str.trim();
        return str.replace(/^\s+|\s+$/g, "");
      }
      function toHex(n) {
        if (n < 16) return "0" + n.toString(16);
        return n.toString(16);
      }
      function utf8ToBytes(string, units) {
        units = units || Infinity;
        var codePoint;
        var length = string.length;
        var leadSurrogate = null;
        var bytes = [];
        for (var i = 0; i < length; ++i) {
          codePoint = string.charCodeAt(i);
          if (codePoint > 55295 && codePoint < 57344) {
            if (!leadSurrogate) {
              if (codePoint > 56319) {
                (units -= 3) > -1 && bytes.push(239, 191, 189);
                continue;
              }
              if (i + 1 === length) {
                (units -= 3) > -1 && bytes.push(239, 191, 189);
                continue;
              }
              leadSurrogate = codePoint;
              continue;
            }
            if (codePoint < 56320) {
              (units -= 3) > -1 && bytes.push(239, 191, 189);
              leadSurrogate = codePoint;
              continue;
            }
            codePoint = 65536 + (leadSurrogate - 55296 << 10 | codePoint - 56320);
          } else leadSurrogate && (units -= 3) > -1 && bytes.push(239, 191, 189);
          leadSurrogate = null;
          if (codePoint < 128) {
            if ((units -= 1) < 0) break;
            bytes.push(codePoint);
          } else if (codePoint < 2048) {
            if ((units -= 2) < 0) break;
            bytes.push(codePoint >> 6 | 192, 63 & codePoint | 128);
          } else if (codePoint < 65536) {
            if ((units -= 3) < 0) break;
            bytes.push(codePoint >> 12 | 224, codePoint >> 6 & 63 | 128, 63 & codePoint | 128);
          } else {
            if (!(codePoint < 1114112)) throw new Error("Invalid code point");
            if ((units -= 4) < 0) break;
            bytes.push(codePoint >> 18 | 240, codePoint >> 12 & 63 | 128, codePoint >> 6 & 63 | 128, 63 & codePoint | 128);
          }
        }
        return bytes;
      }
      function asciiToBytes(str) {
        var byteArray = [];
        for (var i = 0; i < str.length; ++i) byteArray.push(255 & str.charCodeAt(i));
        return byteArray;
      }
      function utf16leToBytes(str, units) {
        var c, hi, lo;
        var byteArray = [];
        for (var i = 0; i < str.length; ++i) {
          if ((units -= 2) < 0) break;
          c = str.charCodeAt(i);
          hi = c >> 8;
          lo = c % 256;
          byteArray.push(lo);
          byteArray.push(hi);
        }
        return byteArray;
      }
      function base64ToBytes(str) {
        return base64.toByteArray(base64clean(str));
      }
      function blitBuffer(src, dst, offset, length) {
        for (var i = 0; i < length; ++i) {
          if (i + offset >= dst.length || i >= src.length) break;
          dst[i + offset] = src[i];
        }
        return i;
      }
      function isnan(val) {
        return val !== val;
      }
    }).call(this, "undefined" !== typeof global ? global : "undefined" !== typeof self ? self : "undefined" !== typeof window ? window : {});
  }, {
    "base64-js": 1,
    ieee754: 4,
    isarray: 3
  } ],
  3: [ function(require, module, exports) {
    var toString = {}.toString;
    module.exports = Array.isArray || function(arr) {
      return "[object Array]" == toString.call(arr);
    };
  }, {} ],
  4: [ function(require, module, exports) {
    exports.read = function(buffer, offset, isLE, mLen, nBytes) {
      var e, m;
      var eLen = 8 * nBytes - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var nBits = -7;
      var i = isLE ? nBytes - 1 : 0;
      var d = isLE ? -1 : 1;
      var s = buffer[offset + i];
      i += d;
      e = s & (1 << -nBits) - 1;
      s >>= -nBits;
      nBits += eLen;
      for (;nBits > 0; e = 256 * e + buffer[offset + i], i += d, nBits -= 8) ;
      m = e & (1 << -nBits) - 1;
      e >>= -nBits;
      nBits += mLen;
      for (;nBits > 0; m = 256 * m + buffer[offset + i], i += d, nBits -= 8) ;
      if (0 === e) e = 1 - eBias; else {
        if (e === eMax) return m ? NaN : Infinity * (s ? -1 : 1);
        m += Math.pow(2, mLen);
        e -= eBias;
      }
      return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
    };
    exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
      var e, m, c;
      var eLen = 8 * nBytes - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var rt = 23 === mLen ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
      var i = isLE ? 0 : nBytes - 1;
      var d = isLE ? 1 : -1;
      var s = value < 0 || 0 === value && 1 / value < 0 ? 1 : 0;
      value = Math.abs(value);
      if (isNaN(value) || Infinity === value) {
        m = isNaN(value) ? 1 : 0;
        e = eMax;
      } else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
          e--;
          c *= 2;
        }
        value += e + eBias >= 1 ? rt / c : rt * Math.pow(2, 1 - eBias);
        if (value * c >= 2) {
          e++;
          c /= 2;
        }
        if (e + eBias >= eMax) {
          m = 0;
          e = eMax;
        } else if (e + eBias >= 1) {
          m = (value * c - 1) * Math.pow(2, mLen);
          e += eBias;
        } else {
          m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
          e = 0;
        }
      }
      for (;mLen >= 8; buffer[offset + i] = 255 & m, i += d, m /= 256, mLen -= 8) ;
      e = e << mLen | m;
      eLen += mLen;
      for (;eLen > 0; buffer[offset + i] = 255 & e, i += d, e /= 256, eLen -= 8) ;
      buffer[offset + i - d] |= 128 * s;
    };
  }, {} ],
  DataFunc: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "aeb5eGZwMxOIo9eEEeRZFov", "DataFunc");
    "use strict";
    window.dataFunc = {
      arrTables: [],
      csvTables: {},
      csvTableForArr: {},
      tableCast: {},
      tableComment: {},
      CELL_DELIMITERS: [ ",", ";", "\t", "|", "^" ],
      LINE_DELIMITERS: [ "\r\n", "\r", "\n" ],
      uiPanelAnimationClips: {}
    };
    dataFunc.getTable = function(tableName) {
      return dataFunc.csvTables[tableName];
    };
    dataFunc.getTableArr = function(tableName) {
      return dataFunc.csvTableForArr[tableName];
    };
    dataFunc.queryOne = function(tableName, key, value) {
      var table = dataFunc.getTable(tableName);
      if (!table) return null;
      if (!key) return table[value];
      for (var tbItem in table) {
        if (!table.hasOwnProperty(tbItem)) continue;
        if (table[tbItem][key] === value) return table[tbItem];
      }
    };
    dataFunc.queryByID = function(tableName, ID) {
      return dataFunc.queryOne(tableName, null, ID);
    };
    dataFunc.queryAll = function(tableName, key, value) {
      var table = dataFunc.getTable(tableName);
      if (!table || !key) return null;
      var ret = {};
      for (var tbItem in table) {
        if (!table.hasOwnProperty(tbItem)) continue;
        table[tbItem][key] === value && (ret[tbItem] = table[tbItem]);
      }
      return ret;
    };
    dataFunc.loadConfigs = function(progressCb, callback) {
      cc.loader.loadResDir("panelAnimClips", cc.AnimationClip, function(err, clips) {
        if (err) {
          cc.error(err.message || err);
          return;
        }
        for (var i = 0; i < clips.length; i++) dataFunc.uiPanelAnimationClips[clips[i].name] = clips[i];
      });
      var currentLoad = 0;
      dataFunc.arrTables.forEach(function(tableName, index) {
        cc.loader.loadRes("data/" + tableName, function(err, content) {
          if (err) {
            cc.error(err.message || err);
            return;
          }
          progressCb && progressCb(index + 1, dataFunc.arrTables.length);
          addTable(tableName, content);
          if (callback) {
            currentLoad++;
            currentLoad >= dataFunc.arrTables.length && callback();
          }
        });
      });
      function addTable(tableName, tableContent, force) {
        if (dataFunc.csvTables[tableName] && !force) return;
        var tableData = {};
        var tableArr = [];
        var opts = {
          header: true
        };
        CSV.parse(tableContent, opts, function(row, keyname) {
          tableData[row[keyname]] = row;
          tableArr.push(row);
        });
        dataFunc.tableCast[tableName] = CSV.opts.cast;
        dataFunc.tableComment[tableName] = CSV.opts.comment;
        dataFunc.csvTables[tableName] = tableData;
        dataFunc.csvTableForArr[tableName] = tableArr;
      }
      function getterCast(value, index, cast, d) {
        return cast instanceof Array ? "number" === cast[index] ? Number(d[index]) : "boolean" === cast[index] ? "true" === d[index] || "t" === d[index] || "1" === d[index] : d[index] : isNaN(Number(value)) ? "false" == value || "true" == value || "t" == value || "f" == value ? "true" === d[index] || "t" === d[index] || "1" === d[index] : d[index] : Number(d[index]);
      }
      var CSV = {
        STANDARD_DECODE_OPTS: {
          skip: 0,
          limit: false,
          header: false,
          cast: false,
          comment: ""
        },
        STANDARD_ENCODE_OPTS: {
          delimiter: dataFunc.CELL_DELIMITERS[0],
          newline: dataFunc.LINE_DELIMITERS[0],
          skip: 0,
          limit: false,
          header: false
        },
        quoteMark: '"',
        doubleQuoteMark: '""',
        quoteRegex: /"/g,
        assign: function assign() {
          var args = Array.prototype.slice.call(arguments);
          var base = args[0];
          var rest = args.slice(1);
          for (var i = 0, len = rest.length; i < len; i++) for (var attr in rest[i]) base[attr] = rest[i][attr];
          return base;
        },
        map: function map(collection, fn) {
          var results = [];
          for (var i = 0, len = collection.length; i < len; i++) results[i] = fn(collection[i], i);
          return results;
        },
        getType: function getType(obj) {
          return Object.prototype.toString.call(obj).slice(8, -1);
        },
        getLimit: function getLimit(limit, len) {
          return false === limit ? len : limit;
        },
        buildObjectConstructor: function buildObjectConstructor(fields, sample, cast) {
          return function(d) {
            var object = new Object();
            var setter = function setter(attr, value) {
              return object[attr] = value;
            };
            cast ? fields.forEach(function(attr, idx) {
              setter(attr, getterCast(sample[idx], idx, cast, d));
            }) : fields.forEach(function(attr, idx) {
              setter(attr, getterCast(sample[idx], idx, null, d));
            });
            return object;
          };
        },
        buildArrayConstructor: function buildArrayConstructor(sample, cast) {
          return function(d) {
            var row = new Array(sample.length);
            var setter = function setter(idx, value) {
              return row[idx] = value;
            };
            cast ? fields.forEach(function(attr, idx) {
              setter(attr, getterCast(sample[idx], idx, cast, d));
            }) : fields.forEach(function(attr, idx) {
              setter(attr, getterCast(sample[idx], idx, null, d));
            });
            return row;
          };
        },
        frequency: function frequency(coll, needle, limit) {
          void 0 === limit && (limit = false);
          var count = 0;
          var lastIndex = 0;
          var maxIndex = this.getLimit(limit, coll.length);
          while (lastIndex < maxIndex) {
            lastIndex = coll.indexOf(needle, lastIndex);
            if (-1 === lastIndex) break;
            lastIndex += 1;
            count++;
          }
          return count;
        },
        mostFrequent: function mostFrequent(coll, needles, limit) {
          var max = 0;
          var detected;
          for (var cur = needles.length - 1; cur >= 0; cur--) this.frequency(coll, needles[cur], limit) > max && (detected = needles[cur]);
          return detected || needles[0];
        },
        unsafeParse: function unsafeParse(text, opts, fn) {
          var lines = text.split(opts.newline);
          opts.skip > 0 && lines.splice(opts.skip);
          var fields;
          var constructor;
          function cells(lines) {
            var line = lines.shift();
            if (line.indexOf('"') >= 0) {
              var lastIndex = 0;
              var findIndex = 0;
              var count = 0;
              while (lines.length > 0) {
                lastIndex = line.indexOf('"', findIndex);
                if (-1 === lastIndex && count % 2 === 0) break;
                if (-1 !== lastIndex) {
                  findIndex = lastIndex + 1;
                  count++;
                } else line = line + opts.newline + lines.shift();
              }
              var list = [];
              var item;
              var quoteCount = 0;
              var start = 0;
              var end = 0;
              var length = line.length;
              for (var key in line) {
                if (!line.hasOwnProperty(key)) continue;
                key = parseInt(key);
                var value = line[key];
                if (0 === key && '"' === value) {
                  quoteCount++;
                  start = 1;
                }
                if ('"' === value) {
                  quoteCount++;
                  line[key - 1] === opts.delimiter && start === key && start++;
                }
                if ('"' === value && quoteCount % 2 === 0 && (line[key + 1] === opts.delimiter || key + 1 === length)) {
                  end = key;
                  item = line.substring(start, end);
                  list.push(item);
                  start = end + 2;
                  end = start;
                }
                if (value === opts.delimiter && quoteCount % 2 === 0) {
                  end = key;
                  if (end > start) {
                    item = line.substring(start, end);
                    list.push(item);
                    start = end + 1;
                    end = start;
                  } else if (end === start) {
                    list.push("");
                    start = end + 1;
                    end = start;
                  }
                }
              }
              end = length;
              if (end >= start) {
                item = line.substring(start, end);
                list.push(item);
              }
              return list;
            }
            return line.split(opts.delimiter);
          }
          if (opts.header) {
            if (true === opts.header) {
              opts.comment = cells(lines);
              opts.cast = cells(lines);
              fields = cells(lines);
            } else "Array" === this.getType(opts.header) && (fields = opts.header);
            constructor = this.buildObjectConstructor(fields, lines[0].split(opts.delimiter), opts.cast);
          } else constructor = this.buildArrayConstructor(lines[0].split(opts.delimiter), opts.cast);
          while (lines.length > 0) {
            var row = cells(lines);
            row.length > 1 && fn(constructor(row), fields[0]);
          }
          return true;
        },
        parse: function parse(text, opts, fn) {
          var rows;
          if ("Function" === this.getType(opts)) {
            fn = opts;
            opts = {};
          } else if ("Function" !== this.getType(fn)) {
            rows = [];
            fn = rows.push.bind(rows);
          } else rows = [];
          opts = this.assign({}, this.STANDARD_DECODE_OPTS, opts);
          this.opts = opts;
          if (!opts.delimiter || !opts.newline) {
            var limit = Math.min(48, Math.floor(text.length / 20), text.length);
            opts.delimiter = opts.delimiter || this.mostFrequent(text, dataFunc.CELL_DELIMITERS, limit);
            opts.newline = opts.newline || this.mostFrequent(text, dataFunc.LINE_DELIMITERS, limit);
          }
          return this.unsafeParse(text, opts, fn) && (!(rows.length > 0) || rows);
        }
      };
    };
    cc._RF.pop();
  }, {} ],
  Globals: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "6ef76APuCREkJ0E57ey+NRe", "Globals");
    "use strict";
    window.Game = {
      GameManager: null,
      BlockManager: null,
      PlayerManager: null,
      ClickManager: null,
      BubbleManager: null,
      PathManager: null,
      ComboManager: null
    };
    window.GameState = cc.Enum({
      None: 0,
      Pause: 1,
      Play: 2,
      Over: 3
    });
    window.DirectState = cc.Enum({
      None: 0,
      Left: 1,
      Right: 2
    });
    window.GLB = {
      RANDOM_MATCH: 1,
      PROPERTY_MATCH: 2,
      COOPERATION: 1,
      COMPETITION: 2,
      MAX_PLAYER_COUNT: 2,
      PLAYER_COUNTS: [ 2 ],
      GAME_START_EVENT: "gameStart",
      GAME_OVER_EVENT: "gameOver",
      READY: "ready",
      ROUND_START: "roundStar",
      SCORE_EVENT: "score",
      DELETE_BLOCK: "deleteBlock",
      DISTANCE: "distance",
      INITMAP: "initMap",
      BUBBLE: "bubble",
      TIME_OUT: "timeOut",
      GET_GAME_DATA: "getGameData",
      RECONNECTION_DATA: "ReconnectionData",
      COUNT_DOWN: "countDown",
      channel: "MatchVS",
      platform: "alpha",
      gameId: 201681,
      gameVersion: 1,
      IP: "wxrank.matchvs.com",
      PORT: "3010",
      GAME_NAME: "game10",
      appKey: "d5b8332763ac468e9462488110e10955",
      secret: "542763e151f04defa81195fbe2fca935",
      matchType: 1,
      gameType: 2,
      userInfo: null,
      playerUserIds: [],
      isRoomOwner: false,
      syncFrame: true,
      FRAME_RATE: 10,
      nickName: null,
      avatarUrl: null,
      NormalBulletSpeed: 1e3,
      limitX: 53,
      limitY: 780,
      range: 77
    };
    cc._RF.pop();
  }, {} ],
  MatchvsEngine: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "a5d4d0RpP1Mwpu2OZcb21jB", "MatchvsEngine");
    "use strict";
    function MatchvsEngine() {
      console.log("MatchvsEngine init");
    }
    MatchvsEngine.prototype.init = function(matchVSResponses, channel, platform, gameid) {
      this.responses = matchVSResponses;
      return 0;
    };
    MatchvsEngine.prototype.registerUser = function() {
      this._forEachResponse(function(res) {
        setTimeout(function() {
          var userInfo = {
            userID: 10086,
            token: "jkfldjalfkdjaljfs",
            name: "\u5f20\u4e09",
            avatar: "http://d3819ii77zvwic.cloudfront.net/wp-content/uploads/2015/02/child-fist-pump.jpg"
          };
          res.registerUserResponse && res.registerUserResponse(userInfo);
        }, 100);
      });
      return 0;
    };
    MatchvsEngine.prototype.login = function(userID, token, gameid, gameVersion, appkey, secret, deviceID, gatewayid) {
      return 0;
    };
    MatchvsEngine.prototype.joinRandomRoom = function() {
      this._forEachResponse(function(res) {
        setTimeout(function() {
          var roomInfo = {
            status: 0,
            userInfoList: [ {
              userID: 10086,
              userProfile: "\u5f20\u4e09"
            }, {
              userID: 10087,
              userProfile: "\u674e\u56db"
            }, {
              userID: 10088,
              userProfile: "\u738b\u4e94"
            } ],
            roomInfo: {
              rootID: 1028374,
              rootProperty: "\u597d\u623f\u95f4",
              owner: 10086
            }
          };
          res && res.roomJoinResponse(roomInfo);
        }, 100);
      });
      return 0;
    };
    MatchvsEngine.prototype._forEachResponse = function(func) {
      if (this.responses) for (var i = 0; i < this.responses.length; i++) this.responses[i] && func(this.responses[i]);
    };
    MatchvsEngine.prototype.joinOver = function() {
      return 0;
    };
    MatchvsEngine.prototype.sendEvent = function(event) {
      var mockEventId = new Date().getTime();
      this._forEachResponse(function(res) {
        setTimeout(function() {
          res.sendEventRsp && res.sendEventRsp({
            status: 0,
            seq: mockEventId
          });
        }, 100);
      });
      return {
        status: 0,
        seq: mockEventId
      };
    };
    module.exports = MatchvsEngine;
    cc._RF.pop();
  }, {} ],
  Matchvs: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "11173/l/0JMUr5XExiaAUn8", "Matchvs");
    "use strict";
    var engine;
    var response = {};
    var MsMatchInfo;
    var MsCreateRoomInfo;
    try {
      engine = Matchvs.MatchvsEngine.getInstance();
      MsMatchInfo = Matchvs.MsMatchInfo;
      MsCreateRoomInfo = Matchvs.MsCreateRoomInfo;
    } catch (e) {
      try {
        var jsMatchvs = require("matchvs.all");
        engine = new jsMatchvs.MatchvsEngine();
        response = new jsMatchvs.MatchvsResponse();
        MsMatchInfo = jsMatchvs.MsMatchInfo;
        MsCreateRoomInfo = jsMatchvs.MsCreateRoomInfo;
      } catch (e) {
        var MatchVSEngine = require("MatchvsEngine");
        engine = new MatchVSEngine();
      }
    }
    module.exports = {
      engine: engine,
      response: response,
      MatchInfo: MsMatchInfo,
      CreateRoomInfo: MsCreateRoomInfo
    };
    cc._RF.pop();
  }, {
    MatchvsEngine: "MatchvsEngine",
    "matchvs.all": "matchvs.all"
  } ],
  UIFunc: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "e27ea/SQDlKEYCLkAX9GkJg", "UIFunc");
    "use strict";
    window.uiFunc = {
      uiList: []
    };
    uiFunc.openUI = function(uiName, callBack) {
      cc.loader.loadRes("ui/" + uiName, function(err, prefab) {
        if (err) {
          cc.log(err.message || err);
          return;
        }
        var temp = cc.instantiate(prefab);
        temp.parent = cc.Canvas.instance.node;
        uiFunc.uiList.push(temp);
        for (var i = 0; i < uiFunc.uiList.length; i++) if (uiFunc.uiList[i] && "" !== uiFunc.uiList[i].name) {
          var targetUI = uiFunc.uiList[i].getComponent("uiPanel");
          targetUI && targetUI.isTop && targetUI.node.setSiblingIndex(Number.MAX_SAFE_INTEGER);
        }
        callBack && callBack(temp);
      });
    };
    uiFunc.closeUI = function(targetUI) {
      for (var i = uiFunc.uiList.length - 1; i >= 0; i--) if (uiFunc.uiList[i] && targetUI === uiFunc.uiList[i]) {
        targetUI.destroy();
        uiFunc.uiList.splice(i, 1);
        break;
      }
    };
    uiFunc.findUI = function(uiName) {
      for (var i = uiFunc.uiList.length - 1; i >= 0; i--) {
        var temp = uiFunc.uiList[i];
        if (temp && temp.name === uiName) return temp;
      }
      return null;
    };
    uiFunc.getUiList = function() {
      return uiFunc.uiList;
    };
    cc._RF.pop();
  }, {} ],
  blockManager: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "1a84cfNtshMWJNfAFtQpZc2", "blockManager");
    "use strict";
    var mvs = require("Matchvs");
    cc.Class({
      extends: cc.Component,
      properties: {
        blockPrefab: {
          type: cc.Prefab,
          default: null
        },
        linkAudio: {
          default: null,
          url: cc.AudioClip
        },
        blockSpriteFrame: {
          default: [],
          type: cc.SpriteFrame
        }
      },
      onLoad: function onLoad() {
        Game.BlockManager = this;
        this.index = 0;
        this.arrMap = [];
        this.newArrMap = [];
        this.blockPool = new cc.NodePool();
      },
      receiveArrMap: function receiveArrMap(array) {
        this.deleteWholeBlock();
        for (var row = 0; row < 8; row++) {
          this.arrMap[row] = [];
          for (var col = 0; col < 9; col++) this.arrMap[row][col] = this.arrBlcokData(row, col, array[row][col]);
        }
        this.initMap(this.arrMap);
      },
      arrBlcokData: function arrBlcokData(row, col, type) {
        var y = GLB.limitY - GLB.range * row;
        var x = GLB.limitX + GLB.range * col;
        var data = {
          pos: cc.p(x, y),
          type: type,
          sprite: null
        };
        return data;
      },
      initMap: function initMap(arrMap) {
        for (var row = 0; row < 8; row++) for (var col = 0; col < 9; col++) if (null !== arrMap[row][col].type) {
          var block = this.blockPool.get();
          block || (block = cc.instantiate(this.blockPrefab));
          block.getComponent(cc.Sprite).spriteFrame = this.blockSpriteFrame[arrMap[row][col].type];
          block.parent = this.node;
          block.setPosition(arrMap[row][col].pos);
          block.row = row;
          block.col = col;
          block.type = arrMap[row][col].type;
          arrMap[row][col].sprite = block;
        }
        Game.ClickManager.setArrMap(arrMap);
        Game.PlayerManager.self.combo = 1;
        Game.PlayerManager.rival.combo = 1;
      },
      deleteBlock: function deleteBlock(first, last, id, arrPath) {
        if (null === this.arrMap[first.row][first.col].sprite || null === this.arrMap[last.row][last.col].sprite) return;
        if (this.arrMap[first.row][first.col].type !== this.arrMap[last.row][last.col].type) return;
        cc.audioEngine.play(this.linkAudio, false, 1);
        Game.PathManager.addPath(arrPath, id);
        this.arrMap[first.row][first.col].type = null;
        this.recycleBlock(this.arrMap[first.row][first.col].sprite);
        this.arrMap[first.row][first.col].sprite = null;
        this.arrMap[last.row][last.col].type = null;
        this.recycleBlock(this.arrMap[last.row][last.col].sprite);
        this.arrMap[last.row][last.col].sprite = null;
        if (id === GLB.userInfo.id) Game.PlayerManager.self.addScore(); else {
          Game.PlayerManager.rival.addScore();
          Game.ClickManager.curBlocBeDelete(first);
          Game.ClickManager.curBlocBeDelete(last);
        }
        var pos = this.arrMap[last.row][last.col].pos;
        Game.ComboManager.addCombo(pos, id);
        this.resettingMap();
      },
      resettingMap: function resettingMap() {
        var arrBlock = this.node.children;
        if (arrBlock.length <= 0) {
          this.node.dispatchEvent(new cc.Event.EventCustom(clientEvent.eventType.nextRound, true));
          return;
        }
        if (this.automaticClearing()) return;
        if (GLB.isRoomOwner) {
          while (true) {
            var number1 = 0;
            var number2 = 0;
            while (number1 === number2) {
              number1 = Math.floor(Math.random() * arrBlock.length);
              number2 = Math.floor(Math.random() * arrBlock.length);
            }
            this.exchangeType(arrBlock[number1], arrBlock[number2]);
            if (this.automaticClearing()) break;
          }
          var arrMap = this.getArrMap();
          clientEvent.dispatch(clientEvent.eventType.updateMap, arrMap);
        }
      },
      exchangeType: function exchangeType(block1, block2) {
        var temp = block1.type;
        block1.getComponent(cc.Sprite).spriteFrame = this.blockSpriteFrame[block2.type];
        block1.type = block2.type;
        this.arrMap[block1.row][block1.col].type = block2.type;
        block2.getComponent(cc.Sprite).spriteFrame = this.blockSpriteFrame[temp];
        block2.type = temp;
        this.arrMap[block2.row][block2.col].type = temp;
      },
      deleteWholeBlock: function deleteWholeBlock() {
        this.arrMap = [];
        this.node.children.length > 0 && this.node.removeAllChildren();
        Game.ClickManager.choiceBox.destroy();
        Game.ClickManager.curSelec = null;
        Game.ClickManager.setChoiceBox();
      },
      recycleBlock: function recycleBlock(target) {
        this.blockPool.put(target);
      },
      getArrMap: function getArrMap() {
        var arrMap = [];
        for (var row = 0; row < 8; row++) {
          arrMap[row] = [];
          for (var col = 0; col < 9; col++) arrMap[row][col] = this.arrMap[row][col].type;
        }
        return arrMap;
      },
      nextRound: function nextRound() {
        this.deleteWholeBlock();
        this.node.dispatchEvent(new cc.Event.EventCustom(clientEvent.eventType.nextRound, true));
      },
      automaticClearing: function automaticClearing() {
        var arrBlock = this.node.children;
        for (var i = 0; i < arrBlock.length; i++) for (var j = i + 1; j < arrBlock.length; j++) if (Game.ClickManager.link(arrBlock[i], arrBlock[j])) return true;
        return false;
      }
    });
    cc._RF.pop();
  }, {
    Matchvs: "Matchvs"
  } ],
  block: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "8fd5fQJ7V9MaooovKVX5rk8", "block");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {},
      onLoad: function onLoad() {
        this.node.on("click", this.click, this);
      },
      click: function click() {
        Game.ClickManager.clickBlock(this.node);
      }
    });
    cc._RF.pop();
  }, {} ],
  bubbleManager: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "6bf1eqFJhNCzarf0WEMO0em", "bubbleManager");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        bubblePrefab: {
          type: cc.Prefab,
          default: null
        },
        bubbleClip: {
          default: null,
          url: cc.AudioClip
        },
        bubbleSpriteFrame: {
          default: [],
          type: cc.SpriteFrame
        }
      },
      start: function start() {
        Game.BubbleManager = this;
        this.selfBubblePool = new cc.NodePool();
        this.rivalBubblePool = new cc.NodePool();
      },
      initBubble: function initBubble(type, id) {
        cc.audioEngine.play(this.bubbleClip, false, 1);
        var i = null;
        switch (type) {
         case "one":
          i = 0;
          break;

         case "two":
          i = 1;
          break;

         case "three":
          i = 2;
          break;

         case "four":
          i = 3;
          break;

         case "five":
          i = 4;
          break;

         case "six":
          i = 5;
        }
        var x = -200;
        var y = 100 * Math.random();
        if (id !== Game.PlayerManager.self.playerId) {
          var bubble = this.selfBubblePool.get();
          bubble || (bubble = cc.instantiate(this.bubblePrefab));
          bubble.getComponent(cc.Sprite).spriteFrame = this.bubbleSpriteFrame[i];
          bubble.scaleX = -1;
          var pos = cc.p(-x, y);
          bubble.type = "self";
        } else {
          var bubble = this.rivalBubblePool.get();
          bubble || (bubble = cc.instantiate(this.bubblePrefab));
          bubble.getComponent(cc.Sprite).spriteFrame = this.bubbleSpriteFrame[i];
          var pos = cc.p(x, y);
          bubble.type = "rival";
        }
        bubble.parent = this.node;
        bubble.setPosition(pos);
        var moveTo = cc.moveTo(3, cc.p(0, y));
        var callFunc = cc.callFunc(this.removeSprite, bubble, this);
        var seq = cc.sequence(moveTo, callFunc);
        bubble.runAction(seq);
      },
      removeSprite: function removeSprite(target) {
        "self" === target.type ? Game.BubbleManager.selfBubblePool.put(target) : Game.BubbleManager.rivalBubblePool.put(target);
      }
    });
    cc._RF.pop();
  }, {} ],
  clickManager: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "13875+huS5KNrrGiVKb/PUd", "clickManager");
    "use strict";
    var mvs = require("Matchvs");
    cc.Class({
      extends: cc.Component,
      properties: {
        choiceBoxPrefab: {
          default: null,
          type: cc.Prefab
        }
      },
      onLoad: function onLoad() {
        Game.ClickManager = this;
        this.curSelec = null;
        this.arrMap = [];
        this.bClick = false;
        this.arrPath = [];
        this.setChoiceBox();
        this.jump = cc.repeatForever(cc.sequence(cc.moveBy(1, 0, 5), cc.moveBy(.5, 0, -5)));
      },
      setArrMap: function setArrMap(arrMap) {
        this.arrMap = arrMap;
      },
      setChoiceBox: function setChoiceBox() {
        this.choiceBox = cc.instantiate(this.choiceBoxPrefab);
        this.choiceBox.parent = this.node;
        this.choiceBox.setPosition(cc.p(0, 0));
        this.choiceBox.setLocalZOrder(100);
        this.choiceBox.opacity = 0;
      },
      clickBlock: function clickBlock(block) {
        if (!this.bClick) return;
        if (null === this.curSelec) {
          this.curSelec = block;
          this.setJump(block);
        } else if (block !== this.curSelec) if (this.link(this.curSelec, block)) {
          this.setStop(this.curSelec);
          this.sendEliminateBlock(this.curSelec, block, this.arrPath);
          this.choiceBox.opacity = 0;
        } else {
          this.setStop(this.curSelec);
          this.curSelec = block;
          this.setJump(block);
        }
      },
      setJump: function setJump(block) {
        block.runAction(this.jump);
        var pos = block.getPosition();
        this.choiceBox.setPosition(pos);
        this.choiceBox.opacity = 255;
      },
      setStop: function setStop(block) {
        block.stopAllActions();
        var pos = this.arrMap[block.row][block.col].pos;
        block.setPosition(pos);
        this.choiceBox.opacity = 0;
      },
      link: function link(first, last) {
        if (first.type !== last.type) return false;
        this.arrPath = [];
        if (this.straightLine(first, last)) {
          this.pushPath(first);
          this.pushPath(last);
          return true;
        }
        var corner = {
          row: first.row,
          col: last.col
        };
        if (null === this.arrMap[corner.row][corner.col].type && this.straightLine(first, corner) && this.straightLine(corner, last)) {
          this.pushPath(first);
          this.pushPath(corner);
          this.pushPath(last);
          return true;
        }
        corner = {
          row: last.row,
          col: first.col
        };
        if (null === this.arrMap[corner.row][corner.col].type && this.straightLine(first, corner) && this.straightLine(corner, last)) {
          this.pushPath(first);
          this.pushPath(corner);
          this.pushPath(last);
          return true;
        }
        var arrFirstRow = [];
        var arrLastRow = [];
        this.expandRow(first, arrFirstRow);
        this.expandRow(last, arrLastRow);
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = void 0;
        try {
          for (var _iterator = arrFirstRow[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var firstEx = _step.value;
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = void 0;
            try {
              for (var _iterator3 = arrLastRow[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var lastEx = _step3.value;
                if (firstEx.row === lastEx.row && this.straightLine(lastEx, firstEx)) {
                  this.pushPath(first);
                  this.pushPath(firstEx);
                  this.pushPath(lastEx);
                  this.pushPath(last);
                  return true;
                }
              }
            } catch (err) {
              _didIteratorError3 = true;
              _iteratorError3 = err;
            } finally {
              try {
                !_iteratorNormalCompletion3 && _iterator3.return && _iterator3.return();
              } finally {
                if (_didIteratorError3) throw _iteratorError3;
              }
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            !_iteratorNormalCompletion && _iterator.return && _iterator.return();
          } finally {
            if (_didIteratorError) throw _iteratorError;
          }
        }
        var arrFirstCol = [];
        var arrLastCol = [];
        this.expandCol(first, arrFirstCol);
        this.expandCol(last, arrLastCol);
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = void 0;
        try {
          for (var _iterator2 = arrFirstCol[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _firstEx = _step2.value;
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = void 0;
            try {
              for (var _iterator4 = arrLastCol[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                var _lastEx = _step4.value;
                if (_firstEx.col === _lastEx.col && this.straightLine(_lastEx, _firstEx)) {
                  this.pushPath(first);
                  this.pushPath(_firstEx);
                  this.pushPath(_lastEx);
                  this.pushPath(last);
                  return true;
                }
              }
            } catch (err) {
              _didIteratorError4 = true;
              _iteratorError4 = err;
            } finally {
              try {
                !_iteratorNormalCompletion4 && _iterator4.return && _iterator4.return();
              } finally {
                if (_didIteratorError4) throw _iteratorError4;
              }
            }
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            !_iteratorNormalCompletion2 && _iterator2.return && _iterator2.return();
          } finally {
            if (_didIteratorError2) throw _iteratorError2;
          }
        }
        return false;
      },
      straightLine: function straightLine(first, last) {
        if (first.row === last.row) {
          var col1 = Math.min(first.col, last.col);
          var col2 = Math.max(first.col, last.col);
          var flag = true;
          for (var col = col1 + 1; col < col2; col++) if (null !== this.arrMap[first.row][col].type) {
            flag = false;
            this.arrPath = [];
            break;
          }
        }
        if (flag) return true;
        if (first.col === last.col) {
          var row1 = Math.min(first.row, last.row);
          var row2 = Math.max(first.row, last.row);
          flag = true;
          for (var row = row1 + 1; row < row2; row++) if (null !== this.arrMap[row][first.col].type) {
            flag = false;
            this.arrPath = [];
            break;
          }
        }
        if (flag) return true;
        return false;
      },
      expandRow: function expandRow(sprite, array) {
        for (var row = sprite.row + 1; row < 8; row++) {
          if (null !== this.arrMap[row][sprite.col].type) break;
          var data = {
            row: row,
            col: sprite.col
          };
          array.push(data);
        }
        for (var _row = sprite.row - 1; _row >= 0; _row--) {
          if (null !== this.arrMap[_row][sprite.col].type) break;
          var _data = {
            row: _row,
            col: sprite.col
          };
          array.push(_data);
        }
      },
      expandCol: function expandCol(sprite, array) {
        for (var col = sprite.col + 1; col < 9; col++) {
          if (null !== this.arrMap[sprite.row][col].type) break;
          var data = {
            row: sprite.row,
            col: col
          };
          array.push(data);
        }
        for (var _col = sprite.col - 1; _col >= 0; _col--) {
          if (null !== this.arrMap[sprite.row][_col].type) break;
          var _data2 = {
            row: sprite.row,
            col: _col
          };
          array.push(_data2);
        }
      },
      sendEliminateBlock: function sendEliminateBlock(first, last, arrPath) {
        var id = Game.PlayerManager.self.playerId;
        Game.GameManager.gameState !== GameState.Over && mvs.engine.sendFrameEvent(JSON.stringify({
          action: GLB.DELETE_BLOCK,
          firstPos: {
            row: first.row,
            col: first.col
          },
          lastPos: {
            row: last.row,
            col: last.col
          },
          playerId: id,
          arrPath: arrPath
        }));
        this.curSelec = null;
      },
      pushPath: function pushPath(obj) {
        var data = {
          row: obj.row,
          col: obj.col
        };
        this.arrPath.push(data);
      },
      curBlocBeDelete: function curBlocBeDelete(obj) {
        if (null === this.curSelec) return;
        if (obj.row === this.curSelec.row && obj.col === this.curSelec.col) {
          this.curSelec = null;
          this.choiceBox.opacity = 0;
        }
      }
    });
    cc._RF.pop();
  }, {
    Matchvs: "Matchvs"
  } ],
  clientEvent: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "771d9tmDfZB9b/EtuKXDtNa", "clientEvent");
    "use strict";
    window.clientEvent = {
      eventType: {
        openUI: "openUI",
        closeUI: "closeUI",
        refreshSlateBtn: "refreshSlateBtn",
        roundStart: "roundStart",
        roundOver: "roundOver",
        gameStart: "gameStart",
        gameOver: "gameOver",
        nextRound: "nextRound",
        setScoreProgressBar: "setScoreProgressBar",
        getReconnectionData: "getReconnectionData",
        setReconnectionData: "setReconnectionData",
        setCount: "setCount",
        updateMap: "updateMap",
        checkLcon: "checkLcon",
        playerAccountGet: "playerAccountGet",
        initResponse: "initResponse",
        errorResponse: "errorResponse",
        joinRoomResponse: "joinRoomResponse",
        joinRoomNotify: "joinRoomNotify",
        leaveRoomResponse: "leaveRoomResponse",
        leaveRoomNotify: "leaveRoomNotify",
        leaveRoomMedNotify: "leaveRoomMedNotify",
        joinOverResponse: "joinOverResponse",
        createRoomResponse: "createRoomResponse",
        getRoomListResponse: "getRoomListResponse",
        getRoomDetailResponse: "getRoomDetailResponse",
        getRoomListExResponse: "getRoomListExResponse",
        kickPlayerResponse: "kickPlayerResponse",
        kickPlayerNotify: "kickPlayerNotify"
      },
      eventListener: null
    };
    clientEvent.init = function() {
      clientEvent.eventListener = eventListener.create();
    };
    clientEvent.on = function(eventName, handler, target) {
      if ("string" !== typeof eventName) return;
      clientEvent.eventListener.on(eventName, handler, target);
    };
    clientEvent.off = function(eventName, handler, target) {
      if ("string" !== typeof eventName) return;
      clientEvent.eventListener.off(eventName, handler, target);
    };
    clientEvent.clear = function(target) {
      clientEvent.eventListener.clear(target);
    };
    clientEvent.dispatch = function(eventName, data) {
      if ("string" !== typeof eventName) return;
      clientEvent.eventListener.dispatch(eventName, data);
    };
    cc._RF.pop();
  }, {} ],
  comboManager: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "4f6c6Tr0QNLfoLB3xhfZaoJ", "comboManager");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        comboPrefab: {
          type: cc.Prefab,
          default: null
        }
      },
      start: function start() {
        Game.ComboManager = this;
      },
      addCombo: function addCombo(pos, id) {
        if (id === Game.PlayerManager.self.playerId) {
          if (Game.PlayerManager.self.combo <= 2) return;
          var comboPrefab = cc.instantiate(this.comboPrefab);
          comboPrefab.parent = this.node;
          comboPrefab.setPosition(pos);
          comboPrefab.color = new cc.Color(89, 213, 252);
          comboPrefab.getComponent(cc.Label).string = "combo" + (Game.PlayerManager.self.combo - 2);
        } else {
          if (Game.PlayerManager.rival.combo <= 2) return;
          var comboPrefab = cc.instantiate(this.comboPrefab);
          comboPrefab.parent = this.node;
          comboPrefab.setPosition(pos);
          comboPrefab.color = new cc.Color(245, 100, 100);
          comboPrefab.getComponent(cc.Label).string = "combo" + (Game.PlayerManager.rival.combo - 2);
        }
        var moveBy = cc.moveBy(.5, cc.p(0, 20));
        var callFunc = cc.callFunc(this.comboDelete, comboPrefab);
        var seq = cc.sequence(moveBy, callFunc);
        comboPrefab.runAction(seq);
      },
      comboDelete: function comboDelete(combo) {
        combo.destroy();
      }
    });
    cc._RF.pop();
  }, {} ],
  dataManager: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "47361WkdL5OjqoTHACnI5I8", "dataManager");
    "use strict";
    window.dataManager = {};
    window.dataManager.layoutDtMgr = require("layoutDt");
    cc._RF.pop();
  }, {
    layoutDt: "layoutDt"
  } ],
  electric: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "7653200bg9A47rd09KwiiAC", "electric");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        time: 0
      },
      start: function start() {
        this.scheduleOnce(this.playAnim, this.time);
      },
      playAnim: function playAnim() {
        this.node.getComponent(cc.Animation).play("electric");
      }
    });
    cc._RF.pop();
  }, {} ],
  eventListenerSelf: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "359bao5dhlF44Q44k+/qNRI", "eventListenerSelf");
    "use strict";
    window.eventListener = {};
    var oneToMultiListener = {};
    oneToMultiListener.on = function(eventName, handler, target) {
      var handlerList = this.handlers[eventName];
      if (!handlerList) {
        handlerList = [];
        this.handlers[eventName] = handlerList;
      }
      for (var i = 0; i < handlerList.length; i++) if (!handlerList[i]) {
        handlerList[i].handler = handler;
        handlerList[i].target = target;
        return i;
      }
      handlerList.push({
        handler: handler,
        target: target
      });
      return handlerList.length;
    };
    oneToMultiListener.dispatch = function(eventName, data) {
      var handlerList = this.handlers[eventName];
      if (!handlerList) return;
      var len = handlerList.length;
      for (var i = 0; i < len; i++) if (handlerList[i]) {
        var handler = handlerList[i].handler;
        var target = handlerList[i].target;
        if (handler) try {
          target ? handler.call(target, data) : handler(data);
        } catch (e) {
          console.error(e);
        }
      }
    };
    oneToMultiListener.off = function(eventName, handler, target) {
      var handlerList = this.handlers[eventName];
      if (!handlerList) return;
      for (var i = 0; i < handlerList.length; i++) {
        var oldHandler = handlerList[i].handler;
        var oldTarget = handlerList[i].target;
        if (oldHandler === handler && oldTarget === target) {
          handlerList.splice(i, 1);
          break;
        }
      }
    };
    oneToMultiListener.clear = function(target) {
      for (var eventName in this.handlers) {
        var handlerList = this.handlers[eventName];
        for (var i = 0; i < handlerList.length; i++) {
          var oldTarget = handlerList[i].target;
          oldTarget === target && handlerList.splice(i, 1);
        }
      }
    };
    eventListener.create = function() {
      var newEventListener = Object.create(oneToMultiListener);
      newEventListener.handlers = {};
      return newEventListener;
    };
    cc._RF.pop();
  }, {} ],
  gameManager: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "71befhMjOZLK4kQqOY4yNmZ", "gameManager");
    "use strict";
    var mvs = require("Matchvs");
    cc.Class({
      extends: cc.Component,
      properties: {
        uiTip: {
          type: cc.Prefab,
          default: null
        }
      },
      blockInput: function blockInput() {
        Game.GameManager.getComponent(cc.BlockInputEvents).enabled = true;
        setTimeout(function() {
          Game.GameManager.node.getComponent(cc.BlockInputEvents).enabled = false;
        }, 1e3);
      },
      onLoad: function onLoad() {
        Game.GameManager = this;
        cc.game.addPersistRootNode(this.node);
        cc.director.getCollisionManager().enabled = true;
        clientEvent.init();
        dataFunc.loadConfigs();
        cc.view.enableAutoFullScreen(false);
        clientEvent.on(clientEvent.eventType.gameOver, this.gameOver, this);
        clientEvent.on(clientEvent.eventType.leaveRoomNotify, this.leaveRoom, this);
        this.bUiReconnection = true;
        this.bReconnect = false;
        this.bExit = true;
        this.number = 0;
        this.start_game_time = new Date().getTime();
        this.network = window.network;
        this.network.chooseNetworkMode();
        this.findPlayerByAccountListener();
        this.getUserInfoFromRank();
        this.uiTipBk = cc.instantiate(this.uiTip);
        this.uiTipBk.parent = this.node;
        this.uiTipBk.active = false;
        window.BK && BK.Audio.switch && (BK.Audio.switch = false);
        this.schedule(this.checkLcon, 2);
      },
      checkLcon: function checkLcon() {
        clientEvent.dispatch(clientEvent.eventType.checkLcon);
      },
      leaveRoom: function leaveRoom(data) {
        if (this.gameState === GameState.Play) {
          data.leaveRoomInfo.userId !== GLB.userInfo.id && (this.isRivalLeave = true);
          clientEvent.dispatch(clientEvent.eventType.leaveRoomMedNotify, this.leaveRoom, this);
          this.gameOver();
        }
      },
      gameOver: function gameOver() {
        console.log("\u6e38\u620f\u7ed3\u675f");
        var gamePanel = uiFunc.findUI("uiGamePanel");
        if (gamePanel && Game.GameManager.gameState !== GameState.Over) {
          Game.GameManager.gameState = GameState.Over;
          this.readyCnt = 0;
          setTimeout(function() {
            clientEvent.dispatch(clientEvent.eventType.gameOver);
          }.bind(this), 1500);
          setTimeout(function() {
            uiFunc.openUI("uiVsResultVer");
          }.bind(this), 3e3);
        }
      },
      matchVsInit: function matchVsInit() {
        mvs.response.initResponse = this.initResponse.bind(this);
        mvs.response.errorResponse = this.errorResponse.bind(this);
        mvs.response.joinRoomResponse = this.joinRoomResponse.bind(this);
        mvs.response.joinRoomNotify = this.joinRoomNotify.bind(this);
        mvs.response.leaveRoomResponse = this.leaveRoomResponse.bind(this);
        mvs.response.leaveRoomNotify = this.leaveRoomNotify.bind(this);
        mvs.response.joinOverResponse = this.joinOverResponse.bind(this);
        mvs.response.createRoomResponse = this.createRoomResponse.bind(this);
        mvs.response.getRoomListResponse = this.getRoomListResponse.bind(this);
        mvs.response.getRoomDetailResponse = this.getRoomDetailResponse.bind(this);
        mvs.response.getRoomListExResponse = this.getRoomListExResponse.bind(this);
        mvs.response.kickPlayerResponse = this.kickPlayerResponse.bind(this);
        mvs.response.kickPlayerNotify = this.kickPlayerNotify.bind(this);
        mvs.response.registerUserResponse = this.registerUserResponse.bind(this);
        mvs.response.loginResponse = this.loginResponse.bind(this);
        mvs.response.logoutResponse = this.logoutResponse.bind(this);
        mvs.response.sendEventNotify = this.sendEventNotify.bind(this);
        mvs.response.frameUpdate = this.frameUpdate.bind(this);
        mvs.response.setFrameSyncResponse = this.setFrameSyncResponse.bind(this);
        mvs.response.reconnectResponse = this.reconnectResponse.bind(this);
        mvs.response.networkStateNotify = this.networkStateNotify.bind(this);
        var result = mvs.engine.init(mvs.response, GLB.channel, GLB.platform, GLB.gameId);
        0 !== result && console.log("\u521d\u59cb\u5316\u5931\u8d25,\u9519\u8bef\u7801:" + result);
        Game.GameManager.blockInput();
        this.loginServer();
      },
      networkStateNotify: function networkStateNotify(netNotify) {
        console.log("netNotify");
        console.log("netNotify.owner:" + netNotify.owner);
        console.log("\u73a9\u5bb6\uff1a" + netNotify.userID + " state:" + netNotify.state);
        if (this.gameState === GameState.Play) {
          GLB.isRoomOwner = true;
          if (1 === netNotify.state) uiFunc.openUI("uiTip", function(obj) {
            var uiTip = obj.getComponent("uiTip");
            uiTip && uiTip.setData("\u5bf9\u624b\u79bb\u5f00\u4e86\u6e38\u620f");
          }); else if (3 === netNotify.state) {
            var data = {
              leaveRoomInfo: netNotify
            };
            clientEvent.dispatch(clientEvent.eventType.leaveRoomNotify, data);
          }
        }
        clientEvent.dispatch(clientEvent.eventType.leaveRoomMedNotify, netNotify);
      },
      kickPlayerNotify: function kickPlayerNotify(_kickPlayerNotify) {
        var data = {
          kickPlayerNotify: _kickPlayerNotify
        };
        clientEvent.dispatch(clientEvent.eventType.kickPlayerNotify, data);
      },
      kickPlayerResponse: function kickPlayerResponse(kickPlayerRsp) {
        if (200 !== kickPlayerRsp.status) {
          console.log("\u5931\u8d25kickPlayerRsp:" + kickPlayerRsp);
          return;
        }
        var data = {
          kickPlayerRsp: kickPlayerRsp
        };
        clientEvent.dispatch(clientEvent.eventType.kickPlayerResponse, data);
      },
      getRoomListExResponse: function getRoomListExResponse(rsp) {
        if (200 !== rsp.status) {
          console.log("\u5931\u8d25 rsp:" + rsp);
          return;
        }
        var data = {
          rsp: rsp
        };
        clientEvent.dispatch(clientEvent.eventType.getRoomListExResponse, data);
      },
      getRoomDetailResponse: function getRoomDetailResponse(rsp) {
        if (200 !== rsp.status) {
          console.log("\u5931\u8d25 rsp:" + rsp);
          return;
        }
        var data = {
          rsp: rsp
        };
        cc.log(data.rsp.userInfos);
        clientEvent.dispatch(clientEvent.eventType.getRoomDetailResponse, data);
      },
      getRoomListResponse: function getRoomListResponse(status, roomInfos) {
        if (200 !== status) {
          console.log("\u5931\u8d25 status:" + status);
          return;
        }
        var data = {
          status: status,
          roomInfos: roomInfos
        };
        clientEvent.dispatch(clientEvent.eventType.getRoomListResponse, data);
      },
      createRoomResponse: function createRoomResponse(rsp) {
        if (200 !== rsp.status) {
          console.log("\u5931\u8d25 createRoomResponse:" + rsp);
          return;
        }
        var data = {
          rsp: rsp
        };
        clientEvent.dispatch(clientEvent.eventType.createRoomResponse, data);
      },
      joinOverResponse: function joinOverResponse(joinOverRsp) {
        if (200 !== joinOverRsp.status) {
          console.log("\u5931\u8d25 joinOverRsp:" + joinOverRsp);
          return;
        }
        var data = {
          joinOverRsp: joinOverRsp
        };
        clientEvent.dispatch(clientEvent.eventType.joinOverResponse, data);
      },
      joinRoomResponse: function joinRoomResponse(status, roomUserInfoList, roomInfo) {
        if (200 !== status) {
          console.log("\u5931\u8d25 joinRoomResponse:" + status);
          return;
        }
        var data = {
          status: status,
          roomUserInfoList: roomUserInfoList,
          roomInfo: roomInfo
        };
        clientEvent.dispatch(clientEvent.eventType.joinRoomResponse, data);
      },
      joinRoomNotify: function joinRoomNotify(roomUserInfo) {
        var data = {
          roomUserInfo: roomUserInfo
        };
        console.log("GameManager.joinRoomNotify");
        clientEvent.dispatch(clientEvent.eventType.joinRoomNotify, data);
      },
      leaveRoomResponse: function leaveRoomResponse(leaveRoomRsp) {
        if (200 !== leaveRoomRsp.status) {
          console.log("\u5931\u8d25 leaveRoomRsp:" + leaveRoomRsp);
          return;
        }
        var data = {
          leaveRoomRsp: leaveRoomRsp
        };
        clientEvent.dispatch(clientEvent.eventType.leaveRoomResponse, data);
      },
      leaveRoomNotify: function leaveRoomNotify(leaveRoomInfo) {
        var data = {
          leaveRoomInfo: leaveRoomInfo
        };
        clientEvent.dispatch(clientEvent.eventType.leaveRoomNotify, data);
      },
      logoutResponse: function logoutResponse(status) {
        Game.GameManager.network.disconnect();
        cc.game.removePersistRootNode(this.node);
        cc.director.loadScene("lobby");
      },
      errorResponse: function errorResponse(error, msg) {
        if (406 === error || 405 === error) return;
        var recurLobby = true;
        this.openTip("\u7f51\u7edc\u8fde\u63a5\u4e2d\u65ad");
        this.gameState === GameState.Play && (GLB.isRoomOwner = false);
        console.log("\u9519\u8bef\u4fe1\u606f\uff1a" + error);
        console.log("\u9519\u8bef\u4fe1\u606f\uff1a" + msg);
        if (1001 === error || 0 === error) {
          var gamePanel = uiFunc.findUI("uiGamePanel");
          if (gamePanel) {
            if (this.bUiReconnection) {
              this.bUiReconnection = false;
              Game.GameManager.gameState = GameState.None;
              this.schedule(this.reconnectCountDown, 1);
            }
            recurLobby = false;
            cc.log("\u6e38\u620f\u754c\u9762\u5b58\u5728");
          }
          recurLobby && setTimeout(function() {
            this.recurLobby();
          }.bind(this), 2e3);
        }
      },
      openTip: function openTip(string) {
        var uiTip = cc.instantiate(this.uiTipBk);
        uiTip.active = true;
        uiTip.parent = cc.Canvas.instance.node;
        uiTip.getComponent("uiTip").setData(string);
        uiTip.setPosition(cc.p(0, 0));
      },
      reconnectCountDown: function reconnectCountDown() {
        this.number++;
        cc.log("\u5f53\u524d\u65ad\u7ebf\u91cd\u8fde\u8ba1\u6570:" + this.number);
        mvs.engine.reconnect();
        this.number >= 15 && this.stopReconnectCountDown(false);
      },
      stopReconnectCountDown: function stopReconnectCountDown(success) {
        this.number = 0;
        this.unschedule(this.reconnectCountDown);
        success || setTimeout(function() {
          this.recurLobby();
        }.bind(this), 2e3);
      },
      reconnect: function reconnect() {
        if (this.bReconnect) return;
        uiFunc.openUI("uiTip", function(obj) {
          var uiTip = obj.getComponent("uiTip");
          uiTip && uiTip.setData("\u65e0\u6cd5\u83b7\u53d6\u623f\u95f4\u4fe1\u606f\uff0c\u4e0d\u80fd\u8fdb\u884c\u91cd\u65b0\u8fde\u63a5");
        });
        var gamePanel = uiFunc.findUI("uiGamePanel");
        if (gamePanel) {
          uiFunc.closeUI("uiGamePanel");
          gamePanel.destroy();
        }
        this.recurLobby();
      },
      reconnectResponse: function reconnectResponse(status, roomUserInfoList, roomInfo) {
        if (200 === status) {
          cc.log("\u91cd\u65b0\u8fde\u63a5\u6210\u529f" + status);
          cc.log("\u91cd\u8fde\u73a9\u5bb6\u4fe1\u606f" + GLB.userInfo.id);
          Game.GameManager.network.connect(GLB.IP, GLB.PORT, function() {});
          if (roomUserInfoList.length <= 0) {
            cc.log("\u65e0\u6cd5\u83b7\u53d6\u623f\u95f4\u4fe1\u606f\uff0c\u4e0d\u80fd\u8fdb\u884c\u91cd\u65b0\u8fde\u63a5");
            this.stopReconnectCountDown(false);
            uiFunc.openUI("uiTip", function(obj) {
              var uiTip = obj.getComponent("uiTip");
              uiTip && uiTip.setData("\u65e0\u6cd5\u83b7\u53d6\u623f\u95f4\u4fe1\u606f\uff0c\u4e0d\u80fd\u8fdb\u884c\u91cd\u65b0\u8fde\u63a5");
            });
            this.scheduleOnce(this.recurLobby(), 2);
            return;
          }
          this.stopReconnectCountDown(true);
          uiFunc.openUI("uiTip", function(obj) {
            var uiTip = obj.getComponent("uiTip");
            uiTip && uiTip.setData("\u6b63\u5728\u91cd\u65b0\u8fde\u63a5");
          });
          var gamePanel = uiFunc.findUI("uiGamePanel");
          if (gamePanel) {
            cc.log("\u6e38\u620f\u754c\u9762\u5df2\u5b58\u5728");
            mvs.engine.sendFrameEvent(JSON.stringify({
              action: GLB.GET_GAME_DATA,
              playerId: GLB.userInfo.id
            }));
          } else {
            cc.log("\u6e38\u620f\u754c\u9762\u4e0d\u5b58\u5728");
            cc.director.loadScene("game", function() {
              uiFunc.openUI("uiGamePanel", function() {
                mvs.engine.getRoomDetail(roomInfo.roomID);
                mvs.engine.sendFrameEvent(JSON.stringify({
                  action: GLB.GET_GAME_DATA,
                  playerId: GLB.userInfo.id
                }));
              }.bind(this));
            }.bind(this));
          }
          this.bUiReconnection = true;
        } else {
          cc.log("\u91cd\u65b0\u8fde\u63a5\u5931\u8d25" + status);
          uiFunc.openUI("uiTip", function(obj) {
            var uiTip = obj.getComponent("uiTip");
            uiTip && uiTip.setData("\u60a8\u5df2\u7ecf\u79bb\u5f00\u623f\u95f4");
          });
          this.stopReconnectCountDown(false);
        }
      },
      recurLobby: function recurLobby() {
        mvs.engine.logout("");
        setTimeout(function() {
          cc.game.removePersistRootNode(this.node);
          cc.director.loadScene("lobby");
        }.bind(this), 1500);
      },
      initResponse: function initResponse() {
        console.log("\u521d\u59cb\u5316\u6210\u529f\uff0c\u5f00\u59cb\u6ce8\u518c\u7528\u6237");
        var result = mvs.engine.registerUser();
        0 !== result ? console.log("\u6ce8\u518c\u7528\u6237\u5931\u8d25\uff0c\u9519\u8bef\u7801:" + result) : console.log("\u6ce8\u518c\u7528\u6237\u6210\u529f");
      },
      registerUserResponse: function registerUserResponse(userInfo) {
        var deviceId = "abcdef";
        var gatewayId = 0;
        GLB.userInfo = userInfo;
        console.log("\u5f00\u59cb\u767b\u5f55,\u7528\u6237Id:" + userInfo.id);
        var result = mvs.engine.login(userInfo.id, userInfo.token, GLB.gameId, GLB.gameVersion, GLB.appKey, GLB.secret, deviceId, gatewayId);
        0 !== result && console.log("\u767b\u5f55\u5931\u8d25,\u9519\u8bef\u7801:" + result);
      },
      loginResponse: function loginResponse(info) {
        if (200 !== info.status) console.log("\u767b\u5f55\u5931\u8d25,\u5f02\u6b65\u56de\u8c03\u9519\u8bef\u7801:" + info.status); else {
          console.log("\u767b\u5f55\u6210\u529f");
          null !== info.roomID && "0" !== info.roomID ? mvs.engine.reconnect() : this.lobbyShow();
        }
      },
      lobbyShow: function lobbyShow() {
        this.gameState = GameState.None;
        cc.Canvas.instance.designResolution.height > cc.Canvas.instance.designResolution.width ? uiFunc.openUI("uiLobbyPanelVer") : uiFunc.openUI("uiLobbyPanel");
      },
      sendEventNotify: function sendEventNotify(info) {
        var cpProto = JSON.parse(info.cpProto);
        if (info.cpProto.indexOf(GLB.GAME_START_EVENT) >= 0) {
          GLB.playerUserIds = [ GLB.userInfo.id ];
          var remoteUserIds = JSON.parse(info.cpProto).userIds;
          remoteUserIds.forEach(function(id) {
            GLB.userInfo.id !== id && GLB.playerUserIds.push(id);
          });
          this.startGame();
        }
        info.cpProto.indexOf(GLB.GAME_OVER_EVENT) >= 0 && this.gameOver();
        if (info.cpProto.indexOf(GLB.READY) >= 0) {
          this.readyCnt++;
          GLB.isRoomOwner && this.readyCnt >= GLB.playerUserIds.length && this.sendRoundStartMsg();
        }
        if (info.cpProto.indexOf(GLB.ROUND_START) >= 0) {
          setTimeout(function() {
            Game.GameManager.gameState = GameState.Play;
          }.bind(this), 2e3);
          if (true === GLB.syncFrame && true === GLB.isRoomOwner) {
            var result = mvs.engine.setFrameSync(GLB.FRAME_RATE);
            0 !== result && console.log("\u8bbe\u7f6e\u5e27\u540c\u6b65\u7387\u5931\u8d25,\u9519\u8bef\u7801:" + result);
          }
          clientEvent.dispatch(clientEvent.eventType.roundStart);
        }
      },
      frameUpdate: function frameUpdate(rsp) {
        for (var i = 0; i < rsp.frameItems.length; i++) {
          if (Game.GameManager.gameState === GameState.Over) return;
          var info = rsp.frameItems[i];
          var cpProto = JSON.parse(info.cpProto);
          info.cpProto.indexOf(GLB.INITMAP) >= 0 && Game.BlockManager.receiveArrMap(cpProto.array);
          info.cpProto.indexOf(GLB.DELETE_BLOCK) >= 0 && Game.BlockManager.deleteBlock(cpProto.firstPos, cpProto.lastPos, cpProto.playerId, cpProto.arrPath);
          info.cpProto.indexOf(GLB.BUBBLE) >= 0 && Game.BubbleManager.initBubble(cpProto.type, cpProto.id);
          info.cpProto.indexOf(GLB.TIME_OUT) >= 0 && Game.BlockManager.nextRound();
          if (info.cpProto.indexOf(GLB.GET_GAME_DATA) >= 0) {
            if (GLB.userInfo.id === cpProto.playerId) {
              this.bReconnect = false;
              this.scheduleOnce(this.reconnect, 3);
            }
            if (GLB.userInfo.id !== cpProto.playerId) {
              cc.log("\u7cbe\u7075\u5e27\uff0c\u51c6\u5907\u83b7\u53d6\u672a\u65ad\u7ebf\u73a9\u5bb6\u6570\u636e");
              clientEvent.dispatch(clientEvent.eventType.getReconnectionData);
            }
          }
          if (info.cpProto.indexOf(GLB.RECONNECTION_DATA) >= 0) {
            cpProto.playerId === GLB.userInfo.id && uiFunc.openUI("uiTip", function(obj) {
              var uiTip = obj.getComponent("uiTip");
              uiTip && uiTip.setData("\u5bf9\u624b\u91cd\u65b0\u8fde\u63a5");
            });
            if (cpProto.playerId !== GLB.userInfo.id) {
              uiFunc.openUI("uiTip", function(obj) {
                var uiTip = obj.getComponent("uiTip");
                uiTip && uiTip.setData("\u91cd\u65b0\u8fde\u63a5\u6210\u529f");
              });
              Game.GameManager.network.connect(GLB.IP, GLB.PORT, function() {});
            }
            clientEvent.dispatch(clientEvent.eventType.setReconnectionData, cpProto);
          }
        }
        if (Game.GameManager.gameState === GameState.Play) {
          Game.PlayerManager.self.buffTime();
          Game.PlayerManager.rival.buffTime();
        }
      },
      sendReadyMsg: function sendReadyMsg() {
        var msg = {
          action: GLB.READY
        };
        this.sendEventEx(msg);
      },
      sendRoundStartMsg: function sendRoundStartMsg() {
        var msg = {
          action: GLB.ROUND_START
        };
        this.sendEventEx(msg);
      },
      sendEventEx: function sendEventEx(msg) {
        var result = mvs.engine.sendEventEx(0, JSON.stringify(msg), 0, GLB.playerUserIds);
        0 !== result.result && console.log(msg.action, result.result);
      },
      sendEvent: function sendEvent(msg) {
        var result = mvs.engine.sendEvent(JSON.stringify(msg));
        0 !== result.result && console.log(msg.action, result.result);
      },
      startGame: function startGame() {
        this.readyCnt = 0;
        this.isRivalLeave = false;
        cc.director.loadScene("game", function() {
          uiFunc.openUI("uiGamePanel", function() {
            this.sendReadyMsg();
          }.bind(this));
        }.bind(this));
      },
      setFrameSyncResponse: function setFrameSyncResponse(rsp) {
        200 !== rsp.mStatus ? console.log("\u8bbe\u7f6e\u540c\u6b65\u5e27\u7387\u5931\u8d25\uff0cstatus=" + rsp.status) : console.log("\u8bbe\u7f6e\u540c\u6b65\u5e27\u7387\u6210\u529f, \u5e27\u7387\u4e3a:" + GLB.FRAME_RATE);
      },
      findPlayerByAccountListener: function findPlayerByAccountListener() {
        this.network.on("connector.entryHandler.findPlayerByAccount", function(recvMsg) {
          clientEvent.dispatch(clientEvent.eventType.playerAccountGet, recvMsg);
        });
      },
      loginServer: function loginServer() {
        if (!this.network.isConnected()) try {
          this.network.connect(GLB.IP, GLB.PORT, function() {
            this.network.send("connector.entryHandler.login", {
              account: GLB.userInfo.id + "",
              channel: "0",
              userName: GLB.nickName ? GLB.nickName : GLB.userInfo.id + "",
              headIcon: GLB.avatarUrl ? GLB.avatarUrl : "-"
            });
          }.bind(this));
        } catch (e) {}
      },
      getUserInfoFromRank: function getUserInfoFromRank() {
        if (window.BK) {
          var attr = "score";
          var order = 1;
          var rankType = 0;
          BK.QQ.getRankListWithoutRoom(attr, order, rankType, function(errCode, cmd, data) {
            var isContainSelf = false;
            if (data) for (var i = 0; i < data.data.ranking_list.length; ++i) {
              var rd = data.data.ranking_list[i];
              if (rd.selfFlag) {
                isContainSelf = true;
                GLB.avatarUrl = rd.url;
                GLB.nickName = rd.nick;
                break;
              }
            }
            isContainSelf || this.setRankData(Number.MAX_SAFE_INTEGER, function() {
              this.getUserInfoFromRank();
            }.bind(this));
          }.bind(this));
        }
      },
      userInfoReq: function userInfoReq(userId) {
        Game.GameManager.network.isConnected() ? Game.GameManager.network.send("connector.entryHandler.findPlayerByAccount", {
          account: userId + ""
        }) : Game.GameManager.network.connect(GLB.IP, GLB.PORT, function() {
          Game.GameManager.network.send("connector.entryHandler.login", {
            account: GLB.userInfo.id + "",
            channel: "0",
            userName: GLB.nickName ? GLB.nickName : GLB.userInfo.id + "",
            headIcon: GLB.avatarUrl ? GLB.avatarUrl : "-"
          });
          setTimeout(function() {
            Game.GameManager.network.send("connector.entryHandler.findPlayerByAccount", {
              account: userId + ""
            });
          }, 200);
        });
      },
      getRankData: function getRankData(callback) {
        if (!window.BK) return;
        var attr = "score";
        var order = 1;
        var rankType = 0;
        BK.QQ.getRankListWithoutRoom(attr, order, rankType, function(errCode, cmd, data) {
          BK.Script.log(1, 1, "getRankListWithoutRoom callback  cmd" + cmd + " errCode:" + errCode + "  data:" + JSON.stringify(data));
          if (0 !== errCode) {
            BK.Script.log(1, 1, "\u83b7\u53d6\u6392\u884c\u699c\u6570\u636e\u5931\u8d25!\u9519\u8bef\u7801\uff1a" + errCode);
            return;
          }
          var isContainSelf = false;
          if (data) {
            for (var i = 0; i < data.data.ranking_list.length; ++i) {
              var rd = data.data.ranking_list[i];
              rd.selfFlag && (isContainSelf = true);
            }
            callback && callback(data.data.ranking_list);
          }
          isContainSelf || this.setRankData(Number.MAX_SAFE_INTEGER);
        });
      },
      setRankData: function setRankData(score, callback) {
        if (!window.BK) return;
        var data = {
          userData: [ {
            openId: GameStatusInfo.openId,
            startMs: this.start_game_time.toString(),
            endMs: new Date().getTime().toString(),
            scoreInfo: {
              score: score
            }
          } ],
          attr: {
            score: {
              type: "rank",
              order: 1
            }
          }
        };
        BK.QQ.uploadScoreWithoutRoom(1, data, function(errCode, cmd, data) {
          0 !== errCode ? BK.Script.log(1, 1, "\u4e0a\u4f20\u5206\u6570\u5931\u8d25!\u9519\u8bef\u7801\uff1a" + errCode) : callback && callback();
        });
      },
      onDestroy: function onDestroy() {
        clientEvent.off(clientEvent.eventType.gameOver, this.gameOver, this);
        clientEvent.off(clientEvent.eventType.leaveRoomNotify, this.leaveRoom, this);
        this.unschedule(this.checkLcon);
      }
    });
    cc._RF.pop();
  }, {
    Matchvs: "Matchvs"
  } ],
  jump: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "b88a1JpUQxKFoF5rSCimCLd", "jump");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {},
      start: function start() {
        var seq = cc.repeatForever(cc.sequence(cc.moveBy(2, 0, 30), cc.moveBy(2, 0, -30)));
        this.node.runAction(seq);
      }
    });
    cc._RF.pop();
  }, {} ],
  layoutDt: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "780d06LFeRAx478q02X3Jf8", "layoutDt");
    "use strict";
    var layoutDtMgr = {
      arrLayoutDt: [ {
        id: 1,
        array: [ [ 0, 3 ], [ 0, 7 ], [ 0, 8 ], [ 1, 0 ], [ 1, 3 ], [ 1, 8 ], [ 2, 0 ], [ 2, 3 ], [ 2, 4 ], [ 2, 5 ], [ 2, 8 ], [ 3, 0 ], [ 3, 3 ], [ 3, 4 ], [ 3, 5 ], [ 3, 8 ], [ 4, 0 ], [ 4, 8 ], [ 5, 0 ], [ 5, 7 ], [ 5, 8 ], [ 6, 0 ], [ 6, 3 ], [ 6, 8 ], [ 7, 3 ], [ 7, 4 ] ]
      }, {
        id: 2,
        array: [ [ 0, 1 ], [ 0, 2 ], [ 0, 6 ], [ 0, 7 ], [ 1, 0 ], [ 1, 2 ], [ 1, 6 ], [ 1, 8 ], [ 2, 0 ], [ 2, 1 ], [ 2, 7 ], [ 2, 8 ], [ 5, 0 ], [ 5, 1 ], [ 5, 7 ], [ 5, 8 ], [ 6, 0 ], [ 6, 2 ], [ 6, 6 ], [ 6, 8 ], [ 7, 1 ], [ 7, 2 ], [ 7, 6 ], [ 7, 7 ] ]
      }, {
        id: 3,
        array: [ [ 0, 2 ], [ 0, 3 ], [ 0, 4 ], [ 0, 5 ], [ 0, 6 ], [ 1, 3 ], [ 1, 4 ], [ 1, 5 ], [ 2, 0 ], [ 2, 8 ], [ 3, 0 ], [ 3, 1 ], [ 3, 7 ], [ 3, 8 ], [ 4, 0 ], [ 4, 1 ], [ 4, 7 ], [ 4, 8 ], [ 5, 0 ], [ 5, 8 ], [ 6, 3 ], [ 6, 4 ], [ 6, 5 ], [ 7, 2 ], [ 7, 3 ], [ 7, 4 ], [ 7, 5 ], [ 7, 6 ] ]
      }, {
        id: 4,
        array: [ [ 0, 0 ], [ 0, 8 ], [ 1, 2 ], [ 1, 4 ], [ 1, 6 ], [ 2, 2 ], [ 2, 4 ], [ 2, 6 ], [ 3, 0 ], [ 3, 8 ], [ 5, 0 ], [ 5, 8 ], [ 6, 0 ], [ 6, 8 ], [ 4, 3 ], [ 4, 4 ], [ 4, 5 ], [ 5, 3 ], [ 5, 4 ], [ 5, 5 ], [ 6, 3 ], [ 6, 4 ], [ 6, 5 ], [ 7, 4 ] ]
      }, {
        id: 5,
        array: [ [ 0, 4 ], [ 1, 0 ], [ 1, 3 ], [ 1, 4 ], [ 1, 8 ], [ 2, 0 ], [ 2, 6 ], [ 2, 7 ], [ 2, 8 ], [ 3, 0 ], [ 3, 5 ], [ 3, 6 ], [ 3, 7 ], [ 3, 8 ], [ 4, 0 ], [ 4, 5 ], [ 4, 6 ], [ 4, 7 ], [ 4, 8 ], [ 5, 0 ], [ 5, 6 ], [ 5, 7 ], [ 5, 8 ], [ 6, 0 ], [ 6, 3 ], [ 6, 4 ], [ 6, 8 ], [ 7, 4 ] ]
      }, {
        id: 6,
        array: [ [ 0, 0 ], [ 0, 8 ], [ 1, 2 ], [ 1, 6 ], [ 4, 0 ], [ 4, 1 ], [ 4, 2 ], [ 4, 3 ], [ 4, 4 ], [ 4, 5 ], [ 4, 6 ], [ 4, 7 ], [ 4, 8 ], [ 5, 2 ], [ 5, 4 ], [ 5, 6 ], [ 6, 0 ], [ 6, 8 ], [ 7, 0 ], [ 7, 1 ], [ 7, 7 ], [ 7, 8 ] ]
      }, {
        id: 7,
        array: [ [ 0, 0 ], [ 0, 1 ], [ 0, 7 ], [ 0, 8 ], [ 1, 0 ], [ 1, 8 ], [ 2, 2 ], [ 2, 3 ], [ 2, 4 ], [ 2, 5 ], [ 2, 6 ], [ 3, 2 ], [ 3, 4 ], [ 3, 6 ], [ 4, 2 ], [ 4, 3 ], [ 4, 4 ], [ 4, 5 ], [ 4, 6 ], [ 5, 0 ], [ 5, 8 ], [ 6, 0 ], [ 6, 1 ], [ 6, 7 ], [ 6, 8 ], [ 7, 2 ], [ 7, 4 ], [ 7, 6 ] ]
      }, {
        id: 8,
        array: [ [ 0, 0 ], [ 0, 1 ], [ 0, 2 ], [ 0, 6 ], [ 0, 7 ], [ 0, 8 ], [ 1, 0 ], [ 1, 1 ], [ 1, 7 ], [ 1, 8 ], [ 2, 0 ], [ 2, 8 ], [ 5, 0 ], [ 5, 8 ], [ 6, 0 ], [ 6, 1 ], [ 6, 7 ], [ 6, 8 ], [ 7, 0 ], [ 7, 1 ], [ 7, 2 ], [ 7, 6 ], [ 7, 7 ], [ 7, 8 ] ]
      }, {
        id: 9,
        array: [ [ 1, 2 ], [ 1, 4 ], [ 1, 6 ], [ 2, 1 ], [ 2, 3 ], [ 2, 5 ], [ 2, 6 ], [ 2, 7 ], [ 3, 2 ], [ 3, 3 ], [ 3, 5 ], [ 3, 7 ], [ 4, 1 ], [ 4, 3 ], [ 4, 4 ], [ 4, 5 ], [ 4, 7 ], [ 5, 2 ], [ 5, 4 ], [ 5, 6 ], [ 6, 1 ], [ 6, 3 ], [ 6, 5 ], [ 6, 7 ] ]
      }, {
        id: 10,
        array: [ [ 2, 0 ], [ 2, 1 ], [ 2, 2 ], [ 2, 6 ], [ 2, 7 ], [ 2, 8 ], [ 3, 0 ], [ 3, 1 ], [ 3, 2 ], [ 4, 2 ], [ 5, 2 ], [ 5, 6 ], [ 5, 7 ], [ 5, 8 ], [ 1, 6 ], [ 1, 7 ], [ 1, 8 ], [ 6, 6 ], [ 6, 7 ], [ 6, 8 ], [ 0, 1 ], [ 0, 7 ], [ 7, 1 ], [ 7, 7 ] ]
      }, {
        id: 11,
        array: [ [ 3, 0 ], [ 3, 1 ], [ 3, 6 ], [ 3, 7 ], [ 3, 8 ], [ 4, 0 ], [ 4, 1 ], [ 5, 0 ], [ 5, 1 ], [ 6, 0 ], [ 6, 1 ], [ 7, 0 ], [ 7, 1 ], [ 7, 6 ], [ 7, 7 ], [ 7, 8 ], [ 5, 6 ], [ 5, 7 ], [ 5, 8 ], [ 3, 2 ], [ 4, 2 ], [ 5, 2 ], [ 6, 2 ], [ 7, 2 ] ]
      }, {
        id: 12,
        array: [ [ 0, 0 ], [ 0, 1 ], [ 0, 2 ], [ 0, 6 ], [ 0, 7 ], [ 0, 8 ], [ 3, 2 ], [ 3, 6 ], [ 4, 2 ], [ 4, 6 ], [ 6, 0 ], [ 6, 1 ], [ 6, 2 ], [ 6, 6 ], [ 6, 7 ], [ 6, 8 ], [ 7, 0 ], [ 7, 1 ], [ 7, 7 ], [ 7, 8 ] ]
      }, {
        id: 13,
        array: [ [ 0, 2 ], [ 0, 3 ], [ 0, 5 ], [ 0, 6 ], [ 1, 2 ], [ 1, 6 ], [ 2, 2 ], [ 2, 6 ], [ 3, 2 ], [ 3, 6 ], [ 5, 0 ], [ 5, 4 ], [ 5, 8 ], [ 6, 0 ], [ 6, 4 ], [ 6, 5 ], [ 6, 8 ], [ 7, 0 ], [ 7, 1 ], [ 7, 3 ], [ 7, 4 ], [ 7, 5 ], [ 7, 7 ], [ 7, 8 ] ]
      }, {
        id: 14,
        array: [ [ 1, 1 ], [ 1, 2 ], [ 1, 3 ], [ 1, 4 ], [ 1, 5 ], [ 1, 6 ], [ 1, 7 ], [ 2, 1 ], [ 2, 7 ], [ 3, 1 ], [ 3, 3 ], [ 3, 4 ], [ 3, 5 ], [ 3, 7 ], [ 4, 1 ], [ 4, 3 ], [ 4, 4 ], [ 4, 5 ], [ 4, 7 ], [ 5, 1 ], [ 5, 7 ], [ 6, 1 ], [ 6, 2 ], [ 6, 3 ], [ 6, 4 ], [ 6, 5 ], [ 6, 6 ], [ 6, 7 ] ]
      }, {
        id: 15,
        array: [ [ 0, 3 ], [ 0, 4 ], [ 0, 5 ], [ 1, 3 ], [ 1, 4 ], [ 1, 5 ], [ 2, 0 ], [ 2, 4 ], [ 2, 8 ], [ 3, 0 ], [ 3, 1 ], [ 3, 4 ], [ 3, 7 ], [ 3, 8 ], [ 4, 0 ], [ 4, 1 ], [ 4, 2 ], [ 4, 6 ], [ 4, 7 ], [ 4, 8 ], [ 5, 0 ], [ 5, 1 ], [ 5, 2 ], [ 5, 6 ], [ 5, 7 ], [ 5, 8 ], [ 6, 0 ], [ 6, 1 ], [ 6, 2 ], [ 6, 6 ], [ 6, 7 ], [ 6, 8 ], [ 7, 0 ], [ 7, 1 ], [ 7, 7 ], [ 7, 8 ] ]
      }, {
        id: 16,
        array: [ [ 0, 0 ], [ 0, 8 ], [ 1, 1 ], [ 1, 2 ], [ 1, 3 ], [ 1, 4 ], [ 1, 5 ], [ 1, 6 ], [ 1, 7 ], [ 2, 2 ], [ 2, 3 ], [ 2, 4 ], [ 2, 5 ], [ 2, 6 ], [ 3, 3 ], [ 3, 4 ], [ 3, 5 ], [ 4, 3 ], [ 4, 4 ], [ 4, 5 ], [ 5, 2 ], [ 5, 3 ], [ 5, 4 ], [ 5, 5 ], [ 5, 6 ], [ 6, 1 ], [ 6, 2 ], [ 6, 3 ], [ 6, 4 ], [ 6, 5 ], [ 6, 6 ], [ 6, 7 ], [ 7, 0 ], [ 7, 8 ] ]
      }, {
        id: 17,
        array: [ [ 0, 1 ], [ 0, 4 ], [ 0, 7 ], [ 1, 1 ], [ 1, 4 ], [ 1, 7 ], [ 2, 1 ], [ 2, 4 ], [ 2, 7 ], [ 3, 1 ], [ 3, 4 ], [ 3, 7 ], [ 4, 1 ], [ 4, 4 ], [ 4, 7 ], [ 5, 1 ], [ 5, 4 ], [ 5, 7 ], [ 6, 1 ], [ 6, 4 ], [ 6, 7 ], [ 7, 1 ], [ 7, 4 ], [ 7, 7 ], [ 1, 2 ], [ 1, 6 ], [ 2, 3 ], [ 2, 5 ], [ 5, 3 ], [ 5, 5 ], [ 6, 2 ], [ 6, 6 ] ]
      }, {
        id: 18,
        array: [ [ 1, 1 ], [ 1, 2 ], [ 1, 4 ], [ 1, 5 ], [ 1, 7 ], [ 1, 8 ], [ 2, 1 ], [ 2, 2 ], [ 2, 4 ], [ 2, 5 ], [ 2, 7 ], [ 2, 8 ], [ 3, 1 ], [ 3, 2 ], [ 3, 4 ], [ 3, 5 ], [ 3, 7 ], [ 3, 8 ], [ 5, 1 ], [ 5, 4 ], [ 5, 7 ], [ 6, 1 ], [ 6, 4 ], [ 6, 7 ] ]
      }, {
        id: 19,
        array: [ [ 0, 0 ], [ 0, 2 ], [ 0, 4 ], [ 0, 6 ], [ 0, 8 ], [ 1, 1 ], [ 1, 3 ], [ 1, 5 ], [ 1, 7 ], [ 2, 0 ], [ 2, 2 ], [ 2, 4 ], [ 2, 6 ], [ 2, 8 ], [ 3, 1 ], [ 3, 3 ], [ 3, 5 ], [ 3, 7 ], [ 4, 0 ], [ 4, 2 ], [ 4, 4 ], [ 4, 6 ], [ 4, 8 ], [ 5, 1 ], [ 5, 3 ], [ 5, 5 ], [ 5, 7 ], [ 6, 0 ], [ 6, 2 ], [ 6, 4 ], [ 6, 6 ], [ 6, 8 ], [ 7, 1 ], [ 7, 3 ], [ 7, 5 ], [ 7, 7 ] ]
      }, {
        id: 20,
        array: [ [ 1, 1 ], [ 1, 3 ], [ 1, 5 ], [ 1, 7 ], [ 2, 1 ], [ 2, 3 ], [ 2, 5 ], [ 2, 7 ], [ 3, 1 ], [ 3, 3 ], [ 3, 5 ], [ 3, 7 ], [ 4, 1 ], [ 4, 3 ], [ 4, 5 ], [ 4, 7 ], [ 5, 1 ], [ 5, 3 ], [ 5, 5 ], [ 5, 7 ], [ 6, 1 ], [ 6, 3 ], [ 6, 5 ], [ 6, 7 ] ]
      } ],
      getDataByID: function getDataByID(id) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = void 0;
        try {
          for (var _iterator = this.arrLayoutDt[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var value = _step.value;
            if (id === value.id) return value;
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            !_iteratorNormalCompletion && _iterator.return && _iterator.return();
          } finally {
            if (_didIteratorError) throw _iteratorError;
          }
        }
        return null;
      },
      getArrLayoutLenght: function getArrLayoutLenght() {
        return this.arrLayoutDt.length;
      }
    };
    module.exports = layoutDtMgr;
    cc._RF.pop();
  }, {} ],
  "matchvs.all": [ function(require, module, exports) {
    (function(global) {
      "use strict";
      cc._RF.push(module, "f772dTuhJVOqIdOgjNeFhPX", "matchvs.all");
      "use strict";
      var _typeof = "function" === typeof Symbol && "symbol" === typeof Symbol.iterator ? function(obj) {
        return typeof obj;
      } : function(obj) {
        return obj && "function" === typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
      function _defineProperty(obj, key, value) {
        key in obj ? Object.defineProperty(obj, key, {
          value: value,
          enumerable: true,
          configurable: true,
          writable: true
        }) : obj[key] = value;
        return obj;
      }
      var MVS = function(_obj) {
        var MVS = function MVS() {};
        _obj = MVS;
        return _obj;
      }({});
      var hexcase = 0;
      var b64pad = "";
      var chrsz = 8;
      function hex_md5(s) {
        return binl2hex(core_md5(str2binl(s), s.length * chrsz));
      }
      function b64_md5(s) {
        return binl2b64(core_md5(str2binl(s), s.length * chrsz));
      }
      function str_md5(s) {
        return binl2str(core_md5(str2binl(s), s.length * chrsz));
      }
      function hex_hmac_md5(key, data) {
        return binl2hex(core_hmac_md5(key, data));
      }
      function b64_hmac_md5(key, data) {
        return binl2b64(core_hmac_md5(key, data));
      }
      function str_hmac_md5(key, data) {
        return binl2str(core_hmac_md5(key, data));
      }
      function md5_vm_test() {
        return "900150983cd24fb0d6963f7d28e17f72" == hex_md5("abc");
      }
      function core_md5(x, len) {
        x[len >> 5] |= 128 << len % 32;
        x[14 + (len + 64 >>> 9 << 4)] = len;
        var a = 1732584193;
        var b = -271733879;
        var c = -1732584194;
        var d = 271733878;
        for (var i = 0; i < x.length; i += 16) {
          var olda = a;
          var oldb = b;
          var oldc = c;
          var oldd = d;
          a = md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
          d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
          c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
          b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
          a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
          d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
          c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
          b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
          a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
          d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
          c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
          b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
          a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
          d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
          c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
          b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);
          a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
          d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
          c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
          b = md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
          a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
          d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
          c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
          b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
          a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
          d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
          c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
          b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
          a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
          d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
          c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
          b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);
          a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
          d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
          c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
          b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
          a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
          d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
          c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
          b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
          a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
          d = md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
          c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
          b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
          a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
          d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
          c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
          b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);
          a = md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
          d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
          c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
          b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
          a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
          d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
          c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
          b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
          a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
          d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
          c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
          b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
          a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
          d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
          c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
          b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);
          a = safe_add(a, olda);
          b = safe_add(b, oldb);
          c = safe_add(c, oldc);
          d = safe_add(d, oldd);
        }
        return Array(a, b, c, d);
      }
      function md5_cmn(q, a, b, x, s, t) {
        return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
      }
      function md5_ff(a, b, c, d, x, s, t) {
        return md5_cmn(b & c | ~b & d, a, b, x, s, t);
      }
      function md5_gg(a, b, c, d, x, s, t) {
        return md5_cmn(b & d | c & ~d, a, b, x, s, t);
      }
      function md5_hh(a, b, c, d, x, s, t) {
        return md5_cmn(b ^ c ^ d, a, b, x, s, t);
      }
      function md5_ii(a, b, c, d, x, s, t) {
        return md5_cmn(c ^ (b | ~d), a, b, x, s, t);
      }
      function core_hmac_md5(key, data) {
        var bkey = str2binl(key);
        bkey.length > 16 && (bkey = core_md5(bkey, key.length * chrsz));
        var ipad = Array(16), opad = Array(16);
        for (var i = 0; i < 16; i++) {
          ipad[i] = 909522486 ^ bkey[i];
          opad[i] = 1549556828 ^ bkey[i];
        }
        var hash = core_md5(ipad.concat(str2binl(data)), 512 + data.length * chrsz);
        return core_md5(opad.concat(hash), 640);
      }
      function safe_add(x, y) {
        var lsw = (65535 & x) + (65535 & y);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return msw << 16 | 65535 & lsw;
      }
      function bit_rol(num, cnt) {
        return num << cnt | num >>> 32 - cnt;
      }
      function str2binl(str) {
        var bin = Array();
        var mask = (1 << chrsz) - 1;
        for (var i = 0; i < str.length * chrsz; i += chrsz) bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << i % 32;
        return bin;
      }
      function binl2str(bin) {
        var str = "";
        var mask = (1 << chrsz) - 1;
        for (var i = 0; i < 32 * bin.length; i += chrsz) str += String.fromCharCode(bin[i >> 5] >>> i % 32 & mask);
        return str;
      }
      function binl2hex(binarray) {
        var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
        var str = "";
        for (var i = 0; i < 4 * binarray.length; i++) str += hex_tab.charAt(binarray[i >> 2] >> i % 4 * 8 + 4 & 15) + hex_tab.charAt(binarray[i >> 2] >> i % 4 * 8 & 15);
        return str;
      }
      function binl2b64(binarray) {
        var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var str = "";
        for (var i = 0; i < 4 * binarray.length; i += 3) {
          var triplet = (binarray[i >> 2] >> i % 4 * 8 & 255) << 16 | (binarray[i + 1 >> 2] >> (i + 1) % 4 * 8 & 255) << 8 | binarray[i + 2 >> 2] >> (i + 2) % 4 * 8 & 255;
          for (var j = 0; j < 4; j++) 8 * i + 6 * j > 32 * binarray.length ? str += b64pad : str += tab.charAt(triplet >> 6 * (3 - j) & 63);
        }
        return str;
      }
      var format = function format(fmt) {
        var argIndex = 1, args = [].slice.call(arguments), i = 0, n = fmt.length, result = "", c, escaped = false, arg, tmp, leadingZero = false, precision, nextArg = function nextArg() {
          return args[argIndex++];
        }, slurpNumber = function slurpNumber() {
          var digits = "";
          while (/\d/.test(fmt[i])) {
            digits += fmt[i++];
            c = fmt[i];
          }
          return digits.length > 0 ? parseInt(digits) : null;
        };
        for (;i < n; ++i) {
          c = fmt[i];
          if (escaped) {
            escaped = false;
            if ("." == c) {
              leadingZero = false;
              c = fmt[++i];
            } else if ("0" == c && "." == fmt[i + 1]) {
              leadingZero = true;
              i += 2;
              c = fmt[i];
            } else leadingZero = true;
            precision = slurpNumber();
            switch (c) {
             case "b":
              result += parseInt(nextArg(), 10).toString(2);
              break;

             case "c":
              arg = nextArg();
              "string" === typeof arg || arg instanceof String ? result += arg : result += String.fromCharCode(parseInt(arg, 10));
              break;

             case "d":
              result += parseInt(nextArg(), 10);
              break;

             case "f":
              tmp = String(parseFloat(nextArg()).toFixed(precision || 6));
              result += leadingZero ? tmp : tmp.replace(/^0/, "");
              break;

             case "j":
              result += JSON.stringify(nextArg());
              break;

             case "o":
              result += "0" + parseInt(nextArg(), 10).toString(8);
              break;

             case "s":
              result += nextArg();
              break;

             case "x":
              result += "0x" + parseInt(nextArg(), 10).toString(16);
              break;

             case "X":
              result += "0x" + parseInt(nextArg(), 10).toString(16).toUpperCase();
              break;

             default:
              result += c;
            }
          } else "%" === c ? escaped = true : result += c;
        }
        return result;
      };
      var MatchvsLog = {
        toArray: function toArray(argument) {
          var args = [];
          for (var i = 0; i < argument.length; i++) args.push(argument[i]);
          return args;
        }
      };
      function getNowFormatDate() {
        var date = new Date();
        var ___ = "-";
        var __ = ":";
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        month >= 1 && month <= 9 && (month = "0" + month);
        strDate >= 0 && strDate <= 9 && (strDate = "0" + strDate);
        return "[" + date.getFullYear() + ___ + month + ___ + strDate + " " + date.getHours() + __ + date.getMinutes() + __ + date.getSeconds() + "." + date.getMilliseconds() + "]";
      }
      MatchvsLog.openLog = function() {
        console.log("---- open log ----");
        if ("undefined" === typeof wx) {
          MatchvsLog.logI = console.log.bind(console, "[INFO][Matchvs]  ");
          MatchvsLog.logE = console.error.bind(console, "[ERROR][Matchvs]  ");
        } else {
          MatchvsLog.logI = function() {
            var loc = "";
            try {
              throw new Error();
            } catch (e) {
              var line = e.stack.split(/\n/)[1];
              loc = line.slice(line.lastIndexOf("/") + 1, line.lastIndexOf(")"));
            }
            console.log("[INFO][Matchvs] " + getNowFormatDate() + " " + this.toArray(arguments) + " " + loc);
          };
          MatchvsLog.logE = function() {
            var loc = "";
            try {
              throw new Error();
            } catch (e) {
              var line = e.stack.split(/\n/)[1];
              loc = line.slice(line.lastIndexOf("/") + 1, line.lastIndexOf(")"));
            }
            console.error("[ERROR][Matchvs] " + getNowFormatDate() + " " + this.toArray(arguments) + " " + loc);
          };
        }
      };
      MatchvsLog.closeLog = function() {
        console.log("---- close log ----");
        MatchvsLog.logI = function() {};
        MatchvsLog.logE = function() {};
      };
      MatchvsLog.openLog();
      var HEART_BEAT_INTERVAL = 3e3;
      var ENGE_STATE = {
        NONE: 0,
        INITING: 1,
        HAVE_INIT: 2,
        LOGINING: 4,
        HAVE_LOGIN: 8,
        IN_ROOM: 16,
        CREATEROOM: 32,
        JOIN_ROOMING: 64,
        LEAVE_ROOMING: 128,
        LOGOUTING: 256,
        RECONNECTING: 512
      };
      var ENMU_MVS_PTF = {
        MVS_COMMON: 0,
        MVS_EGRET: 1,
        MVS_WX: 2
      };
      var MVSCONFIG = {
        MAXPLAYER_LIMIT: 100,
        MINPLAYER_LIMIT: 2,
        MVS_PTF_ADATPER: ENMU_MVS_PTF.MVS_COMMON
      };
      var HttpConf = {
        HOST_GATWAY_ADDR: "",
        HOST_HOTEL_ADDR: "",
        GETHOSTLIST_URL: "http://sdk.matchvs.com",
        REGISTER_USER_URL: "",
        CMSNS_URL: "",
        VS_OPEN_URL: "",
        VS_PAY_URL: "",
        VS_PRODUCT_URL: ""
      };
      "function" !== typeof String.prototype.startsWith && (String.prototype.startsWith = function(prefix) {
        return this.slice(0, prefix.length) === prefix;
      });
      "function" !== typeof String.prototype.endsWith && (String.prototype.endsWith = function(suffix) {
        return -1 !== this.indexOf(suffix, this.length - suffix.length);
      });
      function IncludeJS(fileName) {
        new_element = document.createElement("script");
        new_element.setAttribute("type", "text/javascript");
        new_element.setAttribute("src", fileName);
        document.body.appendChild(new_element);
      }
      function MSExtend(Child, Parent) {
        var p = Parent.prototype;
        var c = Child.prototype;
        for (var i in p) c[i] = p[i];
      }
      function stringToUtf8ByteArray(a) {
        if (!(a && "string" === typeof a)) return new Uint8Array(0);
        for (var b = [], c = 0, d = 0; d < a.length; d++) {
          var e = a.charCodeAt(d);
          128 > e ? b[c++] = e : (2048 > e ? b[c++] = e >> 6 | 192 : (55296 == (64512 & e) && d + 1 < a.length && 56320 == (64512 & a.charCodeAt(d + 1)) ? (e = 65536 + ((1023 & e) << 10) + (1023 & a.charCodeAt(++d)), 
          b[c++] = e >> 18 | 240, b[c++] = e >> 12 & 63 | 128) : b[c++] = e >> 12 | 224, b[c++] = e >> 6 & 63 | 128), 
          b[c++] = 63 & e | 128);
        }
        var buf = new Uint8Array(b.length);
        for (var i = 0; i < buf.length; i++) buf[i] = b[i];
        return buf;
      }
      function utf8ByteArrayToString(a) {
        for (var b = [], c = 0, d = 0; c < a.length; ) {
          var e = a[c++];
          if (128 > e) b[d++] = String.fromCharCode(e); else if (191 < e && 224 > e) {
            var f = a[c++];
            b[d++] = String.fromCharCode((31 & e) << 6 | 63 & f);
          } else if (239 < e && 365 > e) {
            var f = a[c++], g = a[c++], h = a[c++], e = ((7 & e) << 18 | (63 & f) << 12 | (63 & g) << 6 | 63 & h) - 65536;
            b[d++] = String.fromCharCode(55296 + (e >> 10));
            b[d++] = String.fromCharCode(56320 + (1023 & e));
          } else f = a[c++], g = a[c++], b[d++] = String.fromCharCode((15 & e) << 12 | (63 & f) << 6 | 63 & g);
        }
        return b.join("");
      }
      function str2u8array(str) {
        if (!(str && "string" === typeof str)) return str;
        var out = new Uint8Array(2 * str.length);
        for (var i = 0; i < str.length; i++) {
          out[2 * i] = str.charCodeAt(i) >> 8;
          out[2 * i + 1] = str.charCodeAt(i);
        }
        return out;
      }
      function u8array2str(u8array) {
        var buf = new Uint16Array(u8array.length / 2);
        for (var i = 0; i < buf.length; i++) buf[i] = u8array[2 * i] << 8 | u8array[2 * i + 1];
        return String.fromCharCode.apply(null, buf);
      }
      function LocalStore_Save(key, value) {
        if (window.localStorage) {
          localStorage.setItem(key, value);
          return true;
        }
        if (MVSCONFIG.MVS_PTF_ADATPER === ENMU_MVS_PTF.MVS_EGRET) return false;
        if ("undefined" !== typeof wx) {
          wx.setStorageSync(key, value);
          return true;
        }
        return false;
      }
      function LocalStore_Clear() {
        if (window.localStorage) {
          localStorage.clear();
          return true;
        }
        if (MVSCONFIG.MVS_PTF_ADATPER === ENMU_MVS_PTF.MVS_EGRET) return false;
        if ("undefined" !== typeof wx) {
          wx.clearStorageSync();
          return true;
        }
        return false;
      }
      function LocalStore_Load(key) {
        if (window.localStorage) return localStorage.getItem(key);
        if (MVSCONFIG.MVS_PTF_ADATPER === ENMU_MVS_PTF.MVS_EGRET) return null;
        return "undefined" !== typeof wx ? wx.getStorageSync(key) : null;
      }
      function isIE() {
        return !!window.ActiveXObject || "ActiveXObject" in window;
      }
      function isNeedUseWSS() {
        return "undefined" !== typeof wx;
      }
      function getHotelUrl(bookInfo) {
        return isNeedUseWSS() ? "wss://" + bookInfo.getWssproxy() + "/proxy?hotel=" + bookInfo.getHoteladdr() : "ws://" + bookInfo.getHoteladdr();
      }
      function commEngineStateCheck(engineState, roomLoock, type) {
        var resNo = 0;
        (engineState & ENGE_STATE.HAVE_INIT) !== ENGE_STATE.HAVE_INIT && (resNo = -2);
        (engineState & ENGE_STATE.INITING) === ENGE_STATE.INITING && (resNo = -3);
        (engineState & ENGE_STATE.HAVE_LOGIN) !== ENGE_STATE.HAVE_LOGIN && (resNo = -4);
        (engineState & ENGE_STATE.LOGINING) === ENGE_STATE.LOGINING && (resNo = -5);
        (engineState & ENGE_STATE.CREATEROOM) === ENGE_STATE.CREATEROOM && (resNo = -7);
        (engineState & ENGE_STATE.JOIN_ROOMING) === ENGE_STATE.JOIN_ROOMING && (resNo = -7);
        (engineState & ENGE_STATE.LOGOUTING) === ENGE_STATE.LOGOUTING && (resNo = -11);
        if (1 === type) {
          (engineState & ENGE_STATE.IN_ROOM) !== ENGE_STATE.IN_ROOM && (resNo = -6);
          (engineState & ENGE_STATE.LEAVE_ROOMING) === ENGE_STATE.LEAVE_ROOMING && (resNo = -10);
        } else if (2 === type) {
          (engineState & ENGE_STATE.IN_ROOM) === ENGE_STATE.IN_ROOM && (resNo = -8);
          (engineState & ENGE_STATE.LEAVE_ROOMING) === ENGE_STATE.LEAVE_ROOMING && (resNo = -10);
        } else 3 === type && (engineState & ENGE_STATE.LEAVE_ROOMING) === ENGE_STATE.LEAVE_ROOMING && (resNo = -10);
        0 !== resNo && MatchvsLog.logI("error code:" + resNo + " see the error documentation : http://www.matchvs.com/service?page=js");
        return resNo;
      }
      var MvsTicker = function(obj) {
        var _tickMap = {};
        var _count = 0;
        function MvsTicker() {}
        if ("undefined" !== typeof BK) {
          MvsTicker.prototype.setInterval = function(callback, interval) {
            var t = new BK.Ticker();
            t.interval = 6 * interval / 100;
            t.setTickerCallBack(callback);
            var flag = ++_count;
            _tickMap[flag] = t;
            return flag;
          };
          MvsTicker.prototype.clearInterval = function(flag) {
            var ti = _tickMap[flag];
            if (ti) {
              ti.dispose();
              delete _tickMap[flag];
            }
          };
        } else {
          MvsTicker.prototype.setInterval = function(callback, interval) {
            return setInterval(callback, interval);
          };
          MvsTicker.prototype.clearInterval = function(flag) {
            clearInterval(flag);
          };
        }
        return MvsTicker;
      }(MvsTicker);
      var MVS = function(_obj) {
        _obj.ticker = new MvsTicker();
        return _obj;
      }(MVS || {});
      var MVS = function(_super) {
        var AppKeyCheck = function(_obj) {
          var _tags = [ "", "E", "C", "M" ];
          var getTag = function getTag(appkey) {
            var len = appkey.length;
            var tags = appkey.split("#");
            if (2 !== tags.length) return "";
            return tags[1];
          };
          var AppkeyCheck = function AppkeyCheck() {};
          AppkeyCheck.prototype.isInvailed = function(appkey) {
            var tag = getTag(appkey);
            for (var i = 0; i < _tags.length; i++) if (tag === _tags[i]) return true;
            return false;
          };
          _obj = AppkeyCheck;
          return _obj;
        }(AppKeyCheck || {});
        _super.AppKeyCheck = AppKeyCheck;
        return _super;
      }(MVS || {});
      (function e(t, n, r) {
        function s(o, u) {
          if (!n[o]) {
            if (!t[o]) {
              var a = "function" == typeof _require && _require;
              if (!u && a) return a(o, !0);
              if (i) return i(o, !0);
              var f = new Error("Cannot find module '" + o + "'");
              throw f.code = "MODULE_NOT_FOUND", f;
            }
            var l = n[o] = {
              exports: {}
            };
            t[o][0].call(l.exports, function(e) {
              var n = t[o][1][e];
              return s(n || e);
            }, l, l.exports, e, t, n, r);
          }
          return n[o].exports;
        }
        var i = "function" == typeof _require && _require;
        for (var o = 0; o < r.length; o++) s(r[o]);
        return s;
      })({
        1: [ function(_require, module, exports) {
          (function(global) {
            var $jscomp = {
              scope: {},
              getGlobal: function getGlobal(a) {
                return "undefined" != typeof window && window === a ? a : "undefined" != typeof global ? global : a;
              }
            };
            $jscomp.global = $jscomp.getGlobal(this);
            $jscomp.initSymbol = function() {
              $jscomp.global.Symbol || ($jscomp.global.Symbol = $jscomp.Symbol);
              $jscomp.initSymbol = function() {};
            };
            $jscomp.symbolCounter_ = 0;
            $jscomp.Symbol = function(a) {
              return "jscomp_symbol_" + a + $jscomp.symbolCounter_++;
            };
            $jscomp.initSymbolIterator = function() {
              $jscomp.initSymbol();
              $jscomp.global.Symbol.iterator || ($jscomp.global.Symbol.iterator = $jscomp.global.Symbol("iterator"));
              $jscomp.initSymbolIterator = function() {};
            };
            $jscomp.makeIterator = function(a) {
              $jscomp.initSymbolIterator();
              $jscomp.initSymbol();
              $jscomp.initSymbolIterator();
              var b = a[Symbol.iterator];
              if (b) return b.call(a);
              var c = 0;
              return {
                next: function next() {
                  return c < a.length ? {
                    done: !1,
                    value: a[c++]
                  } : {
                    done: !0
                  };
                }
              };
            };
            $jscomp.arrayFromIterator = function(a) {
              for (var b, c = []; !(b = a.next()).done; ) c.push(b.value);
              return c;
            };
            $jscomp.arrayFromIterable = function(a) {
              return a instanceof Array ? a : $jscomp.arrayFromIterator($jscomp.makeIterator(a));
            };
            $jscomp.inherits = function(a, b) {
              function c() {}
              c.prototype = b.prototype;
              a.prototype = new c();
              a.prototype.constructor = a;
              for (var d in b) if (Object.defineProperties) {
                var e = Object.getOwnPropertyDescriptor(b, d);
                e && Object.defineProperty(a, d, e);
              } else a[d] = b[d];
            };
            $jscomp.array = $jscomp.array || {};
            $jscomp.iteratorFromArray = function(a, b) {
              $jscomp.initSymbolIterator();
              a instanceof String && (a += "");
              var c = 0, d = {
                next: function next() {
                  if (c < a.length) {
                    var e = c++;
                    return {
                      value: b(e, a[e]),
                      done: !1
                    };
                  }
                  d.next = function() {
                    return {
                      done: !0,
                      value: void 0
                    };
                  };
                  return d.next();
                }
              };
              $jscomp.initSymbol();
              $jscomp.initSymbolIterator();
              d[Symbol.iterator] = function() {
                return d;
              };
              return d;
            };
            $jscomp.findInternal = function(a, b, c) {
              a instanceof String && (a = String(a));
              for (var d = a.length, e = 0; e < d; e++) {
                var f = a[e];
                if (b.call(c, f, e, a)) return {
                  i: e,
                  v: f
                };
              }
              return {
                i: -1,
                v: void 0
              };
            };
            $jscomp.array.from = function(a, b, c) {
              $jscomp.initSymbolIterator();
              b = null != b ? b : function(a) {
                return a;
              };
              var d = [];
              $jscomp.initSymbol();
              $jscomp.initSymbolIterator();
              var e = a[Symbol.iterator];
              "function" == typeof e && (a = e.call(a));
              if ("function" == typeof a.next) for (;!(e = a.next()).done; ) d.push(b.call(c, e.value)); else for (var e = a.length, f = 0; f < e; f++) d.push(b.call(c, a[f]));
              return d;
            };
            $jscomp.array.of = function(a) {
              return $jscomp.array.from(arguments);
            };
            $jscomp.array.entries = function() {
              return $jscomp.iteratorFromArray(this, function(a, b) {
                return [ a, b ];
              });
            };
            $jscomp.array.installHelper_ = function(a, b) {
              !Array.prototype[a] && Object.defineProperties && Object.defineProperty && Object.defineProperty(Array.prototype, a, {
                configurable: !0,
                enumerable: !1,
                writable: !0,
                value: b
              });
            };
            $jscomp.array.entries$install = function() {
              $jscomp.array.installHelper_("entries", $jscomp.array.entries);
            };
            $jscomp.array.keys = function() {
              return $jscomp.iteratorFromArray(this, function(a) {
                return a;
              });
            };
            $jscomp.array.keys$install = function() {
              $jscomp.array.installHelper_("keys", $jscomp.array.keys);
            };
            $jscomp.array.values = function() {
              return $jscomp.iteratorFromArray(this, function(a, b) {
                return b;
              });
            };
            $jscomp.array.values$install = function() {
              $jscomp.array.installHelper_("values", $jscomp.array.values);
            };
            $jscomp.array.copyWithin = function(a, b, c) {
              var d = this.length;
              a = Number(a);
              b = Number(b);
              c = Number(null != c ? c : d);
              if (a < b) for (c = Math.min(c, d); b < c; ) b in this ? this[a++] = this[b++] : (delete this[a++], 
              b++); else for (c = Math.min(c, d + b - a), a += c - b; c > b; ) --c in this ? this[--a] = this[c] : delete this[a];
              return this;
            };
            $jscomp.array.copyWithin$install = function() {
              $jscomp.array.installHelper_("copyWithin", $jscomp.array.copyWithin);
            };
            $jscomp.array.fill = function(a, b, c) {
              var d = this.length || 0;
              0 > b && (b = Math.max(0, d + b));
              (null == c || c > d) && (c = d);
              c = Number(c);
              0 > c && (c = Math.max(0, d + c));
              for (b = Number(b || 0); b < c; b++) this[b] = a;
              return this;
            };
            $jscomp.array.fill$install = function() {
              $jscomp.array.installHelper_("fill", $jscomp.array.fill);
            };
            $jscomp.array.find = function(a, b) {
              return $jscomp.findInternal(this, a, b).v;
            };
            $jscomp.array.find$install = function() {
              $jscomp.array.installHelper_("find", $jscomp.array.find);
            };
            $jscomp.array.findIndex = function(a, b) {
              return $jscomp.findInternal(this, a, b).i;
            };
            $jscomp.array.findIndex$install = function() {
              $jscomp.array.installHelper_("findIndex", $jscomp.array.findIndex);
            };
            $jscomp.ASSUME_NO_NATIVE_MAP = !1;
            $jscomp.Map$isConformant = function() {
              if ($jscomp.ASSUME_NO_NATIVE_MAP) return !1;
              var a = $jscomp.global.Map;
              if (!a || !a.prototype.entries || "function" != typeof Object.seal) return !1;
              try {
                var b = Object.seal({
                  x: 4
                }), c = new a($jscomp.makeIterator([ [ b, "s" ] ]));
                if ("s" != c.get(b) || 1 != c.size || c.get({
                  x: 4
                }) || c.set({
                  x: 4
                }, "t") != c || 2 != c.size) return !1;
                var d = c.entries(), e = d.next();
                if (e.done || e.value[0] != b || "s" != e.value[1]) return !1;
                e = d.next();
                return !(e.done || 4 != e.value[0].x || "t" != e.value[1] || !d.next().done);
              } catch (f) {
                return !1;
              }
            };
            $jscomp.Map = function(a) {
              this.data_ = {};
              this.head_ = $jscomp.Map.createHead();
              this.size = 0;
              if (a) {
                a = $jscomp.makeIterator(a);
                for (var b; !(b = a.next()).done; ) b = b.value, this.set(b[0], b[1]);
              }
            };
            $jscomp.Map.prototype.set = function(a, b) {
              var c = $jscomp.Map.maybeGetEntry(this, a);
              c.list || (c.list = this.data_[c.id] = []);
              c.entry ? c.entry.value = b : (c.entry = {
                next: this.head_,
                previous: this.head_.previous,
                head: this.head_,
                key: a,
                value: b
              }, c.list.push(c.entry), this.head_.previous.next = c.entry, this.head_.previous = c.entry, 
              this.size++);
              return this;
            };
            $jscomp.Map.prototype["delete"] = function(a) {
              a = $jscomp.Map.maybeGetEntry(this, a);
              return !(!a.entry || !a.list) && (a.list.splice(a.index, 1), a.list.length || delete this.data_[a.id], 
              a.entry.previous.next = a.entry.next, a.entry.next.previous = a.entry.previous, 
              a.entry.head = null, this.size--, !0);
            };
            $jscomp.Map.prototype.clear = function() {
              this.data_ = {};
              this.head_ = this.head_.previous = $jscomp.Map.createHead();
              this.size = 0;
            };
            $jscomp.Map.prototype.has = function(a) {
              return !!$jscomp.Map.maybeGetEntry(this, a).entry;
            };
            $jscomp.Map.prototype.get = function(a) {
              return (a = $jscomp.Map.maybeGetEntry(this, a).entry) && a.value;
            };
            $jscomp.Map.prototype.entries = function() {
              return $jscomp.Map.makeIterator_(this, function(a) {
                return [ a.key, a.value ];
              });
            };
            $jscomp.Map.prototype.keys = function() {
              return $jscomp.Map.makeIterator_(this, function(a) {
                return a.key;
              });
            };
            $jscomp.Map.prototype.values = function() {
              return $jscomp.Map.makeIterator_(this, function(a) {
                return a.value;
              });
            };
            $jscomp.Map.prototype.forEach = function(a, b) {
              for (var c = this.entries(), d; !(d = c.next()).done; ) d = d.value, a.call(b, d[1], d[0], this);
            };
            $jscomp.Map.maybeGetEntry = function(a, b) {
              var c = $jscomp.Map.getId(b), d = a.data_[c];
              if (d && Object.prototype.hasOwnProperty.call(a.data_, c)) for (var e = 0; e < d.length; e++) {
                var f = d[e];
                if (b !== b && f.key !== f.key || b === f.key) return {
                  id: c,
                  list: d,
                  index: e,
                  entry: f
                };
              }
              return {
                id: c,
                list: d,
                index: -1,
                entry: void 0
              };
            };
            $jscomp.Map.makeIterator_ = function(a, b) {
              var c = a.head_, d = {
                next: function next() {
                  if (c) {
                    for (;c.head != a.head_; ) c = c.previous;
                    for (;c.next != c.head; ) return c = c.next, {
                      done: !1,
                      value: b(c)
                    };
                    c = null;
                  }
                  return {
                    done: !0,
                    value: void 0
                  };
                }
              };
              $jscomp.initSymbol();
              $jscomp.initSymbolIterator();
              d[Symbol.iterator] = function() {
                return d;
              };
              return d;
            };
            $jscomp.Map.mapIndex_ = 0;
            $jscomp.Map.createHead = function() {
              var a = {};
              return a.previous = a.next = a.head = a;
            };
            $jscomp.Map.getId = function(a) {
              if (!(a instanceof Object)) return "p_" + a;
              if (!($jscomp.Map.idKey in a)) try {
                $jscomp.Map.defineProperty(a, $jscomp.Map.idKey, {
                  value: ++$jscomp.Map.mapIndex_
                });
              } catch (b) {}
              return $jscomp.Map.idKey in a ? a[$jscomp.Map.idKey] : "o_ " + a;
            };
            $jscomp.Map.defineProperty = Object.defineProperty ? function(a, b, c) {
              Object.defineProperty(a, b, {
                value: String(c)
              });
            } : function(a, b, c) {
              a[b] = String(c);
            };
            $jscomp.Map.Entry = function() {};
            $jscomp.Map$install = function() {
              $jscomp.initSymbol();
              $jscomp.initSymbolIterator();
              $jscomp.Map$isConformant() ? $jscomp.Map = $jscomp.global.Map : ($jscomp.initSymbol(), 
              $jscomp.initSymbolIterator(), $jscomp.Map.prototype[Symbol.iterator] = $jscomp.Map.prototype.entries, 
              $jscomp.initSymbol(), $jscomp.Map.idKey = Symbol("map-id-key"), $jscomp.Map$install = function() {});
            };
            $jscomp.math = $jscomp.math || {};
            $jscomp.math.clz32 = function(a) {
              a = Number(a) >>> 0;
              if (0 === a) return 32;
              var b = 0;
              0 === (4294901760 & a) && (a <<= 16, b += 16);
              0 === (4278190080 & a) && (a <<= 8, b += 8);
              0 === (4026531840 & a) && (a <<= 4, b += 4);
              0 === (3221225472 & a) && (a <<= 2, b += 2);
              0 === (2147483648 & a) && b++;
              return b;
            };
            $jscomp.math.imul = function(a, b) {
              a = Number(a);
              b = Number(b);
              var c = 65535 & a, d = 65535 & b;
              return c * d + ((a >>> 16 & 65535) * d + c * (b >>> 16 & 65535) << 16 >>> 0) | 0;
            };
            $jscomp.math.sign = function(a) {
              a = Number(a);
              return 0 === a || isNaN(a) ? a : 0 < a ? 1 : -1;
            };
            $jscomp.math.log10 = function(a) {
              return Math.log(a) / Math.LN10;
            };
            $jscomp.math.log2 = function(a) {
              return Math.log(a) / Math.LN2;
            };
            $jscomp.math.log1p = function(a) {
              a = Number(a);
              if (.25 > a && -.25 < a) {
                for (var b = a, c = 1, d = a, e = 0, f = 1; e != d; ) b *= a, f *= -1, d = (e = d) + f * b / ++c;
                return d;
              }
              return Math.log(1 + a);
            };
            $jscomp.math.expm1 = function(a) {
              a = Number(a);
              if (.25 > a && -.25 < a) {
                for (var b = a, c = 1, d = a, e = 0; e != d; ) b *= a / ++c, d = (e = d) + b;
                return d;
              }
              return Math.exp(a) - 1;
            };
            $jscomp.math.cosh = function(a) {
              a = Number(a);
              return (Math.exp(a) + Math.exp(-a)) / 2;
            };
            $jscomp.math.sinh = function(a) {
              a = Number(a);
              return 0 === a ? a : (Math.exp(a) - Math.exp(-a)) / 2;
            };
            $jscomp.math.tanh = function(a) {
              a = Number(a);
              if (0 === a) return a;
              var b = Math.exp(-2 * Math.abs(a)), b = (1 - b) / (1 + b);
              return 0 > a ? -b : b;
            };
            $jscomp.math.acosh = function(a) {
              a = Number(a);
              return Math.log(a + Math.sqrt(a * a - 1));
            };
            $jscomp.math.asinh = function(a) {
              a = Number(a);
              if (0 === a) return a;
              var b = Math.log(Math.abs(a) + Math.sqrt(a * a + 1));
              return 0 > a ? -b : b;
            };
            $jscomp.math.atanh = function(a) {
              a = Number(a);
              return ($jscomp.math.log1p(a) - $jscomp.math.log1p(-a)) / 2;
            };
            $jscomp.math.hypot = function(a, b, c) {
              a = Number(a);
              b = Number(b);
              var d, e, f, g = Math.max(Math.abs(a), Math.abs(b));
              for (d = 2; d < arguments.length; d++) g = Math.max(g, Math.abs(arguments[d]));
              if (1e100 < g || 1e-100 > g) {
                a /= g;
                b /= g;
                f = a * a + b * b;
                for (d = 2; d < arguments.length; d++) e = Number(arguments[d]) / g, f += e * e;
                return Math.sqrt(f) * g;
              }
              f = a * a + b * b;
              for (d = 2; d < arguments.length; d++) e = Number(arguments[d]), f += e * e;
              return Math.sqrt(f);
            };
            $jscomp.math.trunc = function(a) {
              a = Number(a);
              if (isNaN(a) || Infinity === a || -Infinity === a || 0 === a) return a;
              var b = Math.floor(Math.abs(a));
              return 0 > a ? -b : b;
            };
            $jscomp.math.cbrt = function(a) {
              if (0 === a) return a;
              a = Number(a);
              var b = Math.pow(Math.abs(a), 1 / 3);
              return 0 > a ? -b : b;
            };
            $jscomp.number = $jscomp.number || {};
            $jscomp.number.isFinite = function(a) {
              return "number" === typeof a && (!isNaN(a) && Infinity !== a && -Infinity !== a);
            };
            $jscomp.number.isInteger = function(a) {
              return !!$jscomp.number.isFinite(a) && a === Math.floor(a);
            };
            $jscomp.number.isNaN = function(a) {
              return "number" === typeof a && isNaN(a);
            };
            $jscomp.number.isSafeInteger = function(a) {
              return $jscomp.number.isInteger(a) && Math.abs(a) <= $jscomp.number.MAX_SAFE_INTEGER;
            };
            $jscomp.number.EPSILON = function() {
              return Math.pow(2, -52);
            }();
            $jscomp.number.MAX_SAFE_INTEGER = function() {
              return 9007199254740991;
            }();
            $jscomp.number.MIN_SAFE_INTEGER = function() {
              return -9007199254740991;
            }();
            $jscomp.object = $jscomp.object || {};
            $jscomp.object.assign = function(a, b) {
              for (var c = 1; c < arguments.length; c++) {
                var d = arguments[c];
                if (d) for (var e in d) Object.prototype.hasOwnProperty.call(d, e) && (a[e] = d[e]);
              }
              return a;
            };
            $jscomp.object.is = function(a, b) {
              return a === b ? 0 !== a || 1 / a === 1 / b : a !== a && b !== b;
            };
            $jscomp.ASSUME_NO_NATIVE_SET = !1;
            $jscomp.Set$isConformant = function() {
              if ($jscomp.ASSUME_NO_NATIVE_SET) return !1;
              var a = $jscomp.global.Set;
              if (!a || !a.prototype.entries || "function" != typeof Object.seal) return !1;
              try {
                var b = Object.seal({
                  x: 4
                }), c = new a($jscomp.makeIterator([ b ]));
                if (!c.has(b) || 1 != c.size || c.add(b) != c || 1 != c.size || c.add({
                  x: 4
                }) != c || 2 != c.size) return !1;
                var d = c.entries(), e = d.next();
                if (e.done || e.value[0] != b || e.value[1] != b) return !1;
                e = d.next();
                return !e.done && e.value[0] != b && 4 == e.value[0].x && e.value[1] == e.value[0] && d.next().done;
              } catch (f) {
                return !1;
              }
            };
            $jscomp.Set = function(a) {
              this.map_ = new $jscomp.Map();
              if (a) {
                a = $jscomp.makeIterator(a);
                for (var b; !(b = a.next()).done; ) this.add(b.value);
              }
              this.size = this.map_.size;
            };
            $jscomp.Set.prototype.add = function(a) {
              this.map_.set(a, a);
              this.size = this.map_.size;
              return this;
            };
            $jscomp.Set.prototype["delete"] = function(a) {
              a = this.map_["delete"](a);
              this.size = this.map_.size;
              return a;
            };
            $jscomp.Set.prototype.clear = function() {
              this.map_.clear();
              this.size = 0;
            };
            $jscomp.Set.prototype.has = function(a) {
              return this.map_.has(a);
            };
            $jscomp.Set.prototype.entries = function() {
              return this.map_.entries();
            };
            $jscomp.Set.prototype.values = function() {
              return this.map_.values();
            };
            $jscomp.Set.prototype.forEach = function(a, b) {
              var c = this;
              this.map_.forEach(function(d) {
                return a.call(b, d, d, c);
              });
            };
            $jscomp.Set$install = function() {
              $jscomp.Map$install();
              $jscomp.Set$isConformant() ? $jscomp.Set = $jscomp.global.Set : ($jscomp.initSymbol(), 
              $jscomp.initSymbolIterator(), $jscomp.Set.prototype[Symbol.iterator] = $jscomp.Set.prototype.values, 
              $jscomp.Set$install = function() {});
            };
            $jscomp.string = $jscomp.string || {};
            $jscomp.checkStringArgs = function(a, b, c) {
              if (null == a) throw new TypeError("The 'this' value for String.prototype." + c + " must not be null or undefined");
              if (b instanceof RegExp) throw new TypeError("First argument to String.prototype." + c + " must not be a regular expression");
              return a + "";
            };
            $jscomp.string.fromCodePoint = function(a) {
              for (var b = "", c = 0; c < arguments.length; c++) {
                var d = Number(arguments[c]);
                if (0 > d || 1114111 < d || d !== Math.floor(d)) throw new RangeError("invalid_code_point " + d);
                65535 >= d ? b += String.fromCharCode(d) : (d -= 65536, b += String.fromCharCode(d >>> 10 & 1023 | 55296), 
                b += String.fromCharCode(1023 & d | 56320));
              }
              return b;
            };
            $jscomp.string.repeat = function(a) {
              var b = $jscomp.checkStringArgs(this, null, "repeat");
              if (0 > a || 1342177279 < a) throw new RangeError("Invalid count value");
              a |= 0;
              for (var c = ""; a; ) (1 & a && (c += b), a >>>= 1) && (b += b);
              return c;
            };
            $jscomp.string.repeat$install = function() {
              String.prototype.repeat || (String.prototype.repeat = $jscomp.string.repeat);
            };
            $jscomp.string.codePointAt = function(a) {
              var b = $jscomp.checkStringArgs(this, null, "codePointAt"), c = b.length;
              a = Number(a) || 0;
              if (0 <= a && a < c) {
                a |= 0;
                var d = b.charCodeAt(a);
                if (55296 > d || 56319 < d || a + 1 === c) return d;
                a = b.charCodeAt(a + 1);
                return 56320 > a || 57343 < a ? d : 1024 * (d - 55296) + a + 9216;
              }
            };
            $jscomp.string.codePointAt$install = function() {
              String.prototype.codePointAt || (String.prototype.codePointAt = $jscomp.string.codePointAt);
            };
            $jscomp.string.includes = function(a, b) {
              return -1 !== $jscomp.checkStringArgs(this, a, "includes").indexOf(a, b || 0);
            };
            $jscomp.string.includes$install = function() {
              String.prototype.includes || (String.prototype.includes = $jscomp.string.includes);
            };
            $jscomp.string.startsWith = function(a, b) {
              var c = $jscomp.checkStringArgs(this, a, "startsWith");
              a += "";
              for (var d = c.length, e = a.length, f = Math.max(0, Math.min(0 | b, c.length)), g = 0; g < e && f < d; ) if (c[f++] != a[g++]) return !1;
              return g >= e;
            };
            $jscomp.string.startsWith$install = function() {
              String.prototype.startsWith || (String.prototype.startsWith = $jscomp.string.startsWith);
            };
            $jscomp.string.endsWith = function(a, b) {
              var c = $jscomp.checkStringArgs(this, a, "endsWith");
              a += "";
              void 0 === b && (b = c.length);
              for (var d = Math.max(0, Math.min(0 | b, c.length)), e = a.length; 0 < e && 0 < d; ) if (c[--d] != a[--e]) return !1;
              return 0 >= e;
            };
            $jscomp.string.endsWith$install = function() {
              String.prototype.endsWith || (String.prototype.endsWith = $jscomp.string.endsWith);
            };
            var COMPILED = !0, goog = goog || {};
            goog.global = this;
            goog.isDef = function(a) {
              return void 0 !== a;
            };
            goog.exportPath_ = function(a, b, c) {
              a = a.split(".");
              c = c || goog.global;
              a[0] in c || !c.execScript || c.execScript("var " + a[0]);
              for (var d; a.length && (d = a.shift()); ) !a.length && goog.isDef(b) ? c[d] = b : c = c[d] ? c[d] : c[d] = {};
            };
            goog.define = function(a, b) {
              var c = b;
              COMPILED || (goog.global.CLOSURE_UNCOMPILED_DEFINES && Object.prototype.hasOwnProperty.call(goog.global.CLOSURE_UNCOMPILED_DEFINES, a) ? c = goog.global.CLOSURE_UNCOMPILED_DEFINES[a] : goog.global.CLOSURE_DEFINES && Object.prototype.hasOwnProperty.call(goog.global.CLOSURE_DEFINES, a) && (c = goog.global.CLOSURE_DEFINES[a]));
              goog.exportPath_(a, c);
            };
            goog.DEBUG = !0;
            goog.LOCALE = "en";
            goog.TRUSTED_SITE = !0;
            goog.STRICT_MODE_COMPATIBLE = !1;
            goog.DISALLOW_TEST_ONLY_CODE = COMPILED && !goog.DEBUG;
            goog.ENABLE_CHROME_APP_SAFE_SCRIPT_LOADING = !1;
            goog.provide = function(a) {
              if (!COMPILED && goog.isProvided_(a)) throw Error('Namespace "' + a + '" already declared.');
              goog.constructNamespace_(a);
            };
            goog.constructNamespace_ = function(a, b) {
              if (!COMPILED) {
                delete goog.implicitNamespaces_[a];
                for (var c = a; (c = c.substring(0, c.lastIndexOf("."))) && !goog.getObjectByName(c); ) goog.implicitNamespaces_[c] = !0;
              }
              goog.exportPath_(a, b);
            };
            goog.VALID_MODULE_RE_ = /^[a-zA-Z_$][a-zA-Z0-9._$]*$/;
            goog.module = function(a) {
              if (!goog.isString(a) || !a || -1 == a.search(goog.VALID_MODULE_RE_)) throw Error("Invalid module identifier");
              if (!goog.isInModuleLoader_()) throw Error("Module " + a + " has been loaded incorrectly.");
              if (goog.moduleLoaderState_.moduleName) throw Error("goog.module may only be called once per module.");
              goog.moduleLoaderState_.moduleName = a;
              if (!COMPILED) {
                if (goog.isProvided_(a)) throw Error('Namespace "' + a + '" already declared.');
                delete goog.implicitNamespaces_[a];
              }
            };
            goog.module.get = function(a) {
              return goog.module.getInternal_(a);
            };
            goog.module.getInternal_ = function(a) {
              if (!COMPILED) return goog.isProvided_(a) ? a in goog.loadedModules_ ? goog.loadedModules_[a] : goog.getObjectByName(a) : null;
            };
            goog.moduleLoaderState_ = null;
            goog.isInModuleLoader_ = function() {
              return null != goog.moduleLoaderState_;
            };
            goog.module.declareLegacyNamespace = function() {
              if (!COMPILED && !goog.isInModuleLoader_()) throw Error("goog.module.declareLegacyNamespace must be called from within a goog.module");
              if (!COMPILED && !goog.moduleLoaderState_.moduleName) throw Error("goog.module must be called prior to goog.module.declareLegacyNamespace.");
              goog.moduleLoaderState_.declareLegacyNamespace = !0;
            };
            goog.setTestOnly = function(a) {
              if (goog.DISALLOW_TEST_ONLY_CODE) throw a = a || "", Error("Importing test-only code into non-debug environment" + (a ? ": " + a : "."));
            };
            goog.forwardDeclare = function(a) {};
            COMPILED || (goog.isProvided_ = function(a) {
              return a in goog.loadedModules_ || !goog.implicitNamespaces_[a] && goog.isDefAndNotNull(goog.getObjectByName(a));
            }, goog.implicitNamespaces_ = {
              "goog.module": !0
            });
            goog.getObjectByName = function(a, b) {
              for (var c = a.split("."), d = b || goog.global, e; e = c.shift(); ) {
                if (!goog.isDefAndNotNull(d[e])) return null;
                d = d[e];
              }
              return d;
            };
            goog.globalize = function(a, b) {
              var c = b || goog.global, d;
              for (d in a) c[d] = a[d];
            };
            goog.addDependency = function(a, b, c, d) {
              if (goog.DEPENDENCIES_ENABLED) {
                var e;
                a = a.replace(/\\/g, "/");
                for (var f = goog.dependencies_, g = 0; e = b[g]; g++) f.nameToPath[e] = a, f.pathIsModule[a] = !!d;
                for (d = 0; b = c[d]; d++) a in f._requires || (f._requires[a] = {}), f._requires[a][b] = !0;
              }
            };
            goog.ENABLE_DEBUG_LOADER = !0;
            goog.logToConsole_ = function(a) {
              goog.global.console && goog.global.console.error(a);
            };
            goog._require = function(a) {
              if (!COMPILED) {
                goog.ENABLE_DEBUG_LOADER && goog.IS_OLD_IE_ && goog.maybeProcessDeferredDep_(a);
                if (goog.isProvided_(a)) return goog.isInModuleLoader_() ? goog.module.getInternal_(a) : null;
                if (goog.ENABLE_DEBUG_LOADER) {
                  var b = goog.getPathFromDeps_(a);
                  if (b) return goog.writeScripts_(b), null;
                }
                a = "goog._require could not find: " + a;
                goog.logToConsole_(a);
                throw Error(a);
              }
            };
            goog.basePath = "";
            goog.nullFunction = function() {};
            goog.abstractMethod = function() {
              throw Error("unimplemented abstract method");
            };
            goog.addSingletonGetter = function(a) {
              a.getInstance = function() {
                if (a.instance_) return a.instance_;
                goog.DEBUG && (goog.instantiatedSingletons_[goog.instantiatedSingletons_.length] = a);
                return a.instance_ = new a();
              };
            };
            goog.instantiatedSingletons_ = [];
            goog.LOAD_MODULE_USING_EVAL = !0;
            goog.SEAL_MODULE_EXPORTS = goog.DEBUG;
            goog.loadedModules_ = {};
            goog.DEPENDENCIES_ENABLED = !COMPILED && goog.ENABLE_DEBUG_LOADER;
            goog.DEPENDENCIES_ENABLED && (goog.dependencies_ = {
              pathIsModule: {},
              nameToPath: {},
              _requires: {},
              visited: {},
              written: {},
              deferred: {}
            }, goog.inHtmlDocument_ = function() {
              var a = goog.global.document;
              return null != a && "write" in a;
            }, goog.findBasePath_ = function() {
              if (goog.isDef(goog.global.CLOSURE_BASE_PATH)) goog.basePath = goog.global.CLOSURE_BASE_PATH; else if (goog.inHtmlDocument_()) for (var a = goog.global.document.getElementsByTagName("SCRIPT"), b = a.length - 1; 0 <= b; --b) {
                var c = a[b].src, d = c.lastIndexOf("?"), d = -1 == d ? c.length : d;
                if ("base.js" == c.substr(d - 7, 7)) {
                  goog.basePath = c.substr(0, d - 7);
                  break;
                }
              }
            }, goog.importScript_ = function(a, b) {
              (goog.global.CLOSURE_IMPORT_SCRIPT || goog.writeScriptTag_)(a, b) && (goog.dependencies_.written[a] = !0);
            }, goog.IS_OLD_IE_ = !(goog.global.atob || !goog.global.document || !goog.global.document.all), 
            goog.importModule_ = function(a) {
              goog.importScript_("", 'goog.retrieveAndExecModule_("' + a + '");') && (goog.dependencies_.written[a] = !0);
            }, goog.queuedModules_ = [], goog.wrapModule_ = function(a, b) {
              return goog.LOAD_MODULE_USING_EVAL && goog.isDef(goog.global.JSON) ? "goog.loadModule(" + goog.global.JSON.stringify(b + "\n//# sourceURL=" + a + "\n") + ");" : 'goog.loadModule(function(exports) {"use strict";' + b + "\n;return exports});\n//# sourceURL=" + a + "\n";
            }, goog.loadQueuedModules_ = function() {
              var a = goog.queuedModules_.length;
              if (0 < a) {
                var b = goog.queuedModules_;
                goog.queuedModules_ = [];
                for (var c = 0; c < a; c++) goog.maybeProcessDeferredPath_(b[c]);
              }
            }, goog.maybeProcessDeferredDep_ = function(a) {
              goog.isDeferredModule_(a) && goog.allDepsAreAvailable_(a) && (a = goog.getPathFromDeps_(a), 
              goog.maybeProcessDeferredPath_(goog.basePath + a));
            }, goog.isDeferredModule_ = function(a) {
              return !(!(a = goog.getPathFromDeps_(a)) || !goog.dependencies_.pathIsModule[a]) && goog.basePath + a in goog.dependencies_.deferred;
            }, goog.allDepsAreAvailable_ = function(a) {
              if ((a = goog.getPathFromDeps_(a)) && a in goog.dependencies_._requires) for (var b in goog.dependencies_._requires[a]) if (!goog.isProvided_(b) && !goog.isDeferredModule_(b)) return !1;
              return !0;
            }, goog.maybeProcessDeferredPath_ = function(a) {
              if (a in goog.dependencies_.deferred) {
                var b = goog.dependencies_.deferred[a];
                delete goog.dependencies_.deferred[a];
                goog.globalEval(b);
              }
            }, goog.loadModuleFromUrl = function(a) {
              goog.retrieveAndExecModule_(a);
            }, goog.loadModule = function(a) {
              var b = goog.moduleLoaderState_;
              try {
                goog.moduleLoaderState_ = {
                  moduleName: void 0,
                  declareLegacyNamespace: !1
                };
                var c;
                if (goog.isFunction(a)) c = a.call(goog.global, {}); else {
                  if (!goog.isString(a)) throw Error("Invalid module definition");
                  c = goog.loadModuleFromSource_.call(goog.global, a);
                }
                var d = goog.moduleLoaderState_.moduleName;
                if (!goog.isString(d) || !d) throw Error('Invalid module name "' + d + '"');
                goog.moduleLoaderState_.declareLegacyNamespace ? goog.constructNamespace_(d, c) : goog.SEAL_MODULE_EXPORTS && Object.seal && Object.seal(c);
                goog.loadedModules_[d] = c;
              } finally {
                goog.moduleLoaderState_ = b;
              }
            }, goog.loadModuleFromSource_ = function(a) {
              console.log("eval(a) need open");
              return {};
            }, goog.writeScriptSrcNode_ = function(a) {
              goog.global.document.write('<script type="text/javascript" src="' + a + '"><\/script>');
            }, goog.appendScriptSrcNode_ = function(a) {
              var b = goog.global.document, c = b.createElement("script");
              c.type = "text/javascript";
              c.src = a;
              c.defer = !1;
              c.async = !1;
              b.head.appendChild(c);
            }, goog.writeScriptTag_ = function(a, b) {
              if (goog.inHtmlDocument_()) {
                var c = goog.global.document;
                if (!goog.ENABLE_CHROME_APP_SAFE_SCRIPT_LOADING && "complete" == c.readyState) {
                  if (/\bdeps.js$/.test(a)) return !1;
                  throw Error('Cannot write "' + a + '" after document load');
                }
                var d = goog.IS_OLD_IE_;
                void 0 === b ? d ? (d = " onreadystatechange='goog.onScriptLoad_(this, " + ++goog.lastNonModuleScriptIndex_ + ")' ", 
                c.write('<script type="text/javascript" src="' + a + '"' + d + "><\/script>")) : goog.ENABLE_CHROME_APP_SAFE_SCRIPT_LOADING ? goog.appendScriptSrcNode_(a) : goog.writeScriptSrcNode_(a) : c.write('<script type="text/javascript">' + b + "<\/script>");
                return !0;
              }
              return !1;
            }, goog.lastNonModuleScriptIndex_ = 0, goog.onScriptLoad_ = function(a, b) {
              "complete" == a.readyState && goog.lastNonModuleScriptIndex_ == b && goog.loadQueuedModules_();
              return !0;
            }, goog.writeScripts_ = function(a) {
              function b(a) {
                if (!(a in e.written || a in e.visited)) {
                  e.visited[a] = !0;
                  if (a in e._requires) for (var f in e._requires[a]) if (!goog.isProvided_(f)) {
                    if (!(f in e.nameToPath)) throw Error("Undefined nameToPath for " + f);
                    b(e.nameToPath[f]);
                  }
                  a in d || (d[a] = !0, c.push(a));
                }
              }
              var c = [], d = {}, e = goog.dependencies_;
              b(a);
              for (a = 0; a < c.length; a++) {
                var f = c[a];
                goog.dependencies_.written[f] = !0;
              }
              var g = goog.moduleLoaderState_;
              goog.moduleLoaderState_ = null;
              for (a = 0; a < c.length; a++) {
                if (!(f = c[a])) throw goog.moduleLoaderState_ = g, Error("Undefined script input");
                e.pathIsModule[f] ? goog.importModule_(goog.basePath + f) : goog.importScript_(goog.basePath + f);
              }
              goog.moduleLoaderState_ = g;
            }, goog.getPathFromDeps_ = function(a) {
              return a in goog.dependencies_.nameToPath ? goog.dependencies_.nameToPath[a] : null;
            }, goog.findBasePath_(), goog.global.CLOSURE_NO_DEPS || goog.importScript_(goog.basePath + "deps.js"));
            goog.normalizePath_ = function(a) {
              a = a.split("/");
              for (var b = 0; b < a.length; ) "." == a[b] ? a.splice(b, 1) : b && ".." == a[b] && a[b - 1] && ".." != a[b - 1] ? a.splice(--b, 2) : b++;
              return a.join("/");
            };
            goog.loadFileSync_ = function(a) {
              if (goog.global.CLOSURE_LOAD_FILE_SYNC) return goog.global.CLOSURE_LOAD_FILE_SYNC(a);
              var b = new goog.global.XMLHttpRequest();
              b.open("get", a, !1);
              b.send();
              return b.responseText;
            };
            goog.retrieveAndExecModule_ = function(a) {
              if (!COMPILED) {
                var b = a;
                a = goog.normalizePath_(a);
                var c = goog.global.CLOSURE_IMPORT_SCRIPT || goog.writeScriptTag_, d = goog.loadFileSync_(a);
                if (null == d) throw Error("load of " + a + "failed");
                d = goog.wrapModule_(a, d), goog.IS_OLD_IE_ ? (goog.dependencies_.deferred[b] = d, 
                goog.queuedModules_.push(b)) : c(a, d);
              }
            };
            goog.typeOf = function(a) {
              var b = "undefined" === typeof a ? "undefined" : _typeof(a);
              if ("object" == b) {
                if (!a) return "null";
                if (a instanceof Array) return "array";
                if (a instanceof Object) return b;
                var c = Object.prototype.toString.call(a);
                if ("[object Window]" == c) return "object";
                if ("[object Array]" == c || "number" == typeof a.length && "undefined" != typeof a.splice && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("splice")) return "array";
                if ("[object Function]" == c || "undefined" != typeof a.call && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("call")) return "function";
              } else if ("function" == b && "undefined" == typeof a.call) return "object";
              return b;
            };
            goog.isNull = function(a) {
              return null === a;
            };
            goog.isDefAndNotNull = function(a) {
              return null != a;
            };
            goog.isArray = function(a) {
              return "array" == goog.typeOf(a);
            };
            goog.isArrayLike = function(a) {
              var b = goog.typeOf(a);
              return "array" == b || "object" == b && "number" == typeof a.length;
            };
            goog.isDateLike = function(a) {
              return goog.isObject(a) && "function" == typeof a.getFullYear;
            };
            goog.isString = function(a) {
              return "string" == typeof a;
            };
            goog.isBoolean = function(a) {
              return "boolean" == typeof a;
            };
            goog.isNumber = function(a) {
              return "number" == typeof a;
            };
            goog.isFunction = function(a) {
              return "function" == goog.typeOf(a);
            };
            goog.isObject = function(a) {
              var b = "undefined" === typeof a ? "undefined" : _typeof(a);
              return "object" == b && null != a || "function" == b;
            };
            goog.getUid = function(a) {
              return a[goog.UID_PROPERTY_] || (a[goog.UID_PROPERTY_] = ++goog.uidCounter_);
            };
            goog.hasUid = function(a) {
              return !!a[goog.UID_PROPERTY_];
            };
            goog.removeUid = function(a) {
              null !== a && "removeAttribute" in a && a.removeAttribute(goog.UID_PROPERTY_);
              try {
                delete a[goog.UID_PROPERTY_];
              } catch (b) {}
            };
            goog.UID_PROPERTY_ = "closure_uid_" + (1e9 * Math.random() >>> 0);
            goog.uidCounter_ = 0;
            goog.getHashCode = goog.getUid;
            goog.removeHashCode = goog.removeUid;
            goog.cloneObject = function(a) {
              var b = goog.typeOf(a);
              if ("object" == b || "array" == b) {
                if (a.clone) return a.clone();
                var b = "array" == b ? [] : {}, c;
                for (c in a) b[c] = goog.cloneObject(a[c]);
                return b;
              }
              return a;
            };
            goog.bindNative_ = function(a, b, c) {
              return a.call.apply(a.bind, arguments);
            };
            goog.bindJs_ = function(a, b, c) {
              if (!a) throw Error();
              if (2 < arguments.length) {
                var d = Array.prototype.slice.call(arguments, 2);
                return function() {
                  var c = Array.prototype.slice.call(arguments);
                  Array.prototype.unshift.apply(c, d);
                  return a.apply(b, c);
                };
              }
              return function() {
                return a.apply(b, arguments);
              };
            };
            goog.bind = function(a, b, c) {
              Function.prototype.bind && -1 != Function.prototype.bind.toString().indexOf("native code") ? goog.bind = goog.bindNative_ : goog.bind = goog.bindJs_;
              return goog.bind.apply(null, arguments);
            };
            goog.partial = function(a, b) {
              var c = Array.prototype.slice.call(arguments, 1);
              return function() {
                var b = c.slice();
                b.push.apply(b, arguments);
                return a.apply(this, b);
              };
            };
            goog.mixin = function(a, b) {
              for (var c in b) a[c] = b[c];
            };
            goog.now = goog.TRUSTED_SITE && Date.now || function() {
              return +new Date();
            };
            goog.globalEval = function(a) {
              if (goog.global.execScript) goog.global.execScript(a, "JavaScript"); else {
                if (!goog.global.eval) throw Error("goog.globalEval not available");
                if (null == goog.evalWorksForGlobals_) if (goog.global.eval("var _evalTest_ = 1;"), 
                "undefined" != typeof goog.global._evalTest_) {
                  try {
                    delete goog.global._evalTest_;
                  } catch (d) {}
                  goog.evalWorksForGlobals_ = !0;
                } else goog.evalWorksForGlobals_ = !1;
                if (goog.evalWorksForGlobals_) goog.global.eval(a); else {
                  var b = goog.global.document, c = b.createElement("SCRIPT");
                  c.type = "text/javascript";
                  c.defer = !1;
                  c.appendChild(b.createTextNode(a));
                  b.body.appendChild(c);
                  b.body.removeChild(c);
                }
              }
            };
            goog.evalWorksForGlobals_ = null;
            goog.getCssName = function(a, b) {
              var c = function c(a) {
                return goog.cssNameMapping_[a] || a;
              }, d = function d(a) {
                a = a.split("-");
                for (var b = [], d = 0; d < a.length; d++) b.push(c(a[d]));
                return b.join("-");
              }, d = goog.cssNameMapping_ ? "BY_WHOLE" == goog.cssNameMappingStyle_ ? c : d : function(a) {
                return a;
              };
              return b ? a + "-" + d(b) : d(a);
            };
            goog.setCssNameMapping = function(a, b) {
              goog.cssNameMapping_ = a;
              goog.cssNameMappingStyle_ = b;
            };
            !COMPILED && goog.global.CLOSURE_CSS_NAME_MAPPING && (goog.cssNameMapping_ = goog.global.CLOSURE_CSS_NAME_MAPPING);
            goog.getMsg = function(a, b) {
              b && (a = a.replace(/\{\$([^}]+)}/g, function(a, d) {
                return null != b && d in b ? b[d] : a;
              }));
              return a;
            };
            goog.getMsgWithFallback = function(a, b) {
              return a;
            };
            goog.exportSymbol = function(a, b, c) {
              goog.exportPath_(a, b, c);
            };
            goog.exportProperty = function(a, b, c) {
              a[b] = c;
            };
            goog.inherits = function(a, b) {
              function c() {}
              c.prototype = b.prototype;
              a.superClass_ = b.prototype;
              a.prototype = new c();
              a.prototype.constructor = a;
              a.base = function(a, c, f) {
                for (var g = Array(arguments.length - 2), h = 2; h < arguments.length; h++) g[h - 2] = arguments[h];
                return b.prototype[c].apply(a, g);
              };
            };
            goog.base = function(a, b, c) {
              var d = arguments.callee.caller;
              if (goog.STRICT_MODE_COMPATIBLE || goog.DEBUG && !d) throw Error("arguments.caller not defined.  goog.base() cannot be used with strict mode code. See http://www.ecma-international.org/ecma-262/5.1/#sec-C");
              if (d.superClass_) {
                for (var e = Array(arguments.length - 1), f = 1; f < arguments.length; f++) e[f - 1] = arguments[f];
                return d.superClass_.constructor.apply(a, e);
              }
              e = Array(arguments.length - 2);
              for (f = 2; f < arguments.length; f++) e[f - 2] = arguments[f];
              for (var f = !1, g = a.constructor; g; g = g.superClass_ && g.superClass_.constructor) if (g.prototype[b] === d) f = !0; else if (f) return g.prototype[b].apply(a, e);
              if (a[b] === d) return a.constructor.prototype[b].apply(a, e);
              throw Error("goog.base called from a method of one name to a method of a different name");
            };
            goog.scope = function(a) {
              a.call(goog.global);
            };
            COMPILED || (goog.global.COMPILED = COMPILED);
            goog.defineClass = function(a, b) {
              var c = b.constructor, d = b.statics;
              c && c != Object.prototype.constructor || (c = function c() {
                throw Error("cannot instantiate an interface (no constructor defined).");
              });
              c = goog.defineClass.createSealingConstructor_(c, a);
              a && goog.inherits(c, a);
              delete b.constructor;
              delete b.statics;
              goog.defineClass.applyProperties_(c.prototype, b);
              null != d && (d instanceof Function ? d(c) : goog.defineClass.applyProperties_(c, d));
              return c;
            };
            goog.defineClass.SEAL_CLASS_INSTANCES = goog.DEBUG;
            goog.defineClass.createSealingConstructor_ = function(a, b) {
              if (goog.defineClass.SEAL_CLASS_INSTANCES && Object.seal instanceof Function) {
                if (b && b.prototype && b.prototype[goog.UNSEALABLE_CONSTRUCTOR_PROPERTY_]) return a;
                var c = function c() {
                  var b = a.apply(this, arguments) || this;
                  b[goog.UID_PROPERTY_] = b[goog.UID_PROPERTY_];
                  this.constructor === c && Object.seal(b);
                  return b;
                };
                return c;
              }
              return a;
            };
            goog.defineClass.OBJECT_PROTOTYPE_FIELDS_ = "constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");
            goog.defineClass.applyProperties_ = function(a, b) {
              for (var c in b) Object.prototype.hasOwnProperty.call(b, c) && (a[c] = b[c]);
              for (var d = 0; d < goog.defineClass.OBJECT_PROTOTYPE_FIELDS_.length; d++) c = goog.defineClass.OBJECT_PROTOTYPE_FIELDS_[d], 
              Object.prototype.hasOwnProperty.call(b, c) && (a[c] = b[c]);
            };
            goog.tagUnsealableClass = function(a) {
              !COMPILED && goog.defineClass.SEAL_CLASS_INSTANCES && (a.prototype[goog.UNSEALABLE_CONSTRUCTOR_PROPERTY_] = !0);
            };
            goog.UNSEALABLE_CONSTRUCTOR_PROPERTY_ = "goog_defineClass_legacy_unsealable";
            goog.dom = {};
            goog.dom.NodeType = {
              ELEMENT: 1,
              ATTRIBUTE: 2,
              TEXT: 3,
              CDATA_SECTION: 4,
              ENTITY_REFERENCE: 5,
              ENTITY: 6,
              PROCESSING_INSTRUCTION: 7,
              COMMENT: 8,
              DOCUMENT: 9,
              DOCUMENT_TYPE: 10,
              DOCUMENT_FRAGMENT: 11,
              NOTATION: 12
            };
            goog.debug = {};
            goog.debug.Error = function(a) {
              if (Error.captureStackTrace) Error.captureStackTrace(this, goog.debug.Error); else {
                var b = Error().stack;
                b && (this.stack = b);
              }
              a && (this.message = String(a));
              this.reportErrorToServer = !0;
            };
            goog.inherits(goog.debug.Error, Error);
            goog.debug.Error.prototype.name = "CustomError";
            goog.string = {};
            goog.string.DETECT_DOUBLE_ESCAPING = !1;
            goog.string.FORCE_NON_DOM_HTML_UNESCAPING = !1;
            goog.string.Unicode = {
              NBSP: "\xa0"
            };
            goog.string.startsWith = function(a, b) {
              return 0 == a.lastIndexOf(b, 0);
            };
            goog.string.endsWith = function(a, b) {
              var c = a.length - b.length;
              return 0 <= c && a.indexOf(b, c) == c;
            };
            goog.string.caseInsensitiveStartsWith = function(a, b) {
              return 0 == goog.string.caseInsensitiveCompare(b, a.substr(0, b.length));
            };
            goog.string.caseInsensitiveEndsWith = function(a, b) {
              return 0 == goog.string.caseInsensitiveCompare(b, a.substr(a.length - b.length, b.length));
            };
            goog.string.caseInsensitiveEquals = function(a, b) {
              return a.toLowerCase() == b.toLowerCase();
            };
            goog.string.subs = function(a, b) {
              for (var c = a.split("%s"), d = "", e = Array.prototype.slice.call(arguments, 1); e.length && 1 < c.length; ) d += c.shift() + e.shift();
              return d + c.join("%s");
            };
            goog.string.collapseWhitespace = function(a) {
              return a.replace(/[\s\xa0]+/g, " ").replace(/^\s+|\s+$/g, "");
            };
            goog.string.isEmptyOrWhitespace = function(a) {
              return /^[\s\xa0]*$/.test(a);
            };
            goog.string.isEmptyString = function(a) {
              return 0 == a.length;
            };
            goog.string.isEmpty = goog.string.isEmptyOrWhitespace;
            goog.string.isEmptyOrWhitespaceSafe = function(a) {
              return goog.string.isEmptyOrWhitespace(goog.string.makeSafe(a));
            };
            goog.string.isEmptySafe = goog.string.isEmptyOrWhitespaceSafe;
            goog.string.isBreakingWhitespace = function(a) {
              return !/[^\t\n\r ]/.test(a);
            };
            goog.string.isAlpha = function(a) {
              return !/[^a-zA-Z]/.test(a);
            };
            goog.string.isNumeric = function(a) {
              return !/[^0-9]/.test(a);
            };
            goog.string.isAlphaNumeric = function(a) {
              return !/[^a-zA-Z0-9]/.test(a);
            };
            goog.string.isSpace = function(a) {
              return " " == a;
            };
            goog.string.isUnicodeChar = function(a) {
              return 1 == a.length && " " <= a && "~" >= a || "\x80" <= a && "\ufffd" >= a;
            };
            goog.string.stripNewlines = function(a) {
              return a.replace(/(\r\n|\r|\n)+/g, " ");
            };
            goog.string.canonicalizeNewlines = function(a) {
              return a.replace(/(\r\n|\r|\n)/g, "\n");
            };
            goog.string.normalizeWhitespace = function(a) {
              return a.replace(/\xa0|\s/g, " ");
            };
            goog.string.normalizeSpaces = function(a) {
              return a.replace(/\xa0|[ \t]+/g, " ");
            };
            goog.string.collapseBreakingSpaces = function(a) {
              return a.replace(/[\t\r\n ]+/g, " ").replace(/^[\t\r\n ]+|[\t\r\n ]+$/g, "");
            };
            goog.string.trim = goog.TRUSTED_SITE && String.prototype.trim ? function(a) {
              return a.trim();
            } : function(a) {
              return a.replace(/^[\s\xa0]+|[\s\xa0]+$/g, "");
            };
            goog.string.trimLeft = function(a) {
              return a.replace(/^[\s\xa0]+/, "");
            };
            goog.string.trimRight = function(a) {
              return a.replace(/[\s\xa0]+$/, "");
            };
            goog.string.caseInsensitiveCompare = function(a, b) {
              var c = String(a).toLowerCase(), d = String(b).toLowerCase();
              return c < d ? -1 : c == d ? 0 : 1;
            };
            goog.string.numberAwareCompare_ = function(a, b, c) {
              if (a == b) return 0;
              if (!a) return -1;
              if (!b) return 1;
              for (var d = a.toLowerCase().match(c), e = b.toLowerCase().match(c), f = Math.min(d.length, e.length), g = 0; g < f; g++) {
                c = d[g];
                var h = e[g];
                if (c != h) return a = parseInt(c, 10), !isNaN(a) && (b = parseInt(h, 10), !isNaN(b) && a - b) ? a - b : c < h ? -1 : 1;
              }
              return d.length != e.length ? d.length - e.length : a < b ? -1 : 1;
            };
            goog.string.intAwareCompare = function(a, b) {
              return goog.string.numberAwareCompare_(a, b, /\d+|\D+/g);
            };
            goog.string.floatAwareCompare = function(a, b) {
              return goog.string.numberAwareCompare_(a, b, /\d+|\.\d+|\D+/g);
            };
            goog.string.numerateCompare = goog.string.floatAwareCompare;
            goog.string.urlEncode = function(a) {
              return encodeURIComponent(String(a));
            };
            goog.string.urlDecode = function(a) {
              return decodeURIComponent(a.replace(/\+/g, " "));
            };
            goog.string.newLineToBr = function(a, b) {
              return a.replace(/(\r\n|\r|\n)/g, b ? "<br />" : "<br>");
            };
            goog.string.htmlEscape = function(a, b) {
              if (b) a = a.replace(goog.string.AMP_RE_, "&amp;").replace(goog.string.LT_RE_, "&lt;").replace(goog.string.GT_RE_, "&gt;").replace(goog.string.QUOT_RE_, "&quot;").replace(goog.string.SINGLE_QUOTE_RE_, "&#39;").replace(goog.string.NULL_RE_, "&#0;"), 
              goog.string.DETECT_DOUBLE_ESCAPING && (a = a.replace(goog.string.E_RE_, "&#101;")); else {
                if (!goog.string.ALL_RE_.test(a)) return a;
                -1 != a.indexOf("&") && (a = a.replace(goog.string.AMP_RE_, "&amp;"));
                -1 != a.indexOf("<") && (a = a.replace(goog.string.LT_RE_, "&lt;"));
                -1 != a.indexOf(">") && (a = a.replace(goog.string.GT_RE_, "&gt;"));
                -1 != a.indexOf('"') && (a = a.replace(goog.string.QUOT_RE_, "&quot;"));
                -1 != a.indexOf("'") && (a = a.replace(goog.string.SINGLE_QUOTE_RE_, "&#39;"));
                -1 != a.indexOf("\0") && (a = a.replace(goog.string.NULL_RE_, "&#0;"));
                goog.string.DETECT_DOUBLE_ESCAPING && -1 != a.indexOf("e") && (a = a.replace(goog.string.E_RE_, "&#101;"));
              }
              return a;
            };
            goog.string.AMP_RE_ = /&/g;
            goog.string.LT_RE_ = /</g;
            goog.string.GT_RE_ = />/g;
            goog.string.QUOT_RE_ = /"/g;
            goog.string.SINGLE_QUOTE_RE_ = /'/g;
            goog.string.NULL_RE_ = /\x00/g;
            goog.string.E_RE_ = /e/g;
            goog.string.ALL_RE_ = goog.string.DETECT_DOUBLE_ESCAPING ? /[\x00&<>"'e]/ : /[\x00&<>"']/;
            goog.string.unescapeEntities = function(a) {
              return goog.string.contains(a, "&") ? !goog.string.FORCE_NON_DOM_HTML_UNESCAPING && "document" in goog.global ? goog.string.unescapeEntitiesUsingDom_(a) : goog.string.unescapePureXmlEntities_(a) : a;
            };
            goog.string.unescapeEntitiesWithDocument = function(a, b) {
              return goog.string.contains(a, "&") ? goog.string.unescapeEntitiesUsingDom_(a, b) : a;
            };
            goog.string.unescapeEntitiesUsingDom_ = function(a, b) {
              var c = {
                "&amp;": "&",
                "&lt;": "<",
                "&gt;": ">",
                "&quot;": '"'
              }, d;
              d = b ? b.createElement("div") : goog.global.document.createElement("div");
              return a.replace(goog.string.HTML_ENTITY_PATTERN_, function(a, b) {
                var g = c[a];
                if (g) return g;
                if ("#" == b.charAt(0)) {
                  var h = Number("0" + b.substr(1));
                  isNaN(h) || (g = String.fromCharCode(h));
                }
                g || (d.innerHTML = a + " ", g = d.firstChild.nodeValue.slice(0, -1));
                return c[a] = g;
              });
            };
            goog.string.unescapePureXmlEntities_ = function(a) {
              return a.replace(/&([^;]+);/g, function(a, c) {
                switch (c) {
                 case "amp":
                  return "&";

                 case "lt":
                  return "<";

                 case "gt":
                  return ">";

                 case "quot":
                  return '"';

                 default:
                  if ("#" == c.charAt(0)) {
                    var d = Number("0" + c.substr(1));
                    if (!isNaN(d)) return String.fromCharCode(d);
                  }
                  return a;
                }
              });
            };
            goog.string.HTML_ENTITY_PATTERN_ = /&([^;\s<&]+);?/g;
            goog.string.whitespaceEscape = function(a, b) {
              return goog.string.newLineToBr(a.replace(/ {2}/g, " &#160;"), b);
            };
            goog.string.preserveSpaces = function(a) {
              return a.replace(/(^|[\n ]) /g, "$1" + goog.string.Unicode.NBSP);
            };
            goog.string.stripQuotes = function(a, b) {
              for (var c = b.length, d = 0; d < c; d++) {
                var e = 1 == c ? b : b.charAt(d);
                if (a.charAt(0) == e && a.charAt(a.length - 1) == e) return a.substring(1, a.length - 1);
              }
              return a;
            };
            goog.string.truncate = function(a, b, c) {
              c && (a = goog.string.unescapeEntities(a));
              a.length > b && (a = a.substring(0, b - 3) + "...");
              c && (a = goog.string.htmlEscape(a));
              return a;
            };
            goog.string.truncateMiddle = function(a, b, c, d) {
              c && (a = goog.string.unescapeEntities(a));
              if (d && a.length > b) {
                d > b && (d = b);
                var e = a.length - d;
                a = a.substring(0, b - d) + "..." + a.substring(e);
              } else a.length > b && (d = Math.floor(b / 2), e = a.length - d, a = a.substring(0, d + b % 2) + "..." + a.substring(e));
              c && (a = goog.string.htmlEscape(a));
              return a;
            };
            goog.string.specialEscapeChars_ = {
              "\0": "\\0",
              "\b": "\\b",
              "\f": "\\f",
              "\n": "\\n",
              "\r": "\\r",
              "\t": "\\t",
              "\v": "\\x0B",
              '"': '\\"',
              "\\": "\\\\",
              "<": "<"
            };
            goog.string.jsEscapeCache_ = {
              "'": "\\'"
            };
            goog.string.quote = function(a) {
              a = String(a);
              for (var b = [ '"' ], c = 0; c < a.length; c++) {
                var d = a.charAt(c), e = d.charCodeAt(0);
                b[c + 1] = goog.string.specialEscapeChars_[d] || (31 < e && 127 > e ? d : goog.string.escapeChar(d));
              }
              b.push('"');
              return b.join("");
            };
            goog.string.escapeString = function(a) {
              for (var b = [], c = 0; c < a.length; c++) b[c] = goog.string.escapeChar(a.charAt(c));
              return b.join("");
            };
            goog.string.escapeChar = function(a) {
              if (a in goog.string.jsEscapeCache_) return goog.string.jsEscapeCache_[a];
              if (a in goog.string.specialEscapeChars_) return goog.string.jsEscapeCache_[a] = goog.string.specialEscapeChars_[a];
              var b, c = a.charCodeAt(0);
              if (31 < c && 127 > c) b = a; else {
                256 > c ? (b = "\\x", 16 > c || 256 < c) && (b += "0") : (b = "\\u", 4096 > c && (b += "0"));
                b += c.toString(16).toUpperCase();
              }
              return goog.string.jsEscapeCache_[a] = b;
            };
            goog.string.contains = function(a, b) {
              return -1 != a.indexOf(b);
            };
            goog.string.caseInsensitiveContains = function(a, b) {
              return goog.string.contains(a.toLowerCase(), b.toLowerCase());
            };
            goog.string.countOf = function(a, b) {
              return a && b ? a.split(b).length - 1 : 0;
            };
            goog.string.removeAt = function(a, b, c) {
              var d = a;
              0 <= b && b < a.length && 0 < c && (d = a.substr(0, b) + a.substr(b + c, a.length - b - c));
              return d;
            };
            goog.string.remove = function(a, b) {
              var c = new RegExp(goog.string.regExpEscape(b), "");
              return a.replace(c, "");
            };
            goog.string.removeAll = function(a, b) {
              var c = new RegExp(goog.string.regExpEscape(b), "g");
              return a.replace(c, "");
            };
            goog.string.regExpEscape = function(a) {
              return String(a).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, "\\$1").replace(/\x08/g, "\\x08");
            };
            goog.string.repeat = String.prototype.repeat ? function(a, b) {
              return a.repeat(b);
            } : function(a, b) {
              return Array(b + 1).join(a);
            };
            goog.string.padNumber = function(a, b, c) {
              a = goog.isDef(c) ? a.toFixed(c) : String(a);
              c = a.indexOf(".");
              -1 == c && (c = a.length);
              return goog.string.repeat("0", Math.max(0, b - c)) + a;
            };
            goog.string.makeSafe = function(a) {
              return null == a ? "" : String(a);
            };
            goog.string.buildString = function(a) {
              return Array.prototype.join.call(arguments, "");
            };
            goog.string.getRandomString = function() {
              return Math.floor(2147483648 * Math.random()).toString(36) + Math.abs(Math.floor(2147483648 * Math.random()) ^ goog.now()).toString(36);
            };
            goog.string.compareVersions = function(a, b) {
              for (var c = 0, d = goog.string.trim(String(a)).split("."), e = goog.string.trim(String(b)).split("."), f = Math.max(d.length, e.length), g = 0; 0 == c && g < f; g++) {
                var h = d[g] || "", k = e[g] || "", l = RegExp("(\\d*)(\\D*)", "g"), p = RegExp("(\\d*)(\\D*)", "g");
                do {
                  var m = l.exec(h) || [ "", "", "" ], n = p.exec(k) || [ "", "", "" ];
                  if (0 == m[0].length && 0 == n[0].length) break;
                  var c = 0 == m[1].length ? 0 : parseInt(m[1], 10), q = 0 == n[1].length ? 0 : parseInt(n[1], 10), c = goog.string.compareElements_(c, q) || goog.string.compareElements_(0 == m[2].length, 0 == n[2].length) || goog.string.compareElements_(m[2], n[2]);
                } while (0 == c);
              }
              return c;
            };
            goog.string.compareElements_ = function(a, b) {
              return a < b ? -1 : a > b ? 1 : 0;
            };
            goog.string.hashCode = function(a) {
              for (var b = 0, c = 0; c < a.length; ++c) b = 31 * b + a.charCodeAt(c) >>> 0;
              return b;
            };
            goog.string.uniqueStringCounter_ = 2147483648 * Math.random() | 0;
            goog.string.createUniqueString = function() {
              return "goog_" + goog.string.uniqueStringCounter_++;
            };
            goog.string.toNumber = function(a) {
              var b = Number(a);
              return 0 == b && goog.string.isEmptyOrWhitespace(a) ? NaN : b;
            };
            goog.string.isLowerCamelCase = function(a) {
              return /^[a-z]+([A-Z][a-z]*)*$/.test(a);
            };
            goog.string.isUpperCamelCase = function(a) {
              return /^([A-Z][a-z]*)+$/.test(a);
            };
            goog.string.toCamelCase = function(a) {
              return String(a).replace(/\-([a-z])/g, function(a, c) {
                return c.toUpperCase();
              });
            };
            goog.string.toSelectorCase = function(a) {
              return String(a).replace(/([A-Z])/g, "-$1").toLowerCase();
            };
            goog.string.toTitleCase = function(a, b) {
              var c = goog.isString(b) ? goog.string.regExpEscape(b) : "\\s";
              return a.replace(new RegExp("(^" + (c ? "|[" + c + "]+" : "") + ")([a-z])", "g"), function(a, b, c) {
                return b + c.toUpperCase();
              });
            };
            goog.string.capitalize = function(a) {
              return String(a.charAt(0)).toUpperCase() + String(a.substr(1)).toLowerCase();
            };
            goog.string.parseInt = function(a) {
              isFinite(a) && (a = String(a));
              return goog.isString(a) ? /^\s*-?0x/i.test(a) ? parseInt(a, 16) : parseInt(a, 10) : NaN;
            };
            goog.string.splitLimit = function(a, b, c) {
              a = a.split(b);
              for (var d = []; 0 < c && a.length; ) d.push(a.shift()), c--;
              a.length && d.push(a.join(b));
              return d;
            };
            goog.string.editDistance = function(a, b) {
              var c = [], d = [];
              if (a == b) return 0;
              if (!a.length || !b.length) return Math.max(a.length, b.length);
              for (var e = 0; e < b.length + 1; e++) c[e] = e;
              for (e = 0; e < a.length; e++) {
                d[0] = e + 1;
                for (var f = 0; f < b.length; f++) d[f + 1] = Math.min(d[f] + 1, c[f + 1] + 1, c[f] + Number(a[e] != b[f]));
                for (f = 0; f < c.length; f++) c[f] = d[f];
              }
              return d[b.length];
            };
            goog.asserts = {};
            goog.asserts.ENABLE_ASSERTS = goog.DEBUG;
            goog.asserts.AssertionError = function(a, b) {
              b.unshift(a);
              goog.debug.Error.call(this, goog.string.subs.apply(null, b));
              b.shift();
              this.messagePattern = a;
            };
            goog.inherits(goog.asserts.AssertionError, goog.debug.Error);
            goog.asserts.AssertionError.prototype.name = "AssertionError";
            goog.asserts.DEFAULT_ERROR_HANDLER = function(a) {
              throw a;
            };
            goog.asserts.errorHandler_ = goog.asserts.DEFAULT_ERROR_HANDLER;
            goog.asserts.doAssertFailure_ = function(a, b, c, d) {
              var e = "Assertion failed";
              if (c) var e = e + ": " + c, f = d; else a && (e += ": " + a, f = b);
              a = new goog.asserts.AssertionError("" + e, f || []);
              goog.asserts.errorHandler_(a);
            };
            goog.asserts.setErrorHandler = function(a) {
              goog.asserts.ENABLE_ASSERTS && (goog.asserts.errorHandler_ = a);
            };
            goog.asserts.assert = function(a, b, c) {
              goog.asserts.ENABLE_ASSERTS && !a && goog.asserts.doAssertFailure_("", null, b, Array.prototype.slice.call(arguments, 2));
              return a;
            };
            goog.asserts.fail = function(a, b) {
              goog.asserts.ENABLE_ASSERTS && goog.asserts.errorHandler_(new goog.asserts.AssertionError("Failure" + (a ? ": " + a : ""), Array.prototype.slice.call(arguments, 1)));
            };
            goog.asserts.assertNumber = function(a, b, c) {
              goog.asserts.ENABLE_ASSERTS && !goog.isNumber(a) && goog.asserts.doAssertFailure_("Expected number but got %s: %s.", [ goog.typeOf(a), a ], b, Array.prototype.slice.call(arguments, 2));
              return a;
            };
            goog.asserts.assertString = function(a, b, c) {
              goog.asserts.ENABLE_ASSERTS && !goog.isString(a) && goog.asserts.doAssertFailure_("Expected string but got %s: %s.", [ goog.typeOf(a), a ], b, Array.prototype.slice.call(arguments, 2));
              return a;
            };
            goog.asserts.assertFunction = function(a, b, c) {
              goog.asserts.ENABLE_ASSERTS && !goog.isFunction(a) && goog.asserts.doAssertFailure_("Expected function but got %s: %s.", [ goog.typeOf(a), a ], b, Array.prototype.slice.call(arguments, 2));
              return a;
            };
            goog.asserts.assertObject = function(a, b, c) {
              goog.asserts.ENABLE_ASSERTS && !goog.isObject(a) && goog.asserts.doAssertFailure_("Expected object but got %s: %s.", [ goog.typeOf(a), a ], b, Array.prototype.slice.call(arguments, 2));
              return a;
            };
            goog.asserts.assertArray = function(a, b, c) {
              goog.asserts.ENABLE_ASSERTS && !goog.isArray(a) && goog.asserts.doAssertFailure_("Expected array but got %s: %s.", [ goog.typeOf(a), a ], b, Array.prototype.slice.call(arguments, 2));
              return a;
            };
            goog.asserts.assertBoolean = function(a, b, c) {
              goog.asserts.ENABLE_ASSERTS && !goog.isBoolean(a) && goog.asserts.doAssertFailure_("Expected boolean but got %s: %s.", [ goog.typeOf(a), a ], b, Array.prototype.slice.call(arguments, 2));
              return a;
            };
            goog.asserts.assertElement = function(a, b, c) {
              !goog.asserts.ENABLE_ASSERTS || goog.isObject(a) && a.nodeType == goog.dom.NodeType.ELEMENT || goog.asserts.doAssertFailure_("Expected Element but got %s: %s.", [ goog.typeOf(a), a ], b, Array.prototype.slice.call(arguments, 2));
              return a;
            };
            goog.asserts.assertInstanceof = function(a, b, c, d) {
              !goog.asserts.ENABLE_ASSERTS || a instanceof b || goog.asserts.doAssertFailure_("Expected instanceof %s but got %s.", [ goog.asserts.getType_(b), goog.asserts.getType_(a) ], c, Array.prototype.slice.call(arguments, 3));
              return a;
            };
            goog.asserts.assertObjectPrototypeIsIntact = function() {
              for (var a in Object.prototype) goog.asserts.fail(a + " should not be enumerable in Object.prototype.");
            };
            goog.asserts.getType_ = function(a) {
              return a instanceof Function ? a.displayName || a.name || "unknown type name" : a instanceof Object ? a.constructor.displayName || a.constructor.name || Object.prototype.toString.call(a) : null === a ? "null" : "undefined" === typeof a ? "undefined" : _typeof(a);
            };
            var jspb = {
              Map: function Map(a, b) {
                this.arr_ = a;
                this.valueCtor_ = b;
                this.map_ = {};
                this.arrClean = !0;
                0 < this.arr_.length && this.loadFromArray_();
              }
            };
            jspb.Map.prototype.loadFromArray_ = function() {
              for (var a = 0; a < this.arr_.length; a++) {
                var b = this.arr_[a], c = b[0];
                this.map_[c.toString()] = new jspb.Map.Entry_(c, b[1]);
              }
              this.arrClean = !0;
            };
            jspb.Map.prototype.toArray = function() {
              if (this.arrClean) {
                if (this.valueCtor_) {
                  var a = this.map_, b;
                  for (b in a) if (Object.prototype.hasOwnProperty.call(a, b)) {
                    var c = a[b].valueWrapper;
                    c && c.toArray();
                  }
                }
              } else {
                this.arr_.length = 0;
                a = this.stringKeys_();
                a.sort();
                for (b = 0; b < a.length; b++) {
                  var d = this.map_[a[b]];
                  (c = d.valueWrapper) && c.toArray();
                  this.arr_.push([ d.key, d.value ]);
                }
                this.arrClean = !0;
              }
              return this.arr_;
            };
            jspb.Map.prototype.toObject = function(a, b) {
              for (var c = this.toArray(), d = [], e = 0; e < c.length; e++) {
                var f = this.map_[c[e][0].toString()];
                this.wrapEntry_(f);
                var g = f.valueWrapper;
                g ? (goog.asserts.assert(b), d.push([ f.key, b(a, g) ])) : d.push([ f.key, f.value ]);
              }
              return d;
            };
            jspb.Map.fromObject = function(a, b, c) {
              b = new jspb.Map([], b);
              for (var d = 0; d < a.length; d++) {
                var e = a[d][0], f = c(a[d][1]);
                b.set(e, f);
              }
              return b;
            };
            jspb.Map.ArrayIteratorIterable_ = function(a) {
              this.idx_ = 0;
              this.arr_ = a;
            };
            jspb.Map.ArrayIteratorIterable_.prototype.next = function() {
              return this.idx_ < this.arr_.length ? {
                done: !1,
                value: this.arr_[this.idx_++]
              } : {
                done: !0,
                value: void 0
              };
            };
            $jscomp.initSymbol();
            "undefined" != typeof Symbol && ($jscomp.initSymbol(), $jscomp.initSymbolIterator(), 
            jspb.Map.ArrayIteratorIterable_.prototype[Symbol.iterator] = function() {
              return this;
            });
            jspb.Map.prototype.getLength = function() {
              return this.stringKeys_().length;
            };
            jspb.Map.prototype.clear = function() {
              this.map_ = {};
              this.arrClean = !1;
            };
            jspb.Map.prototype.del = function(a) {
              a = a.toString();
              var b = this.map_.hasOwnProperty(a);
              delete this.map_[a];
              this.arrClean = !1;
              return b;
            };
            jspb.Map.prototype.getEntryList = function() {
              var a = [], b = this.stringKeys_();
              b.sort();
              for (var c = 0; c < b.length; c++) {
                var d = this.map_[b[c]];
                a.push([ d.key, d.value ]);
              }
              return a;
            };
            jspb.Map.prototype.entries = function() {
              var a = [], b = this.stringKeys_();
              b.sort();
              for (var c = 0; c < b.length; c++) {
                var d = this.map_[b[c]];
                a.push([ d.key, this.wrapEntry_(d) ]);
              }
              return new jspb.Map.ArrayIteratorIterable_(a);
            };
            jspb.Map.prototype.keys = function() {
              var a = [], b = this.stringKeys_();
              b.sort();
              for (var c = 0; c < b.length; c++) a.push(this.map_[b[c]].key);
              return new jspb.Map.ArrayIteratorIterable_(a);
            };
            jspb.Map.prototype.values = function() {
              var a = [], b = this.stringKeys_();
              b.sort();
              for (var c = 0; c < b.length; c++) a.push(this.wrapEntry_(this.map_[b[c]]));
              return new jspb.Map.ArrayIteratorIterable_(a);
            };
            jspb.Map.prototype.forEach = function(a, b) {
              var c = this.stringKeys_();
              c.sort();
              for (var d = 0; d < c.length; d++) {
                var e = this.map_[c[d]];
                a.call(b, this.wrapEntry_(e), e.key, this);
              }
            };
            jspb.Map.prototype.set = function(a, b) {
              var c = new jspb.Map.Entry_(a);
              this.valueCtor_ ? (c.valueWrapper = b, c.value = b.toArray()) : c.value = b;
              this.map_[a.toString()] = c;
              this.arrClean = !1;
              return this;
            };
            jspb.Map.prototype.wrapEntry_ = function(a) {
              return this.valueCtor_ ? (a.valueWrapper || (a.valueWrapper = new this.valueCtor_(a.value)), 
              a.valueWrapper) : a.value;
            };
            jspb.Map.prototype.get = function(a) {
              if (a = this.map_[a.toString()]) return this.wrapEntry_(a);
            };
            jspb.Map.prototype.has = function(a) {
              return a.toString() in this.map_;
            };
            jspb.Map.prototype.serializeBinary = function(a, b, c, d, e) {
              var f = this.stringKeys_();
              f.sort();
              for (var g = 0; g < f.length; g++) {
                var h = this.map_[f[g]];
                b.beginSubMessage(a);
                c.call(b, 1, h.key);
                this.valueCtor_ ? d.call(b, 2, this.wrapEntry_(h), e) : d.call(b, 2, h.value);
                b.endSubMessage();
              }
            };
            jspb.Map.deserializeBinary = function(a, b, c, d, e) {
              for (var f = void 0, g = void 0; b.nextField() && !b.isEndGroup(); ) {
                var h = b.getFieldNumber();
                1 == h ? f = c.call(b) : 2 == h && (a.valueCtor_ ? (g = new a.valueCtor_(), d.call(b, g, e)) : g = d.call(b));
              }
              goog.asserts.assert(void 0 != f);
              goog.asserts.assert(void 0 != g);
              a.set(f, g);
            };
            jspb.Map.prototype.stringKeys_ = function() {
              var a = this.map_, b = [], c;
              for (c in a) Object.prototype.hasOwnProperty.call(a, c) && b.push(c);
              return b;
            };
            jspb.Map.Entry_ = function(a, b) {
              this.key = a;
              this.value = b;
              this.valueWrapper = void 0;
            };
            goog.array = {};
            goog.NATIVE_ARRAY_PROTOTYPES = goog.TRUSTED_SITE;
            goog.array.ASSUME_NATIVE_FUNCTIONS = !1;
            goog.array.peek = function(a) {
              return a[a.length - 1];
            };
            goog.array.last = goog.array.peek;
            goog.array.indexOf = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.indexOf) ? function(a, b, c) {
              goog.asserts.assert(null != a.length);
              return Array.prototype.indexOf.call(a, b, c);
            } : function(a, b, c) {
              c = null == c ? 0 : 0 > c ? Math.max(0, a.length + c) : c;
              if (goog.isString(a)) return goog.isString(b) && 1 == b.length ? a.indexOf(b, c) : -1;
              for (;c < a.length; c++) if (c in a && a[c] === b) return c;
              return -1;
            };
            goog.array.lastIndexOf = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.lastIndexOf) ? function(a, b, c) {
              goog.asserts.assert(null != a.length);
              return Array.prototype.lastIndexOf.call(a, b, null == c ? a.length - 1 : c);
            } : function(a, b, c) {
              c = null == c ? a.length - 1 : c;
              0 > c && (c = Math.max(0, a.length + c));
              if (goog.isString(a)) return goog.isString(b) && 1 == b.length ? a.lastIndexOf(b, c) : -1;
              for (;0 <= c; c--) if (c in a && a[c] === b) return c;
              return -1;
            };
            goog.array.forEach = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.forEach) ? function(a, b, c) {
              goog.asserts.assert(null != a.length);
              Array.prototype.forEach.call(a, b, c);
            } : function(a, b, c) {
              for (var d = a.length, e = goog.isString(a) ? a.split("") : a, f = 0; f < d; f++) f in e && b.call(c, e[f], f, a);
            };
            goog.array.forEachRight = function(a, b, c) {
              for (var d = a.length, e = goog.isString(a) ? a.split("") : a, d = d - 1; 0 <= d; --d) d in e && b.call(c, e[d], d, a);
            };
            goog.array.filter = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.filter) ? function(a, b, c) {
              goog.asserts.assert(null != a.length);
              return Array.prototype.filter.call(a, b, c);
            } : function(a, b, c) {
              for (var d = a.length, e = [], f = 0, g = goog.isString(a) ? a.split("") : a, h = 0; h < d; h++) if (h in g) {
                var k = g[h];
                b.call(c, k, h, a) && (e[f++] = k);
              }
              return e;
            };
            goog.array.map = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.map) ? function(a, b, c) {
              goog.asserts.assert(null != a.length);
              return Array.prototype.map.call(a, b, c);
            } : function(a, b, c) {
              for (var d = a.length, e = Array(d), f = goog.isString(a) ? a.split("") : a, g = 0; g < d; g++) g in f && (e[g] = b.call(c, f[g], g, a));
              return e;
            };
            goog.array.reduce = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.reduce) ? function(a, b, c, d) {
              goog.asserts.assert(null != a.length);
              d && (b = goog.bind(b, d));
              return Array.prototype.reduce.call(a, b, c);
            } : function(a, b, c, d) {
              var e = c;
              goog.array.forEach(a, function(c, g) {
                e = b.call(d, e, c, g, a);
              });
              return e;
            };
            goog.array.reduceRight = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.reduceRight) ? function(a, b, c, d) {
              goog.asserts.assert(null != a.length);
              goog.asserts.assert(null != b);
              d && (b = goog.bind(b, d));
              return Array.prototype.reduceRight.call(a, b, c);
            } : function(a, b, c, d) {
              var e = c;
              goog.array.forEachRight(a, function(c, g) {
                e = b.call(d, e, c, g, a);
              });
              return e;
            };
            goog.array.some = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.some) ? function(a, b, c) {
              goog.asserts.assert(null != a.length);
              return Array.prototype.some.call(a, b, c);
            } : function(a, b, c) {
              for (var d = a.length, e = goog.isString(a) ? a.split("") : a, f = 0; f < d; f++) if (f in e && b.call(c, e[f], f, a)) return !0;
              return !1;
            };
            goog.array.every = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.every) ? function(a, b, c) {
              goog.asserts.assert(null != a.length);
              return Array.prototype.every.call(a, b, c);
            } : function(a, b, c) {
              for (var d = a.length, e = goog.isString(a) ? a.split("") : a, f = 0; f < d; f++) if (f in e && !b.call(c, e[f], f, a)) return !1;
              return !0;
            };
            goog.array.count = function(a, b, c) {
              var d = 0;
              goog.array.forEach(a, function(a, f, g) {
                b.call(c, a, f, g) && ++d;
              }, c);
              return d;
            };
            goog.array.find = function(a, b, c) {
              b = goog.array.findIndex(a, b, c);
              return 0 > b ? null : goog.isString(a) ? a.charAt(b) : a[b];
            };
            goog.array.findIndex = function(a, b, c) {
              for (var d = a.length, e = goog.isString(a) ? a.split("") : a, f = 0; f < d; f++) if (f in e && b.call(c, e[f], f, a)) return f;
              return -1;
            };
            goog.array.findRight = function(a, b, c) {
              b = goog.array.findIndexRight(a, b, c);
              return 0 > b ? null : goog.isString(a) ? a.charAt(b) : a[b];
            };
            goog.array.findIndexRight = function(a, b, c) {
              for (var d = a.length, e = goog.isString(a) ? a.split("") : a, d = d - 1; 0 <= d; d--) if (d in e && b.call(c, e[d], d, a)) return d;
              return -1;
            };
            goog.array.contains = function(a, b) {
              return 0 <= goog.array.indexOf(a, b);
            };
            goog.array.isEmpty = function(a) {
              return 0 == a.length;
            };
            goog.array.clear = function(a) {
              if (!goog.isArray(a)) for (var b = a.length - 1; 0 <= b; b--) delete a[b];
              a.length = 0;
            };
            goog.array.insert = function(a, b) {
              goog.array.contains(a, b) || a.push(b);
            };
            goog.array.insertAt = function(a, b, c) {
              goog.array.splice(a, c, 0, b);
            };
            goog.array.insertArrayAt = function(a, b, c) {
              goog.partial(goog.array.splice, a, c, 0).apply(null, b);
            };
            goog.array.insertBefore = function(a, b, c) {
              var d;
              2 == arguments.length || 0 > (d = goog.array.indexOf(a, c)) ? a.push(b) : goog.array.insertAt(a, b, d);
            };
            goog.array.remove = function(a, b) {
              var c = goog.array.indexOf(a, b), d;
              (d = 0 <= c) && goog.array.removeAt(a, c);
              return d;
            };
            goog.array.removeAt = function(a, b) {
              goog.asserts.assert(null != a.length);
              return 1 == Array.prototype.splice.call(a, b, 1).length;
            };
            goog.array.removeIf = function(a, b, c) {
              b = goog.array.findIndex(a, b, c);
              return 0 <= b && (goog.array.removeAt(a, b), !0);
            };
            goog.array.removeAllIf = function(a, b, c) {
              var d = 0;
              goog.array.forEachRight(a, function(e, f) {
                b.call(c, e, f, a) && goog.array.removeAt(a, f) && d++;
              });
              return d;
            };
            goog.array.concat = function(a) {
              return Array.prototype.concat.apply(Array.prototype, arguments);
            };
            goog.array.join = function(a) {
              return Array.prototype.concat.apply(Array.prototype, arguments);
            };
            goog.array.toArray = function(a) {
              var b = a.length;
              if (0 < b) {
                for (var c = Array(b), d = 0; d < b; d++) c[d] = a[d];
                return c;
              }
              return [];
            };
            goog.array.clone = goog.array.toArray;
            goog.array.extend = function(a, b) {
              for (var c = 1; c < arguments.length; c++) {
                var d = arguments[c];
                if (goog.isArrayLike(d)) {
                  var e = a.length || 0, f = d.length || 0;
                  a.length = e + f;
                  for (var g = 0; g < f; g++) a[e + g] = d[g];
                } else a.push(d);
              }
            };
            goog.array.splice = function(a, b, c, d) {
              goog.asserts.assert(null != a.length);
              return Array.prototype.splice.apply(a, goog.array.slice(arguments, 1));
            };
            goog.array.slice = function(a, b, c) {
              goog.asserts.assert(null != a.length);
              return 2 >= arguments.length ? Array.prototype.slice.call(a, b) : Array.prototype.slice.call(a, b, c);
            };
            goog.array.removeDuplicates = function(a, b, c) {
              b = b || a;
              var d = function d(a) {
                return goog.isObject(a) ? "o" + goog.getUid(a) : ("undefined" === typeof a ? "undefined" : _typeof(a)).charAt(0) + a;
              };
              c = c || d;
              for (var d = {}, e = 0, f = 0; f < a.length; ) {
                var g = a[f++], h = c(g);
                Object.prototype.hasOwnProperty.call(d, h) || (d[h] = !0, b[e++] = g);
              }
              b.length = e;
            };
            goog.array.binarySearch = function(a, b, c) {
              return goog.array.binarySearch_(a, c || goog.array.defaultCompare, !1, b);
            };
            goog.array.binarySelect = function(a, b, c) {
              return goog.array.binarySearch_(a, b, !0, void 0, c);
            };
            goog.array.binarySearch_ = function(a, b, c, d, e) {
              for (var f = 0, g = a.length, h; f < g; ) {
                var k = f + g >> 1, l;
                l = c ? b.call(e, a[k], k, a) : b(d, a[k]);
                0 < l ? f = k + 1 : (g = k, h = !l);
              }
              return h ? f : ~f;
            };
            goog.array.sort = function(a, b) {
              a.sort(b || goog.array.defaultCompare);
            };
            goog.array.stableSort = function(a, b) {
              for (var c = 0; c < a.length; c++) a[c] = {
                index: c,
                value: a[c]
              };
              var d = b || goog.array.defaultCompare;
              goog.array.sort(a, function(a, b) {
                return d(a.value, b.value) || a.index - b.index;
              });
              for (c = 0; c < a.length; c++) a[c] = a[c].value;
            };
            goog.array.sortByKey = function(a, b, c) {
              var d = c || goog.array.defaultCompare;
              goog.array.sort(a, function(a, c) {
                return d(b(a), b(c));
              });
            };
            goog.array.sortObjectsByKey = function(a, b, c) {
              goog.array.sortByKey(a, function(a) {
                return a[b];
              }, c);
            };
            goog.array.isSorted = function(a, b, c) {
              b = b || goog.array.defaultCompare;
              for (var d = 1; d < a.length; d++) {
                var e = b(a[d - 1], a[d]);
                if (0 < e || 0 == e && c) return !1;
              }
              return !0;
            };
            goog.array.equals = function(a, b, c) {
              if (!goog.isArrayLike(a) || !goog.isArrayLike(b) || a.length != b.length) return !1;
              var d = a.length;
              c = c || goog.array.defaultCompareEquality;
              for (var e = 0; e < d; e++) if (!c(a[e], b[e])) return !1;
              return !0;
            };
            goog.array.compare3 = function(a, b, c) {
              c = c || goog.array.defaultCompare;
              for (var d = Math.min(a.length, b.length), e = 0; e < d; e++) {
                var f = c(a[e], b[e]);
                if (0 != f) return f;
              }
              return goog.array.defaultCompare(a.length, b.length);
            };
            goog.array.defaultCompare = function(a, b) {
              return a > b ? 1 : a < b ? -1 : 0;
            };
            goog.array.inverseDefaultCompare = function(a, b) {
              return -goog.array.defaultCompare(a, b);
            };
            goog.array.defaultCompareEquality = function(a, b) {
              return a === b;
            };
            goog.array.binaryInsert = function(a, b, c) {
              c = goog.array.binarySearch(a, b, c);
              return 0 > c && (goog.array.insertAt(a, b, -(c + 1)), !0);
            };
            goog.array.binaryRemove = function(a, b, c) {
              b = goog.array.binarySearch(a, b, c);
              return 0 <= b && goog.array.removeAt(a, b);
            };
            goog.array.bucket = function(a, b, c) {
              for (var d = {}, e = 0; e < a.length; e++) {
                var f = a[e], g = b.call(c, f, e, a);
                goog.isDef(g) && (d[g] || (d[g] = [])).push(f);
              }
              return d;
            };
            goog.array.toObject = function(a, b, c) {
              var d = {};
              goog.array.forEach(a, function(e, f) {
                d[b.call(c, e, f, a)] = e;
              });
              return d;
            };
            goog.array.range = function(a, b, c) {
              var d = [], e = 0, f = a;
              c = c || 1;
              void 0 !== b && (e = a, f = b);
              if (0 > c * (f - e)) return [];
              if (0 < c) for (a = e; a < f; a += c) d.push(a); else for (a = e; a > f; a += c) d.push(a);
              return d;
            };
            goog.array.repeat = function(a, b) {
              for (var c = [], d = 0; d < b; d++) c[d] = a;
              return c;
            };
            goog.array.flatten = function(a) {
              for (var b = [], c = 0; c < arguments.length; c++) {
                var d = arguments[c];
                if (goog.isArray(d)) for (var e = 0; e < d.length; e += 8192) for (var f = goog.array.slice(d, e, e + 8192), f = goog.array.flatten.apply(null, f), g = 0; g < f.length; g++) b.push(f[g]); else b.push(d);
              }
              return b;
            };
            goog.array.rotate = function(a, b) {
              goog.asserts.assert(null != a.length);
              a.length && (b %= a.length, 0 < b ? Array.prototype.unshift.apply(a, a.splice(-b, b)) : 0 > b && Array.prototype.push.apply(a, a.splice(0, -b)));
              return a;
            };
            goog.array.moveItem = function(a, b, c) {
              goog.asserts.assert(0 <= b && b < a.length);
              goog.asserts.assert(0 <= c && c < a.length);
              b = Array.prototype.splice.call(a, b, 1);
              Array.prototype.splice.call(a, c, 0, b[0]);
            };
            goog.array.zip = function(a) {
              if (!arguments.length) return [];
              for (var b = [], c = arguments[0].length, d = 1; d < arguments.length; d++) arguments[d].length < c && (c = arguments[d].length);
              for (d = 0; d < c; d++) {
                for (var e = [], f = 0; f < arguments.length; f++) e.push(arguments[f][d]);
                b.push(e);
              }
              return b;
            };
            goog.array.shuffle = function(a, b) {
              for (var c = b || Math.random, d = a.length - 1; 0 < d; d--) {
                var e = Math.floor(c() * (d + 1)), f = a[d];
                a[d] = a[e];
                a[e] = f;
              }
            };
            goog.array.copyByIndex = function(a, b) {
              var c = [];
              goog.array.forEach(b, function(b) {
                c.push(a[b]);
              });
              return c;
            };
            goog.crypt = {};
            goog.crypt.stringToByteArray = function(a) {
              for (var b = [], c = 0, d = 0; d < a.length; d++) {
                for (var e = a.charCodeAt(d); 255 < e; ) b[c++] = 255 & e, e >>= 8;
                b[c++] = e;
              }
              return b;
            };
            goog.crypt.byteArrayToString = function(a) {
              if (8192 >= a.length) return String.fromCharCode.apply(null, a);
              for (var b = "", c = 0; c < a.length; c += 8192) var d = goog.array.slice(a, c, c + 8192), b = b + String.fromCharCode.apply(null, d);
              return b;
            };
            goog.crypt.byteArrayToHex = function(a) {
              return goog.array.map(a, function(a) {
                a = a.toString(16);
                return 1 < a.length ? a : "0" + a;
              }).join("");
            };
            goog.crypt.hexToByteArray = function(a) {
              goog.asserts.assert(0 == a.length % 2, "Key string length must be multiple of 2");
              for (var b = [], c = 0; c < a.length; c += 2) b.push(parseInt(a.substring(c, c + 2), 16));
              return b;
            };
            goog.crypt.stringToUtf8ByteArray = function(a) {
              for (var b = [], c = 0, d = 0; d < a.length; d++) {
                var e = a.charCodeAt(d);
                128 > e ? b[c++] = e : (2048 > e ? b[c++] = e >> 6 | 192 : (55296 == (64512 & e) && d + 1 < a.length && 56320 == (64512 & a.charCodeAt(d + 1)) ? (e = 65536 + ((1023 & e) << 10) + (1023 & a.charCodeAt(++d)), 
                b[c++] = e >> 18 | 240, b[c++] = e >> 12 & 63 | 128) : b[c++] = e >> 12 | 224, b[c++] = e >> 6 & 63 | 128), 
                b[c++] = 63 & e | 128);
              }
              return b;
            };
            goog.crypt.utf8ByteArrayToString = function(a) {
              for (var b = [], c = 0, d = 0; c < a.length; ) {
                var e = a[c++];
                if (128 > e) b[d++] = String.fromCharCode(e); else if (191 < e && 224 > e) {
                  var f = a[c++];
                  b[d++] = String.fromCharCode((31 & e) << 6 | 63 & f);
                } else if (239 < e && 365 > e) {
                  var f = a[c++], g = a[c++], h = a[c++], e = ((7 & e) << 18 | (63 & f) << 12 | (63 & g) << 6 | 63 & h) - 65536;
                  b[d++] = String.fromCharCode(55296 + (e >> 10));
                  b[d++] = String.fromCharCode(56320 + (1023 & e));
                } else f = a[c++], g = a[c++], b[d++] = String.fromCharCode((15 & e) << 12 | (63 & f) << 6 | 63 & g);
              }
              return b.join("");
            };
            goog.crypt.xorByteArray = function(a, b) {
              goog.asserts.assert(a.length == b.length, "XOR array lengths must match");
              for (var c = [], d = 0; d < a.length; d++) c.push(a[d] ^ b[d]);
              return c;
            };
            goog.labs = {};
            goog.labs.userAgent = {};
            goog.labs.userAgent.util = {};
            goog.labs.userAgent.util.getNativeUserAgentString_ = function() {
              var a = goog.labs.userAgent.util.getNavigator_();
              return a && (a = a.userAgent) ? a : "";
            };
            goog.labs.userAgent.util.getNavigator_ = function() {
              return goog.global.navigator;
            };
            goog.labs.userAgent.util.userAgent_ = goog.labs.userAgent.util.getNativeUserAgentString_();
            goog.labs.userAgent.util.setUserAgent = function(a) {
              goog.labs.userAgent.util.userAgent_ = a || goog.labs.userAgent.util.getNativeUserAgentString_();
            };
            goog.labs.userAgent.util.getUserAgent = function() {
              return goog.labs.userAgent.util.userAgent_;
            };
            goog.labs.userAgent.util.matchUserAgent = function(a) {
              var b = goog.labs.userAgent.util.getUserAgent();
              return goog.string.contains(b, a);
            };
            goog.labs.userAgent.util.matchUserAgentIgnoreCase = function(a) {
              var b = goog.labs.userAgent.util.getUserAgent();
              return goog.string.caseInsensitiveContains(b, a);
            };
            goog.labs.userAgent.util.extractVersionTuples = function(a) {
              for (var b = RegExp("(\\w[\\w ]+)/([^\\s]+)\\s*(?:\\((.*?)\\))?", "g"), c = [], d; d = b.exec(a); ) c.push([ d[1], d[2], d[3] || void 0 ]);
              return c;
            };
            goog.labs.userAgent.platform = {};
            goog.labs.userAgent.platform.isAndroid = function() {
              return goog.labs.userAgent.util.matchUserAgent("Android");
            };
            goog.labs.userAgent.platform.isIpod = function() {
              return goog.labs.userAgent.util.matchUserAgent("iPod");
            };
            goog.labs.userAgent.platform.isIphone = function() {
              return goog.labs.userAgent.util.matchUserAgent("iPhone") && !goog.labs.userAgent.util.matchUserAgent("iPod") && !goog.labs.userAgent.util.matchUserAgent("iPad");
            };
            goog.labs.userAgent.platform.isIpad = function() {
              return goog.labs.userAgent.util.matchUserAgent("iPad");
            };
            goog.labs.userAgent.platform.isIos = function() {
              return goog.labs.userAgent.platform.isIphone() || goog.labs.userAgent.platform.isIpad() || goog.labs.userAgent.platform.isIpod();
            };
            goog.labs.userAgent.platform.isMacintosh = function() {
              return goog.labs.userAgent.util.matchUserAgent("Macintosh");
            };
            goog.labs.userAgent.platform.isLinux = function() {
              return goog.labs.userAgent.util.matchUserAgent("Linux");
            };
            goog.labs.userAgent.platform.isWindows = function() {
              return goog.labs.userAgent.util.matchUserAgent("Windows");
            };
            goog.labs.userAgent.platform.isChromeOS = function() {
              return goog.labs.userAgent.util.matchUserAgent("CrOS");
            };
            goog.labs.userAgent.platform.getVersion = function() {
              var a = goog.labs.userAgent.util.getUserAgent(), b = "";
              goog.labs.userAgent.platform.isWindows() ? (b = /Windows (?:NT|Phone) ([0-9.]+)/, 
              b = (a = b.exec(a)) ? a[1] : "0.0") : goog.labs.userAgent.platform.isIos() ? (b = /(?:iPhone|iPod|iPad|CPU)\s+OS\s+(\S+)/, 
              b = (a = b.exec(a)) && a[1].replace(/_/g, ".")) : goog.labs.userAgent.platform.isMacintosh() ? (b = /Mac OS X ([0-9_.]+)/, 
              b = (a = b.exec(a)) ? a[1].replace(/_/g, ".") : "10") : goog.labs.userAgent.platform.isAndroid() ? (b = /Android\s+([^\);]+)(\)|;)/, 
              b = (a = b.exec(a)) && a[1]) : goog.labs.userAgent.platform.isChromeOS() && (b = /(?:CrOS\s+(?:i686|x86_64)\s+([0-9.]+))/, 
              b = (a = b.exec(a)) && a[1]);
              return b || "";
            };
            goog.labs.userAgent.platform.isVersionOrHigher = function(a) {
              return 0 <= goog.string.compareVersions(goog.labs.userAgent.platform.getVersion(), a);
            };
            goog.object = {};
            goog.object.forEach = function(a, b, c) {
              for (var d in a) b.call(c, a[d], d, a);
            };
            goog.object.filter = function(a, b, c) {
              var d = {}, e;
              for (e in a) b.call(c, a[e], e, a) && (d[e] = a[e]);
              return d;
            };
            goog.object.map = function(a, b, c) {
              var d = {}, e;
              for (e in a) d[e] = b.call(c, a[e], e, a);
              return d;
            };
            goog.object.some = function(a, b, c) {
              for (var d in a) if (b.call(c, a[d], d, a)) return !0;
              return !1;
            };
            goog.object.every = function(a, b, c) {
              for (var d in a) if (!b.call(c, a[d], d, a)) return !1;
              return !0;
            };
            goog.object.getCount = function(a) {
              var b = 0, c;
              for (c in a) b++;
              return b;
            };
            goog.object.getAnyKey = function(a) {
              for (var b in a) return b;
            };
            goog.object.getAnyValue = function(a) {
              for (var b in a) return a[b];
            };
            goog.object.contains = function(a, b) {
              return goog.object.containsValue(a, b);
            };
            goog.object.getValues = function(a) {
              var b = [], c = 0, d;
              for (d in a) b[c++] = a[d];
              return b;
            };
            goog.object.getKeys = function(a) {
              var b = [], c = 0, d;
              for (d in a) b[c++] = d;
              return b;
            };
            goog.object.getValueByKeys = function(a, b) {
              for (var c = goog.isArrayLike(b), d = c ? b : arguments, c = c ? 0 : 1; c < d.length && (a = a[d[c]], 
              goog.isDef(a)); c++) ;
              return a;
            };
            goog.object.containsKey = function(a, b) {
              return null !== a && b in a;
            };
            goog.object.containsValue = function(a, b) {
              for (var c in a) if (a[c] == b) return !0;
              return !1;
            };
            goog.object.findKey = function(a, b, c) {
              for (var d in a) if (b.call(c, a[d], d, a)) return d;
            };
            goog.object.findValue = function(a, b, c) {
              return (b = goog.object.findKey(a, b, c)) && a[b];
            };
            goog.object.isEmpty = function(a) {
              for (var b in a) return !1;
              return !0;
            };
            goog.object.clear = function(a) {
              for (var b in a) delete a[b];
            };
            goog.object.remove = function(a, b) {
              var c;
              (c = b in a) && delete a[b];
              return c;
            };
            goog.object.add = function(a, b, c) {
              if (null !== a && b in a) throw Error('The object already contains the key "' + b + '"');
              goog.object.set(a, b, c);
            };
            goog.object.get = function(a, b, c) {
              return null !== a && b in a ? a[b] : c;
            };
            goog.object.set = function(a, b, c) {
              a[b] = c;
            };
            goog.object.setIfUndefined = function(a, b, c) {
              return b in a ? a[b] : a[b] = c;
            };
            goog.object.setWithReturnValueIfNotSet = function(a, b, c) {
              if (b in a) return a[b];
              c = c();
              return a[b] = c;
            };
            goog.object.equals = function(a, b) {
              for (var c in a) if (!(c in b) || a[c] !== b[c]) return !1;
              for (c in b) if (!(c in a)) return !1;
              return !0;
            };
            goog.object.clone = function(a) {
              var b = {}, c;
              for (c in a) b[c] = a[c];
              return b;
            };
            goog.object.unsafeClone = function(a) {
              var b = goog.typeOf(a);
              if ("object" == b || "array" == b) {
                if (goog.isFunction(a.clone)) return a.clone();
                var b = "array" == b ? [] : {}, c;
                for (c in a) b[c] = goog.object.unsafeClone(a[c]);
                return b;
              }
              return a;
            };
            goog.object.transpose = function(a) {
              var b = {}, c;
              for (c in a) b[a[c]] = c;
              return b;
            };
            goog.object.PROTOTYPE_FIELDS_ = "constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");
            goog.object.extend = function(a, b) {
              for (var c, d, e = 1; e < arguments.length; e++) {
                d = arguments[e];
                for (c in d) a[c] = d[c];
                for (var f = 0; f < goog.object.PROTOTYPE_FIELDS_.length; f++) c = goog.object.PROTOTYPE_FIELDS_[f], 
                Object.prototype.hasOwnProperty.call(d, c) && (a[c] = d[c]);
              }
            };
            goog.object.create = function(a) {
              var b = arguments.length;
              if (1 == b && goog.isArray(arguments[0])) return goog.object.create.apply(null, arguments[0]);
              if (b % 2) throw Error("Uneven number of arguments");
              for (var c = {}, d = 0; d < b; d += 2) c[arguments[d]] = arguments[d + 1];
              return c;
            };
            goog.object.createSet = function(a) {
              var b = arguments.length;
              if (1 == b && goog.isArray(arguments[0])) return goog.object.createSet.apply(null, arguments[0]);
              for (var c = {}, d = 0; d < b; d++) c[arguments[d]] = !0;
              return c;
            };
            goog.object.createImmutableView = function(a) {
              var b = a;
              Object.isFrozen && !Object.isFrozen(a) && (b = Object.create(a), Object.freeze(b));
              return b;
            };
            goog.object.isImmutableView = function(a) {
              return !!Object.isFrozen && Object.isFrozen(a);
            };
            goog.labs.userAgent.browser = {};
            goog.labs.userAgent.browser.matchOpera_ = function() {
              return goog.labs.userAgent.util.matchUserAgent("Opera") || goog.labs.userAgent.util.matchUserAgent("OPR");
            };
            goog.labs.userAgent.browser.matchIE_ = function() {
              return goog.labs.userAgent.util.matchUserAgent("Trident") || goog.labs.userAgent.util.matchUserAgent("MSIE");
            };
            goog.labs.userAgent.browser.matchEdge_ = function() {
              return goog.labs.userAgent.util.matchUserAgent("Edge");
            };
            goog.labs.userAgent.browser.matchFirefox_ = function() {
              return goog.labs.userAgent.util.matchUserAgent("Firefox");
            };
            goog.labs.userAgent.browser.matchSafari_ = function() {
              return goog.labs.userAgent.util.matchUserAgent("Safari") && !(goog.labs.userAgent.browser.matchChrome_() || goog.labs.userAgent.browser.matchCoast_() || goog.labs.userAgent.browser.matchOpera_() || goog.labs.userAgent.browser.matchEdge_() || goog.labs.userAgent.browser.isSilk() || goog.labs.userAgent.util.matchUserAgent("Android"));
            };
            goog.labs.userAgent.browser.matchCoast_ = function() {
              return goog.labs.userAgent.util.matchUserAgent("Coast");
            };
            goog.labs.userAgent.browser.matchIosWebview_ = function() {
              return (goog.labs.userAgent.util.matchUserAgent("iPad") || goog.labs.userAgent.util.matchUserAgent("iPhone")) && !goog.labs.userAgent.browser.matchSafari_() && !goog.labs.userAgent.browser.matchChrome_() && !goog.labs.userAgent.browser.matchCoast_() && goog.labs.userAgent.util.matchUserAgent("AppleWebKit");
            };
            goog.labs.userAgent.browser.matchChrome_ = function() {
              return (goog.labs.userAgent.util.matchUserAgent("Chrome") || goog.labs.userAgent.util.matchUserAgent("CriOS")) && !goog.labs.userAgent.browser.matchOpera_() && !goog.labs.userAgent.browser.matchEdge_();
            };
            goog.labs.userAgent.browser.matchAndroidBrowser_ = function() {
              return goog.labs.userAgent.util.matchUserAgent("Android") && !(goog.labs.userAgent.browser.isChrome() || goog.labs.userAgent.browser.isFirefox() || goog.labs.userAgent.browser.isOpera() || goog.labs.userAgent.browser.isSilk());
            };
            goog.labs.userAgent.browser.isOpera = goog.labs.userAgent.browser.matchOpera_;
            goog.labs.userAgent.browser.isIE = goog.labs.userAgent.browser.matchIE_;
            goog.labs.userAgent.browser.isEdge = goog.labs.userAgent.browser.matchEdge_;
            goog.labs.userAgent.browser.isFirefox = goog.labs.userAgent.browser.matchFirefox_;
            goog.labs.userAgent.browser.isSafari = goog.labs.userAgent.browser.matchSafari_;
            goog.labs.userAgent.browser.isCoast = goog.labs.userAgent.browser.matchCoast_;
            goog.labs.userAgent.browser.isIosWebview = goog.labs.userAgent.browser.matchIosWebview_;
            goog.labs.userAgent.browser.isChrome = goog.labs.userAgent.browser.matchChrome_;
            goog.labs.userAgent.browser.isAndroidBrowser = goog.labs.userAgent.browser.matchAndroidBrowser_;
            goog.labs.userAgent.browser.isSilk = function() {
              return goog.labs.userAgent.util.matchUserAgent("Silk");
            };
            goog.labs.userAgent.browser.getVersion = function() {
              function a(a) {
                a = goog.array.find(a, d);
                return c[a] || "";
              }
              var b = goog.labs.userAgent.util.getUserAgent();
              if (goog.labs.userAgent.browser.isIE()) return goog.labs.userAgent.browser.getIEVersion_(b);
              var b = goog.labs.userAgent.util.extractVersionTuples(b), c = {};
              goog.array.forEach(b, function(a) {
                c[a[0]] = a[1];
              });
              var d = goog.partial(goog.object.containsKey, c);
              return goog.labs.userAgent.browser.isOpera() ? a([ "Version", "Opera", "OPR" ]) : goog.labs.userAgent.browser.isEdge() ? a([ "Edge" ]) : goog.labs.userAgent.browser.isChrome() ? a([ "Chrome", "CriOS" ]) : (b = b[2]) && b[1] || "";
            };
            goog.labs.userAgent.browser.isVersionOrHigher = function(a) {
              return 0 <= goog.string.compareVersions(goog.labs.userAgent.browser.getVersion(), a);
            };
            goog.labs.userAgent.browser.getIEVersion_ = function(a) {
              var b = /rv: *([\d\.]*)/.exec(a);
              if (b && b[1]) return b[1];
              var b = "", c = /MSIE +([\d\.]+)/.exec(a);
              if (c && c[1]) if (a = /Trident\/(\d.\d)/.exec(a), "7.0" == c[1]) if (a && a[1]) switch (a[1]) {
               case "4.0":
                b = "8.0";
                break;

               case "5.0":
                b = "9.0";
                break;

               case "6.0":
                b = "10.0";
                break;

               case "7.0":
                b = "11.0";
              } else b = "7.0"; else b = c[1];
              return b;
            };
            goog.labs.userAgent.engine = {};
            goog.labs.userAgent.engine.isPresto = function() {
              return goog.labs.userAgent.util.matchUserAgent("Presto");
            };
            goog.labs.userAgent.engine.isTrident = function() {
              return goog.labs.userAgent.util.matchUserAgent("Trident") || goog.labs.userAgent.util.matchUserAgent("MSIE");
            };
            goog.labs.userAgent.engine.isEdge = function() {
              return goog.labs.userAgent.util.matchUserAgent("Edge");
            };
            goog.labs.userAgent.engine.isWebKit = function() {
              return goog.labs.userAgent.util.matchUserAgentIgnoreCase("WebKit") && !goog.labs.userAgent.engine.isEdge();
            };
            goog.labs.userAgent.engine.isGecko = function() {
              return goog.labs.userAgent.util.matchUserAgent("Gecko") && !goog.labs.userAgent.engine.isWebKit() && !goog.labs.userAgent.engine.isTrident() && !goog.labs.userAgent.engine.isEdge();
            };
            goog.labs.userAgent.engine.getVersion = function() {
              var a = goog.labs.userAgent.util.getUserAgent();
              if (a) {
                var a = goog.labs.userAgent.util.extractVersionTuples(a), b = goog.labs.userAgent.engine.getEngineTuple_(a);
                if (b) return "Gecko" == b[0] ? goog.labs.userAgent.engine.getVersionForKey_(a, "Firefox") : b[1];
                var a = a[0], c;
                if (a && (c = a[2]) && (c = /Trident\/([^\s;]+)/.exec(c))) return c[1];
              }
              return "";
            };
            goog.labs.userAgent.engine.getEngineTuple_ = function(a) {
              if (!goog.labs.userAgent.engine.isEdge()) return a[1];
              for (var b = 0; b < a.length; b++) {
                var c = a[b];
                if ("Edge" == c[0]) return c;
              }
            };
            goog.labs.userAgent.engine.isVersionOrHigher = function(a) {
              return 0 <= goog.string.compareVersions(goog.labs.userAgent.engine.getVersion(), a);
            };
            goog.labs.userAgent.engine.getVersionForKey_ = function(a, b) {
              var c = goog.array.find(a, function(a) {
                return b == a[0];
              });
              return c && c[1] || "";
            };
            goog.userAgent = {};
            goog.userAgent.ASSUME_IE = !1;
            goog.userAgent.ASSUME_EDGE = !1;
            goog.userAgent.ASSUME_GECKO = !1;
            goog.userAgent.ASSUME_WEBKIT = !1;
            goog.userAgent.ASSUME_MOBILE_WEBKIT = !1;
            goog.userAgent.ASSUME_OPERA = !1;
            goog.userAgent.ASSUME_ANY_VERSION = !1;
            goog.userAgent.BROWSER_KNOWN_ = goog.userAgent.ASSUME_IE || goog.userAgent.ASSUME_EDGE || goog.userAgent.ASSUME_GECKO || goog.userAgent.ASSUME_MOBILE_WEBKIT || goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_OPERA;
            goog.userAgent.getUserAgentString = function() {
              return goog.labs.userAgent.util.getUserAgent();
            };
            goog.userAgent.getNavigator = function() {
              return goog.global.navigator || null;
            };
            goog.userAgent.OPERA = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_OPERA : goog.labs.userAgent.browser.isOpera();
            goog.userAgent.IE = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_IE : goog.labs.userAgent.browser.isIE();
            goog.userAgent.EDGE = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_EDGE : goog.labs.userAgent.engine.isEdge();
            goog.userAgent.EDGE_OR_IE = goog.userAgent.EDGE || goog.userAgent.IE;
            goog.userAgent.GECKO = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_GECKO : goog.labs.userAgent.engine.isGecko();
            goog.userAgent.WEBKIT = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_MOBILE_WEBKIT : goog.labs.userAgent.engine.isWebKit();
            goog.userAgent.isMobile_ = function() {
              return goog.userAgent.WEBKIT && goog.labs.userAgent.util.matchUserAgent("Mobile");
            };
            goog.userAgent.MOBILE = goog.userAgent.ASSUME_MOBILE_WEBKIT || goog.userAgent.isMobile_();
            goog.userAgent.SAFARI = goog.userAgent.WEBKIT;
            goog.userAgent.determinePlatform_ = function() {
              var a = goog.userAgent.getNavigator();
              return a && a.platform || "";
            };
            goog.userAgent.PLATFORM = goog.userAgent.determinePlatform_();
            goog.userAgent.ASSUME_MAC = !1;
            goog.userAgent.ASSUME_WINDOWS = !1;
            goog.userAgent.ASSUME_LINUX = !1;
            goog.userAgent.ASSUME_X11 = !1;
            goog.userAgent.ASSUME_ANDROID = !1;
            goog.userAgent.ASSUME_IPHONE = !1;
            goog.userAgent.ASSUME_IPAD = !1;
            goog.userAgent.PLATFORM_KNOWN_ = goog.userAgent.ASSUME_MAC || goog.userAgent.ASSUME_WINDOWS || goog.userAgent.ASSUME_LINUX || goog.userAgent.ASSUME_X11 || goog.userAgent.ASSUME_ANDROID || goog.userAgent.ASSUME_IPHONE || goog.userAgent.ASSUME_IPAD;
            goog.userAgent.MAC = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_MAC : goog.labs.userAgent.platform.isMacintosh();
            goog.userAgent.WINDOWS = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_WINDOWS : goog.labs.userAgent.platform.isWindows();
            goog.userAgent.isLegacyLinux_ = function() {
              return goog.labs.userAgent.platform.isLinux() || goog.labs.userAgent.platform.isChromeOS();
            };
            goog.userAgent.LINUX = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_LINUX : goog.userAgent.isLegacyLinux_();
            goog.userAgent.isX11_ = function() {
              var a = goog.userAgent.getNavigator();
              return !!a && goog.string.contains(a.appVersion || "", "X11");
            };
            goog.userAgent.X11 = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_X11 : goog.userAgent.isX11_();
            goog.userAgent.ANDROID = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_ANDROID : goog.labs.userAgent.platform.isAndroid();
            goog.userAgent.IPHONE = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_IPHONE : goog.labs.userAgent.platform.isIphone();
            goog.userAgent.IPAD = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_IPAD : goog.labs.userAgent.platform.isIpad();
            goog.userAgent.operaVersion_ = function() {
              var a = goog.global.opera.version;
              try {
                return a();
              } catch (b) {
                return a;
              }
            };
            goog.userAgent.determineVersion_ = function() {
              if (goog.userAgent.OPERA && goog.global.opera) return goog.userAgent.operaVersion_();
              var a = "", b = goog.userAgent.getVersionRegexResult_();
              b && (a = b ? b[1] : "");
              return goog.userAgent.IE && (b = goog.userAgent.getDocumentMode_(), b > parseFloat(a)) ? String(b) : a;
            };
            goog.userAgent.getVersionRegexResult_ = function() {
              var a = goog.userAgent.getUserAgentString();
              if (goog.userAgent.GECKO) return /rv\:([^\);]+)(\)|;)/.exec(a);
              if (goog.userAgent.EDGE) return /Edge\/([\d\.]+)/.exec(a);
              if (goog.userAgent.IE) return /\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a);
              if (goog.userAgent.WEBKIT) return /WebKit\/(\S+)/.exec(a);
            };
            goog.userAgent.getDocumentMode_ = function() {
              var a = goog.global.document;
              return a ? a.documentMode : void 0;
            };
            goog.userAgent.VERSION = goog.userAgent.determineVersion_();
            goog.userAgent.compare = function(a, b) {
              return goog.string.compareVersions(a, b);
            };
            goog.userAgent.isVersionOrHigherCache_ = {};
            goog.userAgent.isVersionOrHigher = function(a) {
              return goog.userAgent.ASSUME_ANY_VERSION || goog.userAgent.isVersionOrHigherCache_[a] || (goog.userAgent.isVersionOrHigherCache_[a] = 0 <= goog.string.compareVersions(goog.userAgent.VERSION, a));
            };
            goog.userAgent.isVersion = goog.userAgent.isVersionOrHigher;
            goog.userAgent.isDocumentModeOrHigher = function(a) {
              return Number(goog.userAgent.DOCUMENT_MODE) >= a;
            };
            goog.userAgent.isDocumentMode = goog.userAgent.isDocumentModeOrHigher;
            goog.userAgent.DOCUMENT_MODE = function() {
              var a = goog.global.document, b = goog.userAgent.getDocumentMode_();
              return a && goog.userAgent.IE ? b || ("CSS1Compat" == a.compatMode ? parseInt(goog.userAgent.VERSION, 10) : 5) : void 0;
            }();
            goog.userAgent.product = {};
            goog.userAgent.product.ASSUME_FIREFOX = !1;
            goog.userAgent.product.ASSUME_IPHONE = !1;
            goog.userAgent.product.ASSUME_IPAD = !1;
            goog.userAgent.product.ASSUME_ANDROID = !1;
            goog.userAgent.product.ASSUME_CHROME = !1;
            goog.userAgent.product.ASSUME_SAFARI = !1;
            goog.userAgent.product.PRODUCT_KNOWN_ = goog.userAgent.ASSUME_IE || goog.userAgent.ASSUME_EDGE || goog.userAgent.ASSUME_OPERA || goog.userAgent.product.ASSUME_FIREFOX || goog.userAgent.product.ASSUME_IPHONE || goog.userAgent.product.ASSUME_IPAD || goog.userAgent.product.ASSUME_ANDROID || goog.userAgent.product.ASSUME_CHROME || goog.userAgent.product.ASSUME_SAFARI;
            goog.userAgent.product.OPERA = goog.userAgent.OPERA;
            goog.userAgent.product.IE = goog.userAgent.IE;
            goog.userAgent.product.EDGE = goog.userAgent.EDGE;
            goog.userAgent.product.FIREFOX = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_FIREFOX : goog.labs.userAgent.browser.isFirefox();
            goog.userAgent.product.isIphoneOrIpod_ = function() {
              return goog.labs.userAgent.platform.isIphone() || goog.labs.userAgent.platform.isIpod();
            };
            goog.userAgent.product.IPHONE = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_IPHONE : goog.userAgent.product.isIphoneOrIpod_();
            goog.userAgent.product.IPAD = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_IPAD : goog.labs.userAgent.platform.isIpad();
            goog.userAgent.product.ANDROID = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_ANDROID : goog.labs.userAgent.browser.isAndroidBrowser();
            goog.userAgent.product.CHROME = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_CHROME : goog.labs.userAgent.browser.isChrome();
            goog.userAgent.product.isSafariDesktop_ = function() {
              return goog.labs.userAgent.browser.isSafari() && !goog.labs.userAgent.platform.isIos();
            };
            goog.userAgent.product.SAFARI = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_SAFARI : goog.userAgent.product.isSafariDesktop_();
            goog.crypt.base64 = {};
            goog.crypt.base64.byteToCharMap_ = null;
            goog.crypt.base64.charToByteMap_ = null;
            goog.crypt.base64.byteToCharMapWebSafe_ = null;
            goog.crypt.base64.ENCODED_VALS_BASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            goog.crypt.base64.ENCODED_VALS = goog.crypt.base64.ENCODED_VALS_BASE + "+/=";
            goog.crypt.base64.ENCODED_VALS_WEBSAFE = goog.crypt.base64.ENCODED_VALS_BASE + "-_.";
            goog.crypt.base64.ASSUME_NATIVE_SUPPORT_ = goog.userAgent.GECKO || goog.userAgent.WEBKIT && !goog.userAgent.product.SAFARI || goog.userAgent.OPERA;
            goog.crypt.base64.HAS_NATIVE_ENCODE_ = goog.crypt.base64.ASSUME_NATIVE_SUPPORT_ || "function" == typeof goog.global.btoa;
            goog.crypt.base64.HAS_NATIVE_DECODE_ = goog.crypt.base64.ASSUME_NATIVE_SUPPORT_ || !goog.userAgent.product.SAFARI && !goog.userAgent.IE && "function" == typeof goog.global.atob;
            goog.crypt.base64.encodeByteArray = function(a, b) {
              goog.asserts.assert(goog.isArrayLike(a), "encodeByteArray takes an array as a parameter");
              goog.crypt.base64.init_();
              for (var c = b ? goog.crypt.base64.byteToCharMapWebSafe_ : goog.crypt.base64.byteToCharMap_, d = [], e = 0; e < a.length; e += 3) {
                var f = a[e], g = e + 1 < a.length, h = g ? a[e + 1] : 0, k = e + 2 < a.length, l = k ? a[e + 2] : 0, p = f >> 2, f = (3 & f) << 4 | h >> 4, h = (15 & h) << 2 | l >> 6, l = 63 & l;
                k || (l = 64, g || (h = 64));
                d.push(c[p], c[f], c[h], c[l]);
              }
              return d.join("");
            };
            goog.crypt.base64.encodeString = function(a, b) {
              return goog.crypt.base64.HAS_NATIVE_ENCODE_ && !b ? goog.global.btoa(a) : goog.crypt.base64.encodeByteArray(goog.crypt.stringToByteArray(a), b);
            };
            goog.crypt.base64.decodeString = function(a, b) {
              if (goog.crypt.base64.HAS_NATIVE_DECODE_ && !b) return goog.global.atob(a);
              var c = "";
              goog.crypt.base64.decodeStringInternal_(a, function(a) {
                c += String.fromCharCode(a);
              });
              return c;
            };
            goog.crypt.base64.decodeStringToByteArray = function(a, b) {
              var c = [];
              goog.crypt.base64.decodeStringInternal_(a, function(a) {
                c.push(a);
              });
              return c;
            };
            goog.crypt.base64.decodeStringToUint8Array = function(a) {
              goog.asserts.assert(!goog.userAgent.IE || goog.userAgent.isVersionOrHigher("10"), "Browser does not support typed arrays");
              var b = new Uint8Array(Math.ceil(3 * a.length / 4)), c = 0;
              goog.crypt.base64.decodeStringInternal_(a, function(a) {
                b[c++] = a;
              });
              return b.subarray(0, c);
            };
            goog.crypt.base64.decodeStringInternal_ = function(a, b) {
              function c(b) {
                for (;d < a.length; ) {
                  var c = a.charAt(d++), e = goog.crypt.base64.charToByteMap_[c];
                  if (null != e) return e;
                  if (!goog.string.isEmptyOrWhitespace(c)) throw Error("Unknown base64 encoding at char: " + c);
                }
                return b;
              }
              goog.crypt.base64.init_();
              for (var d = 0; ;) {
                var e = c(-1), f = c(0), g = c(64), h = c(64);
                if (64 === h && -1 === e) break;
                b(e << 2 | f >> 4);
                64 != g && (b(f << 4 & 240 | g >> 2), 64 != h && b(g << 6 & 192 | h));
              }
            };
            goog.crypt.base64.init_ = function() {
              if (!goog.crypt.base64.byteToCharMap_) {
                goog.crypt.base64.byteToCharMap_ = {};
                goog.crypt.base64.charToByteMap_ = {};
                goog.crypt.base64.byteToCharMapWebSafe_ = {};
                for (var a = 0; a < goog.crypt.base64.ENCODED_VALS.length; a++) goog.crypt.base64.byteToCharMap_[a] = goog.crypt.base64.ENCODED_VALS.charAt(a), 
                goog.crypt.base64.charToByteMap_[goog.crypt.base64.byteToCharMap_[a]] = a, goog.crypt.base64.byteToCharMapWebSafe_[a] = goog.crypt.base64.ENCODED_VALS_WEBSAFE.charAt(a), 
                a >= goog.crypt.base64.ENCODED_VALS_BASE.length && (goog.crypt.base64.charToByteMap_[goog.crypt.base64.ENCODED_VALS_WEBSAFE.charAt(a)] = a);
              }
            };
            jspb.ExtensionFieldInfo = function(a, b, c, d, e) {
              this.fieldIndex = a;
              this.fieldName = b;
              this.ctor = c;
              this.toObjectFn = d;
              this.isRepeated = e;
            };
            jspb.ExtensionFieldBinaryInfo = function(a, b, c, d, e, f) {
              this.fieldInfo = a;
              this.binaryReaderFn = b;
              this.binaryWriterFn = c;
              this.binaryMessageSerializeFn = d;
              this.binaryMessageDeserializeFn = e;
              this.isPacked = f;
            };
            jspb.ExtensionFieldInfo.prototype.isMessageType = function() {
              return !!this.ctor;
            };
            jspb.Message = function() {};
            jspb.Message.GENERATE_TO_OBJECT = !0;
            jspb.Message.GENERATE_FROM_OBJECT = !goog.DISALLOW_TEST_ONLY_CODE;
            jspb.Message.GENERATE_TO_STRING = !0;
            jspb.Message.ASSUME_LOCAL_ARRAYS = !1;
            jspb.Message.MINIMIZE_MEMORY_ALLOCATIONS = COMPILED;
            jspb.Message.SUPPORTS_UINT8ARRAY_ = "function" == typeof Uint8Array;
            jspb.Message.prototype.getJsPbMessageId = function() {
              return this.messageId_;
            };
            jspb.Message.getIndex_ = function(a, b) {
              return b + a.arrayIndexOffset_;
            };
            jspb.Message.initialize = function(a, b, c, d, e, f) {
              a.wrappers_ = jspb.Message.MINIMIZE_MEMORY_ALLOCATIONS ? null : {};
              b || (b = c ? [ c ] : []);
              a.messageId_ = c ? String(c) : void 0;
              a.arrayIndexOffset_ = 0 === c ? -1 : 0;
              a.array = b;
              jspb.Message.initPivotAndExtensionObject_(a, d);
              a.convertedFloatingPointFields_ = {};
              if (e) for (b = 0; b < e.length; b++) c = e[b], c < a.pivot_ ? (c = jspb.Message.getIndex_(a, c), 
              a.array[c] = a.array[c] || (jspb.Message.MINIMIZE_MEMORY_ALLOCATIONS ? jspb.Message.EMPTY_LIST_SENTINEL_ : [])) : (jspb.Message.maybeInitEmptyExtensionObject_(a), 
              a.extensionObject_[c] = a.extensionObject_[c] || (jspb.Message.MINIMIZE_MEMORY_ALLOCATIONS ? jspb.Message.EMPTY_LIST_SENTINEL_ : []));
              f && f.length && goog.array.forEach(f, goog.partial(jspb.Message.computeOneofCase, a));
            };
            jspb.Message.EMPTY_LIST_SENTINEL_ = goog.DEBUG && Object.freeze ? Object.freeze([]) : [];
            jspb.Message.isArray_ = function(a) {
              return jspb.Message.ASSUME_LOCAL_ARRAYS ? a instanceof Array : goog.isArray(a);
            };
            jspb.Message.initPivotAndExtensionObject_ = function(a, b) {
              if (a.array.length) {
                var c = a.array.length - 1, d = a.array[c];
                if (d && "object" == ("undefined" === typeof d ? "undefined" : _typeof(d)) && !jspb.Message.isArray_(d) && !(jspb.Message.SUPPORTS_UINT8ARRAY_ && d instanceof Uint8Array)) {
                  a.pivot_ = c - a.arrayIndexOffset_;
                  a.extensionObject_ = d;
                  return;
                }
              }
              -1 < b ? (a.pivot_ = b, a.extensionObject_ = null) : a.pivot_ = Number.MAX_VALUE;
            };
            jspb.Message.maybeInitEmptyExtensionObject_ = function(a) {
              var b = jspb.Message.getIndex_(a, a.pivot_);
              a.array[b] || (a.extensionObject_ = a.array[b] = {});
            };
            jspb.Message.toObjectList = function(a, b, c) {
              for (var d = [], e = 0; e < a.length; e++) d[e] = b.call(a[e], c, a[e]);
              return d;
            };
            jspb.Message.toObjectExtension = function(a, b, c, d, e) {
              for (var f in c) {
                var g = c[f], h = d.call(a, g);
                if (null != h) {
                  for (var k in g.fieldName) if (g.fieldName.hasOwnProperty(k)) break;
                  b[k] = g.toObjectFn ? g.isRepeated ? jspb.Message.toObjectList(h, g.toObjectFn, e) : g.toObjectFn(e, h) : h;
                }
              }
            };
            jspb.Message.serializeBinaryExtensions = function(a, b, c, d) {
              for (var e in c) {
                var f = c[e], g = f.fieldInfo;
                if (!f.binaryWriterFn) throw Error("Message extension present that was generated without binary serialization support");
                var h = d.call(a, g);
                if (null != h) if (g.isMessageType()) {
                  if (!f.binaryMessageSerializeFn) throw Error("Message extension present holding submessage without binary support enabled, and message is being serialized to binary format");
                  f.binaryWriterFn.call(b, g.fieldIndex, h, f.binaryMessageSerializeFn);
                } else f.binaryWriterFn.call(b, g.fieldIndex, h);
              }
            };
            jspb.Message.readBinaryExtension = function(a, b, c, d, e) {
              var f = c[b.getFieldNumber()];
              if (f) {
                c = f.fieldInfo;
                if (!f.binaryReaderFn) throw Error("Deserializing extension whose generated code does not support binary format");
                var g;
                c.isMessageType() ? (g = new c.ctor(), f.binaryReaderFn.call(b, g, f.binaryMessageDeserializeFn)) : g = f.binaryReaderFn.call(b);
                c.isRepeated && !f.isPacked ? (b = d.call(a, c)) ? b.push(g) : e.call(a, c, [ g ]) : e.call(a, c, g);
              } else b.skipField();
            };
            jspb.Message.getField = function(a, b) {
              if (b < a.pivot_) {
                var c = jspb.Message.getIndex_(a, b), d = a.array[c];
                return d === jspb.Message.EMPTY_LIST_SENTINEL_ ? a.array[c] = [] : d;
              }
              if (a.extensionObject_) return d = a.extensionObject_[b], d === jspb.Message.EMPTY_LIST_SENTINEL_ ? a.extensionObject_[b] = [] : d;
            };
            jspb.Message.getRepeatedField = function(a, b) {
              if (b < a.pivot_) {
                var c = jspb.Message.getIndex_(a, b), d = a.array[c];
                return d === jspb.Message.EMPTY_LIST_SENTINEL_ ? a.array[c] = [] : d;
              }
              d = a.extensionObject_[b];
              return d === jspb.Message.EMPTY_LIST_SENTINEL_ ? a.extensionObject_[b] = [] : d;
            };
            jspb.Message.getOptionalFloatingPointField = function(a, b) {
              var c = jspb.Message.getField(a, b);
              return null == c ? c : +c;
            };
            jspb.Message.getRepeatedFloatingPointField = function(a, b) {
              var c = jspb.Message.getRepeatedField(a, b);
              a.convertedFloatingPointFields_ || (a.convertedFloatingPointFields_ = {});
              if (!a.convertedFloatingPointFields_[b]) {
                for (var d = 0; d < c.length; d++) c[d] = +c[d];
                a.convertedFloatingPointFields_[b] = !0;
              }
              return c;
            };
            jspb.Message.bytesAsB64 = function(a) {
              if (null == a || goog.isString(a)) return a;
              if (jspb.Message.SUPPORTS_UINT8ARRAY_ && a instanceof Uint8Array) return goog.crypt.base64.encodeByteArray(a);
              goog.asserts.fail("Cannot coerce to b64 string: " + goog.typeOf(a));
              return null;
            };
            jspb.Message.bytesAsU8 = function(a) {
              if (null == a || a instanceof Uint8Array) return a;
              if (goog.isString(a)) return goog.crypt.base64.decodeStringToUint8Array(a);
              goog.asserts.fail("Cannot coerce to Uint8Array: " + goog.typeOf(a));
              return null;
            };
            jspb.Message.bytesListAsB64 = function(a) {
              jspb.Message.assertConsistentTypes_(a);
              return !a.length || goog.isString(a[0]) ? a : goog.array.map(a, jspb.Message.bytesAsB64);
            };
            jspb.Message.bytesListAsU8 = function(a) {
              jspb.Message.assertConsistentTypes_(a);
              return !a.length || a[0] instanceof Uint8Array ? a : goog.array.map(a, jspb.Message.bytesAsU8);
            };
            jspb.Message.assertConsistentTypes_ = function(a) {
              if (goog.DEBUG && a && 1 < a.length) {
                var b = goog.typeOf(a[0]);
                goog.array.forEach(a, function(a) {
                  goog.typeOf(a) != b && goog.asserts.fail("Inconsistent type in JSPB repeated field array. Got " + goog.typeOf(a) + " expected " + b);
                });
              }
            };
            jspb.Message.getFieldWithDefault = function(a, b, c) {
              a = jspb.Message.getField(a, b);
              return null == a ? c : a;
            };
            jspb.Message.getFieldProto3 = jspb.Message.getFieldWithDefault;
            jspb.Message.getMapField = function(a, b, c, d) {
              a.wrappers_ || (a.wrappers_ = {});
              if (b in a.wrappers_) return a.wrappers_[b];
              if (!c) return c = jspb.Message.getField(a, b), c || (c = [], jspb.Message.setField(a, b, c)), 
              a.wrappers_[b] = new jspb.Map(c, d);
            };
            jspb.Message.setField = function(a, b, c) {
              b < a.pivot_ ? a.array[jspb.Message.getIndex_(a, b)] = c : (jspb.Message.maybeInitEmptyExtensionObject_(a), 
              a.extensionObject_[b] = c);
            };
            jspb.Message.setProto3IntField = function(a, b, c) {
              jspb.Message.setFieldIgnoringDefault_(a, b, c, 0);
            };
            jspb.Message.setProto3FloatField = function(a, b, c) {
              jspb.Message.setFieldIgnoringDefault_(a, b, c, 0);
            };
            jspb.Message.setProto3BooleanField = function(a, b, c) {
              jspb.Message.setFieldIgnoringDefault_(a, b, c, !1);
            };
            jspb.Message.setProto3StringField = function(a, b, c) {
              jspb.Message.setFieldIgnoringDefault_(a, b, c, "");
            };
            jspb.Message.setProto3StringIntField = function(a, b, c) {
              jspb.Message.setFieldIgnoringDefault_(a, b, c, "");
            };
            jspb.Message.setProto3BytesField = function(a, b, c) {
              jspb.Message.setFieldIgnoringDefault_(a, b, c, "");
            };
            jspb.Message.setProto3EnumField = function(a, b, c) {
              jspb.Message.setFieldIgnoringDefault_(a, b, c, 0);
            };
            jspb.Message.setFieldIgnoringDefault_ = function(a, b, c, d) {
              c != d ? jspb.Message.setField(a, b, c) : a.array[jspb.Message.getIndex_(a, b)] = null;
            };
            jspb.Message.addToRepeatedField = function(a, b, c, d) {
              a = jspb.Message.getRepeatedField(a, b);
              void 0 != d ? a.splice(d, 0, c) : a.push(c);
            };
            jspb.Message.setOneofField = function(a, b, c, d) {
              (c = jspb.Message.computeOneofCase(a, c)) && c !== b && void 0 !== d && (a.wrappers_ && c in a.wrappers_ && (a.wrappers_[c] = void 0), 
              jspb.Message.setField(a, c, void 0));
              jspb.Message.setField(a, b, d);
            };
            jspb.Message.computeOneofCase = function(a, b) {
              var c, d;
              goog.array.forEach(b, function(b) {
                var f = jspb.Message.getField(a, b);
                goog.isDefAndNotNull(f) && (c = b, d = f, jspb.Message.setField(a, b, void 0));
              });
              return c ? (jspb.Message.setField(a, c, d), c) : 0;
            };
            jspb.Message.getWrapperField = function(a, b, c, d) {
              a.wrappers_ || (a.wrappers_ = {});
              if (!a.wrappers_[c]) {
                var e = jspb.Message.getField(a, c);
                (d || e) && (a.wrappers_[c] = new b(e));
              }
              return a.wrappers_[c];
            };
            jspb.Message.getRepeatedWrapperField = function(a, b, c) {
              jspb.Message.wrapRepeatedField_(a, b, c);
              b = a.wrappers_[c];
              b == jspb.Message.EMPTY_LIST_SENTINEL_ && (b = a.wrappers_[c] = []);
              return b;
            };
            jspb.Message.wrapRepeatedField_ = function(a, b, c) {
              a.wrappers_ || (a.wrappers_ = {});
              if (!a.wrappers_[c]) {
                for (var d = jspb.Message.getRepeatedField(a, c), e = [], f = 0; f < d.length; f++) e[f] = new b(d[f]);
                a.wrappers_[c] = e;
              }
            };
            jspb.Message.setWrapperField = function(a, b, c) {
              a.wrappers_ || (a.wrappers_ = {});
              var d = c ? c.toArray() : c;
              a.wrappers_[b] = c;
              jspb.Message.setField(a, b, d);
            };
            jspb.Message.setOneofWrapperField = function(a, b, c, d) {
              a.wrappers_ || (a.wrappers_ = {});
              var e = d ? d.toArray() : d;
              a.wrappers_[b] = d;
              jspb.Message.setOneofField(a, b, c, e);
            };
            jspb.Message.setRepeatedWrapperField = function(a, b, c) {
              a.wrappers_ || (a.wrappers_ = {});
              c = c || [];
              for (var d = [], e = 0; e < c.length; e++) d[e] = c[e].toArray();
              a.wrappers_[b] = c;
              jspb.Message.setField(a, b, d);
            };
            jspb.Message.addToRepeatedWrapperField = function(a, b, c, d, e) {
              jspb.Message.wrapRepeatedField_(a, d, b);
              var f = a.wrappers_[b];
              f || (f = a.wrappers_[b] = []);
              c = c || new d();
              a = jspb.Message.getRepeatedField(a, b);
              void 0 != e ? (f.splice(e, 0, c), a.splice(e, 0, c.toArray())) : (f.push(c), a.push(c.toArray()));
              return c;
            };
            jspb.Message.toMap = function(a, b, c, d) {
              for (var e = {}, f = 0; f < a.length; f++) e[b.call(a[f])] = c ? c.call(a[f], d, a[f]) : a[f];
              return e;
            };
            jspb.Message.prototype.syncMapFields_ = function() {
              if (this.wrappers_) for (var a in this.wrappers_) {
                var b = this.wrappers_[a];
                if (goog.isArray(b)) for (var c = 0; c < b.length; c++) b[c] && b[c].toArray(); else b && b.toArray();
              }
            };
            jspb.Message.prototype.toArray = function() {
              this.syncMapFields_();
              return this.array;
            };
            jspb.Message.GENERATE_TO_STRING && (jspb.Message.prototype.toString = function() {
              this.syncMapFields_();
              return this.array.toString();
            });
            jspb.Message.prototype.getExtension = function(a) {
              if (this.extensionObject_) {
                this.wrappers_ || (this.wrappers_ = {});
                var b = a.fieldIndex;
                if (a.isRepeated) {
                  if (a.isMessageType()) return this.wrappers_[b] || (this.wrappers_[b] = goog.array.map(this.extensionObject_[b] || [], function(b) {
                    return new a.ctor(b);
                  })), this.wrappers_[b];
                } else if (a.isMessageType()) return !this.wrappers_[b] && this.extensionObject_[b] && (this.wrappers_[b] = new a.ctor(this.extensionObject_[b])), 
                this.wrappers_[b];
                return this.extensionObject_[b];
              }
            };
            jspb.Message.prototype.setExtension = function(a, b) {
              this.wrappers_ || (this.wrappers_ = {});
              jspb.Message.maybeInitEmptyExtensionObject_(this);
              var c = a.fieldIndex;
              a.isRepeated ? (b = b || [], a.isMessageType() ? (this.wrappers_[c] = b, this.extensionObject_[c] = goog.array.map(b, function(a) {
                return a.toArray();
              })) : this.extensionObject_[c] = b) : a.isMessageType() ? (this.wrappers_[c] = b, 
              this.extensionObject_[c] = b ? b.toArray() : b) : this.extensionObject_[c] = b;
              return this;
            };
            jspb.Message.difference = function(a, b) {
              if (!(a instanceof b.constructor)) throw Error("Messages have different types.");
              var c = a.toArray(), d = b.toArray(), e = [], f = 0, g = c.length > d.length ? c.length : d.length;
              a.getJsPbMessageId() && (e[0] = a.getJsPbMessageId(), f = 1);
              for (;f < g; f++) jspb.Message.compareFields(c[f], d[f]) || (e[f] = d[f]);
              return new a.constructor(e);
            };
            jspb.Message.equals = function(a, b) {
              return a == b || !(!a || !b) && a instanceof b.constructor && jspb.Message.compareFields(a.toArray(), b.toArray());
            };
            jspb.Message.compareExtensions = function(a, b) {
              a = a || {};
              b = b || {};
              var c = {}, d;
              for (d in a) c[d] = 0;
              for (d in b) c[d] = 0;
              for (d in c) if (!jspb.Message.compareFields(a[d], b[d])) return !1;
              return !0;
            };
            jspb.Message.compareFields = function(a, b) {
              if (a == b) return !0;
              if (!goog.isObject(a) || !goog.isObject(b) || a.constructor != b.constructor) return !1;
              if (jspb.Message.SUPPORTS_UINT8ARRAY_ && a.constructor === Uint8Array) {
                if (a.length != b.length) return !1;
                for (var c = 0; c < a.length; c++) if (a[c] != b[c]) return !1;
                return !0;
              }
              if (a.constructor === Array) {
                for (var d = void 0, e = void 0, f = Math.max(a.length, b.length), c = 0; c < f; c++) {
                  var g = a[c], h = b[c];
                  g && g.constructor == Object && (goog.asserts.assert(void 0 === d), goog.asserts.assert(c === a.length - 1), 
                  d = g, g = void 0);
                  h && h.constructor == Object && (goog.asserts.assert(void 0 === e), goog.asserts.assert(c === b.length - 1), 
                  e = h, h = void 0);
                  if (!jspb.Message.compareFields(g, h)) return !1;
                }
                return !d && !e || (d = d || {}, e = e || {}, jspb.Message.compareExtensions(d, e));
              }
              if (a.constructor === Object) return jspb.Message.compareExtensions(a, b);
              throw Error("Invalid type in JSPB array");
            };
            jspb.Message.prototype.cloneMessage = function() {
              return jspb.Message.cloneMessage(this);
            };
            jspb.Message.prototype.clone = function() {
              return jspb.Message.cloneMessage(this);
            };
            jspb.Message.clone = function(a) {
              return jspb.Message.cloneMessage(a);
            };
            jspb.Message.cloneMessage = function(a) {
              return new a.constructor(jspb.Message.clone_(a.toArray()));
            };
            jspb.Message.copyInto = function(a, b) {
              goog.asserts.assertInstanceof(a, jspb.Message);
              goog.asserts.assertInstanceof(b, jspb.Message);
              goog.asserts.assert(a.constructor == b.constructor, "Copy source and target message should have the same type.");
              for (var c = jspb.Message.clone(a), d = b.toArray(), e = c.toArray(), f = d.length = 0; f < e.length; f++) d[f] = e[f];
              b.wrappers_ = c.wrappers_;
              b.extensionObject_ = c.extensionObject_;
            };
            jspb.Message.clone_ = function(a) {
              var b;
              if (goog.isArray(a)) {
                for (var c = Array(a.length), d = 0; d < a.length; d++) null != (b = a[d]) && (c[d] = "object" == ("undefined" === typeof b ? "undefined" : _typeof(b)) ? jspb.Message.clone_(b) : b);
                return c;
              }
              if (jspb.Message.SUPPORTS_UINT8ARRAY_ && a instanceof Uint8Array) return new Uint8Array(a);
              c = {};
              for (d in a) null != (b = a[d]) && (c[d] = "object" == ("undefined" === typeof b ? "undefined" : _typeof(b)) ? jspb.Message.clone_(b) : b);
              return c;
            };
            jspb.Message.registerMessageType = function(a, b) {
              jspb.Message.registry_[a] = b;
              b.messageId = a;
            };
            jspb.Message.registry_ = {};
            jspb.Message.messageSetExtensions = {};
            jspb.Message.messageSetExtensionsBinary = {};
            jspb.arith = {};
            jspb.arith.UInt64 = function(a, b) {
              this.lo = a;
              this.hi = b;
            };
            jspb.arith.UInt64.prototype.cmp = function(a) {
              return this.hi < a.hi || this.hi == a.hi && this.lo < a.lo ? -1 : this.hi == a.hi && this.lo == a.lo ? 0 : 1;
            };
            jspb.arith.UInt64.prototype.rightShift = function() {
              return new jspb.arith.UInt64((this.lo >>> 1 | (1 & this.hi) << 31) >>> 0, this.hi >>> 1 >>> 0);
            };
            jspb.arith.UInt64.prototype.leftShift = function() {
              return new jspb.arith.UInt64(this.lo << 1 >>> 0, (this.hi << 1 | this.lo >>> 31) >>> 0);
            };
            jspb.arith.UInt64.prototype.msb = function() {
              return !!(2147483648 & this.hi);
            };
            jspb.arith.UInt64.prototype.lsb = function() {
              return !!(1 & this.lo);
            };
            jspb.arith.UInt64.prototype.zero = function() {
              return 0 == this.lo && 0 == this.hi;
            };
            jspb.arith.UInt64.prototype.add = function(a) {
              return new jspb.arith.UInt64((this.lo + a.lo & 4294967295) >>> 0 >>> 0, ((this.hi + a.hi & 4294967295) >>> 0) + (4294967296 <= this.lo + a.lo ? 1 : 0) >>> 0);
            };
            jspb.arith.UInt64.prototype.sub = function(a) {
              return new jspb.arith.UInt64((this.lo - a.lo & 4294967295) >>> 0 >>> 0, ((this.hi - a.hi & 4294967295) >>> 0) - (0 > this.lo - a.lo ? 1 : 0) >>> 0);
            };
            jspb.arith.UInt64.mul32x32 = function(a, b) {
              for (var c = 65535 & a, d = a >>> 16, e = 65535 & b, f = b >>> 16, g = c * e + 65536 * (c * f & 65535) + 65536 * (d * e & 65535), c = d * f + (c * f >>> 16) + (d * e >>> 16); 4294967296 <= g; ) g -= 4294967296, 
              c += 1;
              return new jspb.arith.UInt64(g >>> 0, c >>> 0);
            };
            jspb.arith.UInt64.prototype.mul = function(a) {
              var b = jspb.arith.UInt64.mul32x32(this.lo, a);
              a = jspb.arith.UInt64.mul32x32(this.hi, a);
              a.hi = a.lo;
              a.lo = 0;
              return b.add(a);
            };
            jspb.arith.UInt64.prototype.div = function(a) {
              if (0 == a) return [];
              var b = new jspb.arith.UInt64(0, 0), c = new jspb.arith.UInt64(this.lo, this.hi);
              a = new jspb.arith.UInt64(a, 0);
              for (var d = new jspb.arith.UInt64(1, 0); !a.msb(); ) a = a.leftShift(), d = d.leftShift();
              for (;!d.zero(); ) 0 >= a.cmp(c) && (b = b.add(d), c = c.sub(a)), a = a.rightShift(), 
              d = d.rightShift();
              return [ b, c ];
            };
            jspb.arith.UInt64.prototype.toString = function() {
              for (var a = "", b = this; !b.zero(); ) var b = b.div(10), c = b[0], a = b[1].lo + a, b = c;
              "" == a && (a = "0");
              return a;
            };
            jspb.arith.UInt64.fromString = function(a) {
              for (var b = new jspb.arith.UInt64(0, 0), c = new jspb.arith.UInt64(0, 0), d = 0; d < a.length; d++) {
                if ("0" > a[d] || "9" < a[d]) return null;
                var e = parseInt(a[d], 10);
                c.lo = e;
                b = b.mul(10).add(c);
              }
              return b;
            };
            jspb.arith.UInt64.prototype.clone = function() {
              return new jspb.arith.UInt64(this.lo, this.hi);
            };
            jspb.arith.Int64 = function(a, b) {
              this.lo = a;
              this.hi = b;
            };
            jspb.arith.Int64.prototype.add = function(a) {
              return new jspb.arith.Int64((this.lo + a.lo & 4294967295) >>> 0 >>> 0, ((this.hi + a.hi & 4294967295) >>> 0) + (4294967296 <= this.lo + a.lo ? 1 : 0) >>> 0);
            };
            jspb.arith.Int64.prototype.sub = function(a) {
              return new jspb.arith.Int64((this.lo - a.lo & 4294967295) >>> 0 >>> 0, ((this.hi - a.hi & 4294967295) >>> 0) - (0 > this.lo - a.lo ? 1 : 0) >>> 0);
            };
            jspb.arith.Int64.prototype.clone = function() {
              return new jspb.arith.Int64(this.lo, this.hi);
            };
            jspb.arith.Int64.prototype.toString = function() {
              var a = 0 != (2147483648 & this.hi), b = new jspb.arith.UInt64(this.lo, this.hi);
              a && (b = new jspb.arith.UInt64(0, 0).sub(b));
              return (a ? "-" : "") + b.toString();
            };
            jspb.arith.Int64.fromString = function(a) {
              var b = 0 < a.length && "-" == a[0];
              b && (a = a.substring(1));
              a = jspb.arith.UInt64.fromString(a);
              if (null === a) return null;
              b && (a = new jspb.arith.UInt64(0, 0).sub(a));
              return new jspb.arith.Int64(a.lo, a.hi);
            };
            jspb.BinaryConstants = {};
            jspb.ConstBinaryMessage = function() {};
            jspb.BinaryMessage = function() {};
            jspb.BinaryConstants.FieldType = {
              INVALID: -1,
              DOUBLE: 1,
              FLOAT: 2,
              INT64: 3,
              UINT64: 4,
              INT32: 5,
              FIXED64: 6,
              FIXED32: 7,
              BOOL: 8,
              STRING: 9,
              GROUP: 10,
              MESSAGE: 11,
              BYTES: 12,
              UINT32: 13,
              ENUM: 14,
              SFIXED32: 15,
              SFIXED64: 16,
              SINT32: 17,
              SINT64: 18,
              FHASH64: 30,
              VHASH64: 31
            };
            jspb.BinaryConstants.WireType = {
              INVALID: -1,
              VARINT: 0,
              FIXED64: 1,
              DELIMITED: 2,
              START_GROUP: 3,
              END_GROUP: 4,
              FIXED32: 5
            };
            jspb.BinaryConstants.FieldTypeToWireType = function(a) {
              var b = jspb.BinaryConstants.FieldType, c = jspb.BinaryConstants.WireType;
              switch (a) {
               case b.INT32:
               case b.INT64:
               case b.UINT32:
               case b.UINT64:
               case b.SINT32:
               case b.SINT64:
               case b.BOOL:
               case b.ENUM:
               case b.VHASH64:
                return c.VARINT;

               case b.DOUBLE:
               case b.FIXED64:
               case b.SFIXED64:
               case b.FHASH64:
                return c.FIXED64;

               case b.STRING:
               case b.MESSAGE:
               case b.BYTES:
                return c.DELIMITED;

               case b.FLOAT:
               case b.FIXED32:
               case b.SFIXED32:
                return c.FIXED32;

               default:
                return c.INVALID;
              }
            };
            jspb.BinaryConstants.INVALID_FIELD_NUMBER = -1;
            jspb.BinaryConstants.FLOAT32_EPS = 1.401298464324817e-45;
            jspb.BinaryConstants.FLOAT32_MIN = 1.1754943508222875e-38;
            jspb.BinaryConstants.FLOAT32_MAX = 3.4028234663852886e38;
            jspb.BinaryConstants.FLOAT64_EPS = 5e-324;
            jspb.BinaryConstants.FLOAT64_MIN = 2.2250738585072014e-308;
            jspb.BinaryConstants.FLOAT64_MAX = 1.7976931348623157e308;
            jspb.BinaryConstants.TWO_TO_20 = 1048576;
            jspb.BinaryConstants.TWO_TO_23 = 8388608;
            jspb.BinaryConstants.TWO_TO_31 = 2147483648;
            jspb.BinaryConstants.TWO_TO_32 = 4294967296;
            jspb.BinaryConstants.TWO_TO_52 = 4503599627370496;
            jspb.BinaryConstants.TWO_TO_63 = 0x8000000000000000;
            jspb.BinaryConstants.TWO_TO_64 = 0x10000000000000000;
            jspb.BinaryConstants.ZERO_HASH = "\0\0\0\0\0\0\0\0";
            jspb.utils = {};
            jspb.utils.split64Low = 0;
            jspb.utils.split64High = 0;
            jspb.utils.splitUint64 = function(a) {
              var b = a >>> 0;
              a = Math.floor((a - b) / jspb.BinaryConstants.TWO_TO_32) >>> 0;
              jspb.utils.split64Low = b;
              jspb.utils.split64High = a;
            };
            jspb.utils.splitInt64 = function(a) {
              var b = 0 > a;
              a = Math.abs(a);
              var c = a >>> 0;
              a = Math.floor((a - c) / jspb.BinaryConstants.TWO_TO_32);
              a >>>= 0;
              b && (a = ~a >>> 0, c = 1 + (~c >>> 0), 4294967295 < c && (c = 0, a++, 4294967295 < a && (a = 0)));
              jspb.utils.split64Low = c;
              jspb.utils.split64High = a;
            };
            jspb.utils.splitZigzag64 = function(a) {
              var b = 0 > a;
              a = 2 * Math.abs(a);
              jspb.utils.splitUint64(a);
              a = jspb.utils.split64Low;
              var c = jspb.utils.split64High;
              b && (0 == a ? 0 == c ? c = a = 4294967295 : (c--, a = 4294967295) : a--);
              jspb.utils.split64Low = a;
              jspb.utils.split64High = c;
            };
            jspb.utils.splitFloat32 = function(a) {
              var b = 0 > a ? 1 : 0;
              a = b ? -a : a;
              var c;
              0 === a ? 0 < 1 / a ? (jspb.utils.split64High = 0, jspb.utils.split64Low = 0) : (jspb.utils.split64High = 0, 
              jspb.utils.split64Low = 2147483648) : isNaN(a) ? (jspb.utils.split64High = 0, jspb.utils.split64Low = 2147483647) : a > jspb.BinaryConstants.FLOAT32_MAX ? (jspb.utils.split64High = 0, 
              jspb.utils.split64Low = (b << 31 | 2139095040) >>> 0) : a < jspb.BinaryConstants.FLOAT32_MIN ? (a = Math.round(a / Math.pow(2, -149)), 
              jspb.utils.split64High = 0, jspb.utils.split64Low = (b << 31 | a) >>> 0) : (c = Math.floor(Math.log(a) / Math.LN2), 
              a *= Math.pow(2, -c), a = 8388607 & Math.round(a * jspb.BinaryConstants.TWO_TO_23), 
              jspb.utils.split64High = 0, jspb.utils.split64Low = (b << 31 | c + 127 << 23 | a) >>> 0);
            };
            jspb.utils.splitFloat64 = function(a) {
              var b = 0 > a ? 1 : 0;
              a = b ? -a : a;
              if (0 === a) jspb.utils.split64High = 0 < 1 / a ? 0 : 2147483648, jspb.utils.split64Low = 0; else if (isNaN(a)) jspb.utils.split64High = 2147483647, 
              jspb.utils.split64Low = 4294967295; else if (a > jspb.BinaryConstants.FLOAT64_MAX) jspb.utils.split64High = (b << 31 | 2146435072) >>> 0, 
              jspb.utils.split64Low = 0; else if (a < jspb.BinaryConstants.FLOAT64_MIN) {
                var c = a / Math.pow(2, -1074);
                a = c / jspb.BinaryConstants.TWO_TO_32;
                jspb.utils.split64High = (b << 31 | a) >>> 0;
                jspb.utils.split64Low = c >>> 0;
              } else {
                var d = Math.floor(Math.log(a) / Math.LN2);
                1024 == d && (d = 1023);
                c = a * Math.pow(2, -d);
                a = c * jspb.BinaryConstants.TWO_TO_20 & 1048575;
                c = c * jspb.BinaryConstants.TWO_TO_52 >>> 0;
                jspb.utils.split64High = (b << 31 | d + 1023 << 20 | a) >>> 0;
                jspb.utils.split64Low = c;
              }
            };
            jspb.utils.splitHash64 = function(a) {
              var b = a.charCodeAt(0), c = a.charCodeAt(1), d = a.charCodeAt(2), e = a.charCodeAt(3), f = a.charCodeAt(4), g = a.charCodeAt(5), h = a.charCodeAt(6);
              a = a.charCodeAt(7);
              jspb.utils.split64Low = b + (c << 8) + (d << 16) + (e << 24) >>> 0;
              jspb.utils.split64High = f + (g << 8) + (h << 16) + (a << 24) >>> 0;
            };
            jspb.utils.joinUint64 = function(a, b) {
              return b * jspb.BinaryConstants.TWO_TO_32 + a;
            };
            jspb.utils.joinInt64 = function(a, b) {
              var c = 2147483648 & b;
              c && (a = 1 + ~a >>> 0, b = ~b >>> 0, 0 == a && (b = b + 1 >>> 0));
              var d = jspb.utils.joinUint64(a, b);
              return c ? -d : d;
            };
            jspb.utils.joinZigzag64 = function(a, b) {
              var c = 1 & a;
              a = (a >>> 1 | b << 31) >>> 0;
              b >>>= 1;
              c && (a = a + 1 >>> 0, 0 == a && (b = b + 1 >>> 0));
              var d = jspb.utils.joinUint64(a, b);
              return c ? -d : d;
            };
            jspb.utils.joinFloat32 = function(a, b) {
              var c = 2 * (a >> 31) + 1, d = a >>> 23 & 255, e = 8388607 & a;
              return 255 == d ? e ? NaN : Infinity * c : 0 == d ? c * Math.pow(2, -149) * e : c * Math.pow(2, d - 150) * (e + Math.pow(2, 23));
            };
            jspb.utils.joinFloat64 = function(a, b) {
              var c = 2 * (b >> 31) + 1, d = b >>> 20 & 2047, e = jspb.BinaryConstants.TWO_TO_32 * (1048575 & b) + a;
              return 2047 == d ? e ? NaN : Infinity * c : 0 == d ? c * Math.pow(2, -1074) * e : c * Math.pow(2, d - 1075) * (e + jspb.BinaryConstants.TWO_TO_52);
            };
            jspb.utils.joinHash64 = function(a, b) {
              return String.fromCharCode(a >>> 0 & 255, a >>> 8 & 255, a >>> 16 & 255, a >>> 24 & 255, b >>> 0 & 255, b >>> 8 & 255, b >>> 16 & 255, b >>> 24 & 255);
            };
            jspb.utils.DIGITS = "0123456789abcdef".split("");
            jspb.utils.joinUnsignedDecimalString = function(a, b) {
              function c(a) {
                for (var b = 1e7, c = 0; 7 > c; c++) {
                  var b = b / 10, d = a / b % 10 >>> 0;
                  (0 != d || h) && (h = !0, k += g[d]);
                }
              }
              if (2097151 >= b) return "" + (jspb.BinaryConstants.TWO_TO_32 * b + a);
              var d = (a >>> 24 | b << 8) >>> 0 & 16777215, e = b >> 16 & 65535, f = (16777215 & a) + 6777216 * d + 6710656 * e, d = d + 8147497 * e, e = 2 * e;
              1e7 <= f && (d += Math.floor(f / 1e7), f %= 1e7);
              1e7 <= d && (e += Math.floor(d / 1e7), d %= 1e7);
              var g = jspb.utils.DIGITS, h = !1, k = "";
              (e || h) && c(e);
              (d || h) && c(d);
              (f || h) && c(f);
              return k;
            };
            jspb.utils.joinSignedDecimalString = function(a, b) {
              var c = 2147483648 & b;
              c && (a = 1 + ~a >>> 0, b = ~b + (0 == a ? 1 : 0) >>> 0);
              var d = jspb.utils.joinUnsignedDecimalString(a, b);
              return c ? "-" + d : d;
            };
            jspb.utils.hash64ToDecimalString = function(a, b) {
              jspb.utils.splitHash64(a);
              var c = jspb.utils.split64Low, d = jspb.utils.split64High;
              return b ? jspb.utils.joinSignedDecimalString(c, d) : jspb.utils.joinUnsignedDecimalString(c, d);
            };
            jspb.utils.hash64ArrayToDecimalStrings = function(a, b) {
              for (var c = Array(a.length), d = 0; d < a.length; d++) c[d] = jspb.utils.hash64ToDecimalString(a[d], b);
              return c;
            };
            jspb.utils.decimalStringToHash64 = function(a) {
              function b(a, b) {
                for (var c = 0; 8 > c && (1 !== a || 0 < b); c++) {
                  var d = a * e[c] + b;
                  e[c] = 255 & d;
                  b = d >>> 8;
                }
              }
              function c() {
                for (var a = 0; 8 > a; a++) e[a] = 255 & ~e[a];
              }
              goog.asserts.assert(0 < a.length);
              var d = !1;
              "-" === a[0] && (d = !0, a = a.slice(1));
              for (var e = [ 0, 0, 0, 0, 0, 0, 0, 0 ], f = 0; f < a.length; f++) b(10, jspb.utils.DIGITS.indexOf(a[f]));
              d && (c(), b(1, 1));
              return goog.crypt.byteArrayToString(e);
            };
            jspb.utils.splitDecimalString = function(a) {
              jspb.utils.splitHash64(jspb.utils.decimalStringToHash64(a));
            };
            jspb.utils.hash64ToHexString = function(a) {
              var b = Array(18);
              b[0] = "0";
              b[1] = "x";
              for (var c = 0; 8 > c; c++) {
                var d = a.charCodeAt(7 - c);
                b[2 * c + 2] = jspb.utils.DIGITS[d >> 4];
                b[2 * c + 3] = jspb.utils.DIGITS[15 & d];
              }
              return b.join("");
            };
            jspb.utils.hexStringToHash64 = function(a) {
              a = a.toLowerCase();
              goog.asserts.assert(18 == a.length);
              goog.asserts.assert("0" == a[0]);
              goog.asserts.assert("x" == a[1]);
              for (var b = "", c = 0; 8 > c; c++) var d = jspb.utils.DIGITS.indexOf(a[2 * c + 2]), e = jspb.utils.DIGITS.indexOf(a[2 * c + 3]), b = String.fromCharCode(16 * d + e) + b;
              return b;
            };
            jspb.utils.hash64ToNumber = function(a, b) {
              jspb.utils.splitHash64(a);
              var c = jspb.utils.split64Low, d = jspb.utils.split64High;
              return b ? jspb.utils.joinInt64(c, d) : jspb.utils.joinUint64(c, d);
            };
            jspb.utils.numberToHash64 = function(a) {
              jspb.utils.splitInt64(a);
              return jspb.utils.joinHash64(jspb.utils.split64Low, jspb.utils.split64High);
            };
            jspb.utils.countVarints = function(a, b, c) {
              for (var d = 0, e = b; e < c; e++) d += a[e] >> 7;
              return c - b - d;
            };
            jspb.utils.countVarintFields = function(a, b, c, d) {
              var e = 0;
              d = 8 * d + jspb.BinaryConstants.WireType.VARINT;
              if (128 > d) for (;b < c && a[b++] == d; ) for (e++; ;) {
                var f = a[b++];
                if (0 == (128 & f)) break;
              } else for (;b < c; ) {
                for (f = d; 128 < f; ) {
                  if (a[b] != (127 & f | 128)) return e;
                  b++;
                  f >>= 7;
                }
                if (a[b++] != f) break;
                for (e++; f = a[b++], 0 != (128 & f); ) ;
              }
              return e;
            };
            jspb.utils.countFixedFields_ = function(a, b, c, d, e) {
              var f = 0;
              if (128 > d) for (;b < c && a[b++] == d; ) f++, b += e; else for (;b < c; ) {
                for (var g = d; 128 < g; ) {
                  if (a[b++] != (127 & g | 128)) return f;
                  g >>= 7;
                }
                if (a[b++] != g) break;
                f++;
                b += e;
              }
              return f;
            };
            jspb.utils.countFixed32Fields = function(a, b, c, d) {
              return jspb.utils.countFixedFields_(a, b, c, 8 * d + jspb.BinaryConstants.WireType.FIXED32, 4);
            };
            jspb.utils.countFixed64Fields = function(a, b, c, d) {
              return jspb.utils.countFixedFields_(a, b, c, 8 * d + jspb.BinaryConstants.WireType.FIXED64, 8);
            };
            jspb.utils.countDelimitedFields = function(a, b, c, d) {
              var e = 0;
              for (d = 8 * d + jspb.BinaryConstants.WireType.DELIMITED; b < c; ) {
                for (var f = d; 128 < f; ) {
                  if (a[b++] != (127 & f | 128)) return e;
                  f >>= 7;
                }
                if (a[b++] != f) break;
                e++;
                for (var g = 0, h = 1; f = a[b++], g += (127 & f) * h, h *= 128, 0 != (128 & f); ) ;
                b += g;
              }
              return e;
            };
            jspb.utils.debugBytesToTextFormat = function(a) {
              var b = '"';
              if (a) {
                a = jspb.utils.byteSourceToUint8Array(a);
                for (var c = 0; c < a.length; c++) b += "\\x", 16 > a[c] && (b += "0"), b += a[c].toString(16);
              }
              return b + '"';
            };
            jspb.utils.debugScalarToTextFormat = function(a) {
              return goog.isString(a) ? goog.string.quote(a) : a.toString();
            };
            jspb.utils.stringToByteArray = function(a) {
              for (var b = new Uint8Array(a.length), c = 0; c < a.length; c++) {
                var d = a.charCodeAt(c);
                if (255 < d) throw Error("Conversion error: string contains codepoint outside of byte range");
                b[c] = d;
              }
              return b;
            };
            jspb.utils.byteSourceToUint8Array = function(a) {
              if (a.constructor === Uint8Array) return a;
              if (a.constructor === ArrayBuffer || a.constructor === Array) return new Uint8Array(a);
              if (a.constructor === String) return goog.crypt.base64.decodeStringToUint8Array(a);
              goog.asserts.fail("Type not convertible to Uint8Array.");
              return new Uint8Array(0);
            };
            jspb.BinaryEncoder = function() {
              this.buffer_ = [];
            };
            jspb.BinaryEncoder.prototype.length = function() {
              return this.buffer_.length;
            };
            jspb.BinaryEncoder.prototype.end = function() {
              var a = this.buffer_;
              this.buffer_ = [];
              return a;
            };
            jspb.BinaryEncoder.prototype.writeSplitVarint64 = function(a, b) {
              goog.asserts.assert(a == Math.floor(a));
              goog.asserts.assert(b == Math.floor(b));
              goog.asserts.assert(0 <= a && a < jspb.BinaryConstants.TWO_TO_32);
              for (goog.asserts.assert(0 <= b && b < jspb.BinaryConstants.TWO_TO_32); 0 < b || 127 < a; ) this.buffer_.push(127 & a | 128), 
              a = (a >>> 7 | b << 25) >>> 0, b >>>= 7;
              this.buffer_.push(a);
            };
            jspb.BinaryEncoder.prototype.writeSplitFixed64 = function(a, b) {
              goog.asserts.assert(a == Math.floor(a));
              goog.asserts.assert(b == Math.floor(b));
              goog.asserts.assert(0 <= a && a < jspb.BinaryConstants.TWO_TO_32);
              goog.asserts.assert(0 <= b && b < jspb.BinaryConstants.TWO_TO_32);
              this.writeUint32(a);
              this.writeUint32(b);
            };
            jspb.BinaryEncoder.prototype.writeUnsignedVarint32 = function(a) {
              goog.asserts.assert(a == Math.floor(a));
              for (goog.asserts.assert(0 <= a && a < jspb.BinaryConstants.TWO_TO_32); 127 < a; ) this.buffer_.push(127 & a | 128), 
              a >>>= 7;
              this.buffer_.push(a);
            };
            jspb.BinaryEncoder.prototype.writeSignedVarint32 = function(a) {
              goog.asserts.assert(a == Math.floor(a));
              goog.asserts.assert(a >= -jspb.BinaryConstants.TWO_TO_31 && a < jspb.BinaryConstants.TWO_TO_31);
              if (0 <= a) this.writeUnsignedVarint32(a); else {
                for (var b = 0; 9 > b; b++) this.buffer_.push(127 & a | 128), a >>= 7;
                this.buffer_.push(1);
              }
            };
            jspb.BinaryEncoder.prototype.writeUnsignedVarint64 = function(a) {
              goog.asserts.assert(a == Math.floor(a));
              goog.asserts.assert(0 <= a && a < jspb.BinaryConstants.TWO_TO_64);
              jspb.utils.splitInt64(a);
              this.writeSplitVarint64(jspb.utils.split64Low, jspb.utils.split64High);
            };
            jspb.BinaryEncoder.prototype.writeSignedVarint64 = function(a) {
              goog.asserts.assert(a == Math.floor(a));
              goog.asserts.assert(a >= -jspb.BinaryConstants.TWO_TO_63 && a < jspb.BinaryConstants.TWO_TO_63);
              jspb.utils.splitInt64(a);
              this.writeSplitVarint64(jspb.utils.split64Low, jspb.utils.split64High);
            };
            jspb.BinaryEncoder.prototype.writeZigzagVarint32 = function(a) {
              goog.asserts.assert(a == Math.floor(a));
              goog.asserts.assert(a >= -jspb.BinaryConstants.TWO_TO_31 && a < jspb.BinaryConstants.TWO_TO_31);
              this.writeUnsignedVarint32((a << 1 ^ a >> 31) >>> 0);
            };
            jspb.BinaryEncoder.prototype.writeZigzagVarint64 = function(a) {
              goog.asserts.assert(a == Math.floor(a));
              goog.asserts.assert(a >= -jspb.BinaryConstants.TWO_TO_63 && a < jspb.BinaryConstants.TWO_TO_63);
              jspb.utils.splitZigzag64(a);
              this.writeSplitVarint64(jspb.utils.split64Low, jspb.utils.split64High);
            };
            jspb.BinaryEncoder.prototype.writeZigzagVarint64String = function(a) {
              this.writeZigzagVarint64(parseInt(a, 10));
            };
            jspb.BinaryEncoder.prototype.writeUint8 = function(a) {
              goog.asserts.assert(a == Math.floor(a));
              goog.asserts.assert(0 <= a && 256 > a);
              this.buffer_.push(a >>> 0 & 255);
            };
            jspb.BinaryEncoder.prototype.writeUint16 = function(a) {
              goog.asserts.assert(a == Math.floor(a));
              goog.asserts.assert(0 <= a && 65536 > a);
              this.buffer_.push(a >>> 0 & 255);
              this.buffer_.push(a >>> 8 & 255);
            };
            jspb.BinaryEncoder.prototype.writeUint32 = function(a) {
              goog.asserts.assert(a == Math.floor(a));
              goog.asserts.assert(0 <= a && a < jspb.BinaryConstants.TWO_TO_32);
              this.buffer_.push(a >>> 0 & 255);
              this.buffer_.push(a >>> 8 & 255);
              this.buffer_.push(a >>> 16 & 255);
              this.buffer_.push(a >>> 24 & 255);
            };
            jspb.BinaryEncoder.prototype.writeUint64 = function(a) {
              goog.asserts.assert(a == Math.floor(a));
              goog.asserts.assert(0 <= a && a < jspb.BinaryConstants.TWO_TO_64);
              jspb.utils.splitUint64(a);
              this.writeUint32(jspb.utils.split64Low);
              this.writeUint32(jspb.utils.split64High);
            };
            jspb.BinaryEncoder.prototype.writeInt8 = function(a) {
              goog.asserts.assert(a == Math.floor(a));
              goog.asserts.assert(-128 <= a && 128 > a);
              this.buffer_.push(a >>> 0 & 255);
            };
            jspb.BinaryEncoder.prototype.writeInt16 = function(a) {
              goog.asserts.assert(a == Math.floor(a));
              goog.asserts.assert(-32768 <= a && 32768 > a);
              this.buffer_.push(a >>> 0 & 255);
              this.buffer_.push(a >>> 8 & 255);
            };
            jspb.BinaryEncoder.prototype.writeInt32 = function(a) {
              goog.asserts.assert(a == Math.floor(a));
              goog.asserts.assert(a >= -jspb.BinaryConstants.TWO_TO_31 && a < jspb.BinaryConstants.TWO_TO_31);
              this.buffer_.push(a >>> 0 & 255);
              this.buffer_.push(a >>> 8 & 255);
              this.buffer_.push(a >>> 16 & 255);
              this.buffer_.push(a >>> 24 & 255);
            };
            jspb.BinaryEncoder.prototype.writeInt64 = function(a) {
              goog.asserts.assert(a == Math.floor(a));
              goog.asserts.assert(a >= -jspb.BinaryConstants.TWO_TO_63 && a < jspb.BinaryConstants.TWO_TO_63);
              jspb.utils.splitInt64(a);
              this.writeSplitFixed64(jspb.utils.split64Low, jspb.utils.split64High);
            };
            jspb.BinaryEncoder.prototype.writeInt64String = function(a) {
              goog.asserts.assert(a == Math.floor(a));
              goog.asserts.assert(+a >= -jspb.BinaryConstants.TWO_TO_63 && +a < jspb.BinaryConstants.TWO_TO_63);
              jspb.utils.splitHash64(jspb.utils.decimalStringToHash64(a));
              this.writeSplitFixed64(jspb.utils.split64Low, jspb.utils.split64High);
            };
            jspb.BinaryEncoder.prototype.writeFloat = function(a) {
              goog.asserts.assert(a >= -jspb.BinaryConstants.FLOAT32_MAX && a <= jspb.BinaryConstants.FLOAT32_MAX);
              jspb.utils.splitFloat32(a);
              this.writeUint32(jspb.utils.split64Low);
            };
            jspb.BinaryEncoder.prototype.writeDouble = function(a) {
              goog.asserts.assert(a >= -jspb.BinaryConstants.FLOAT64_MAX && a <= jspb.BinaryConstants.FLOAT64_MAX);
              jspb.utils.splitFloat64(a);
              this.writeUint32(jspb.utils.split64Low);
              this.writeUint32(jspb.utils.split64High);
            };
            jspb.BinaryEncoder.prototype.writeBool = function(a) {
              goog.asserts.assert(goog.isBoolean(a) || goog.isNumber(a));
              this.buffer_.push(a ? 1 : 0);
            };
            jspb.BinaryEncoder.prototype.writeEnum = function(a) {
              goog.asserts.assert(a == Math.floor(a));
              goog.asserts.assert(a >= -jspb.BinaryConstants.TWO_TO_31 && a < jspb.BinaryConstants.TWO_TO_31);
              this.writeSignedVarint32(a);
            };
            jspb.BinaryEncoder.prototype.writeBytes = function(a) {
              this.buffer_.push.apply(this.buffer_, a);
            };
            jspb.BinaryEncoder.prototype.writeVarintHash64 = function(a) {
              jspb.utils.splitHash64(a);
              this.writeSplitVarint64(jspb.utils.split64Low, jspb.utils.split64High);
            };
            jspb.BinaryEncoder.prototype.writeFixedHash64 = function(a) {
              jspb.utils.splitHash64(a);
              this.writeUint32(jspb.utils.split64Low);
              this.writeUint32(jspb.utils.split64High);
            };
            jspb.BinaryEncoder.prototype.writeString = function(a) {
              for (var b = this.buffer_.length, c = 0; c < a.length; c++) {
                var d = a.charCodeAt(c);
                if (128 > d) this.buffer_.push(d); else if (2048 > d) this.buffer_.push(d >> 6 | 192), 
                this.buffer_.push(63 & d | 128); else if (65536 > d) if (55296 <= d && 56319 >= d && c + 1 < a.length) {
                  var e = a.charCodeAt(c + 1);
                  56320 <= e && 57343 >= e && (d = 1024 * (d - 55296) + e - 56320 + 65536, this.buffer_.push(d >> 18 | 240), 
                  this.buffer_.push(d >> 12 & 63 | 128), this.buffer_.push(d >> 6 & 63 | 128), this.buffer_.push(63 & d | 128), 
                  c++);
                } else this.buffer_.push(d >> 12 | 224), this.buffer_.push(d >> 6 & 63 | 128), this.buffer_.push(63 & d | 128);
              }
              return this.buffer_.length - b;
            };
            jspb.BinaryWriter = function() {
              this.blocks_ = [];
              this.totalLength_ = 0;
              this.encoder_ = new jspb.BinaryEncoder();
              this.bookmarks_ = [];
            };
            jspb.BinaryWriter.prototype.appendUint8Array_ = function(a) {
              var b = this.encoder_.end();
              this.blocks_.push(b);
              this.blocks_.push(a);
              this.totalLength_ += b.length + a.length;
            };
            jspb.BinaryWriter.prototype.beginDelimited_ = function(a) {
              this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.DELIMITED);
              a = this.encoder_.end();
              this.blocks_.push(a);
              this.totalLength_ += a.length;
              a.push(this.totalLength_);
              return a;
            };
            jspb.BinaryWriter.prototype.endDelimited_ = function(a) {
              var b = a.pop(), b = this.totalLength_ + this.encoder_.length() - b;
              for (goog.asserts.assert(0 <= b); 127 < b; ) a.push(127 & b | 128), b >>>= 7, this.totalLength_++;
              a.push(b);
              this.totalLength_++;
            };
            jspb.BinaryWriter.prototype.writeSerializedMessage = function(a, b, c) {
              this.appendUint8Array_(a.subarray(b, c));
            };
            jspb.BinaryWriter.prototype.maybeWriteSerializedMessage = function(a, b, c) {
              null != a && null != b && null != c && this.writeSerializedMessage(a, b, c);
            };
            jspb.BinaryWriter.prototype.reset = function() {
              this.blocks_ = [];
              this.encoder_.end();
              this.totalLength_ = 0;
              this.bookmarks_ = [];
            };
            jspb.BinaryWriter.prototype.getResultBuffer = function() {
              goog.asserts.assert(0 == this.bookmarks_.length);
              for (var a = new Uint8Array(this.totalLength_ + this.encoder_.length()), b = this.blocks_, c = b.length, d = 0, e = 0; e < c; e++) {
                var f = b[e];
                a.set(f, d);
                d += f.length;
              }
              b = this.encoder_.end();
              a.set(b, d);
              d += b.length;
              goog.asserts.assert(d == a.length);
              this.blocks_ = [ a ];
              return a;
            };
            jspb.BinaryWriter.prototype.getResultBase64String = function() {
              return goog.crypt.base64.encodeByteArray(this.getResultBuffer());
            };
            jspb.BinaryWriter.prototype.beginSubMessage = function(a) {
              this.bookmarks_.push(this.beginDelimited_(a));
            };
            jspb.BinaryWriter.prototype.endSubMessage = function() {
              goog.asserts.assert(0 <= this.bookmarks_.length);
              this.endDelimited_(this.bookmarks_.pop());
            };
            jspb.BinaryWriter.prototype.writeFieldHeader_ = function(a, b) {
              goog.asserts.assert(1 <= a && a == Math.floor(a));
              this.encoder_.writeUnsignedVarint32(8 * a + b);
            };
            jspb.BinaryWriter.prototype.writeAny = function(a, b, c) {
              var d = jspb.BinaryConstants.FieldType;
              switch (a) {
               case d.DOUBLE:
                this.writeDouble(b, c);
                break;

               case d.FLOAT:
                this.writeFloat(b, c);
                break;

               case d.INT64:
                this.writeInt64(b, c);
                break;

               case d.UINT64:
                this.writeUint64(b, c);
                break;

               case d.INT32:
                this.writeInt32(b, c);
                break;

               case d.FIXED64:
                this.writeFixed64(b, c);
                break;

               case d.FIXED32:
                this.writeFixed32(b, c);
                break;

               case d.BOOL:
                this.writeBool(b, c);
                break;

               case d.STRING:
                this.writeString(b, c);
                break;

               case d.GROUP:
                goog.asserts.fail("Group field type not supported in writeAny()");
                break;

               case d.MESSAGE:
                goog.asserts.fail("Message field type not supported in writeAny()");
                break;

               case d.BYTES:
                this.writeBytes(b, c);
                break;

               case d.UINT32:
                this.writeUint32(b, c);
                break;

               case d.ENUM:
                this.writeEnum(b, c);
                break;

               case d.SFIXED32:
                this.writeSfixed32(b, c);
                break;

               case d.SFIXED64:
                this.writeSfixed64(b, c);
                break;

               case d.SINT32:
                this.writeSint32(b, c);
                break;

               case d.SINT64:
                this.writeSint64(b, c);
                break;

               case d.FHASH64:
                this.writeFixedHash64(b, c);
                break;

               case d.VHASH64:
                this.writeVarintHash64(b, c);
                break;

               default:
                goog.asserts.fail("Invalid field type in writeAny()");
              }
            };
            jspb.BinaryWriter.prototype.writeUnsignedVarint32_ = function(a, b) {
              null != b && (this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.VARINT), this.encoder_.writeUnsignedVarint32(b));
            };
            jspb.BinaryWriter.prototype.writeSignedVarint32_ = function(a, b) {
              null != b && (this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.VARINT), this.encoder_.writeSignedVarint32(b));
            };
            jspb.BinaryWriter.prototype.writeUnsignedVarint64_ = function(a, b) {
              null != b && (this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.VARINT), this.encoder_.writeUnsignedVarint64(b));
            };
            jspb.BinaryWriter.prototype.writeSignedVarint64_ = function(a, b) {
              null != b && (this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.VARINT), this.encoder_.writeSignedVarint64(b));
            };
            jspb.BinaryWriter.prototype.writeZigzagVarint32_ = function(a, b) {
              null != b && (this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.VARINT), this.encoder_.writeZigzagVarint32(b));
            };
            jspb.BinaryWriter.prototype.writeZigzagVarint64_ = function(a, b) {
              null != b && (this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.VARINT), this.encoder_.writeZigzagVarint64(b));
            };
            jspb.BinaryWriter.prototype.writeZigzagVarint64String_ = function(a, b) {
              null != b && (this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.VARINT), this.encoder_.writeZigzagVarint64String(b));
            };
            jspb.BinaryWriter.prototype.writeInt32 = function(a, b) {
              null != b && (goog.asserts.assert(b >= -jspb.BinaryConstants.TWO_TO_31 && b < jspb.BinaryConstants.TWO_TO_31), 
              this.writeSignedVarint32_(a, b));
            };
            jspb.BinaryWriter.prototype.writeInt32String = function(a, b) {
              if (null != b) {
                var c = parseInt(b, 10);
                goog.asserts.assert(c >= -jspb.BinaryConstants.TWO_TO_31 && c < jspb.BinaryConstants.TWO_TO_31);
                this.writeSignedVarint32_(a, c);
              }
            };
            jspb.BinaryWriter.prototype.writeInt64 = function(a, b) {
              null != b && (goog.asserts.assert(b >= -jspb.BinaryConstants.TWO_TO_63 && b < jspb.BinaryConstants.TWO_TO_63), 
              this.writeSignedVarint64_(a, b));
            };
            jspb.BinaryWriter.prototype.writeInt64String = function(a, b) {
              if (null != b) {
                var c = jspb.arith.Int64.fromString(b);
                this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.VARINT);
                this.encoder_.writeSplitVarint64(c.lo, c.hi);
              }
            };
            jspb.BinaryWriter.prototype.writeUint32 = function(a, b) {
              null != b && (goog.asserts.assert(0 <= b && b < jspb.BinaryConstants.TWO_TO_32), 
              this.writeUnsignedVarint32_(a, b));
            };
            jspb.BinaryWriter.prototype.writeUint32String = function(a, b) {
              if (null != b) {
                var c = parseInt(b, 10);
                goog.asserts.assert(0 <= c && c < jspb.BinaryConstants.TWO_TO_32);
                this.writeUnsignedVarint32_(a, c);
              }
            };
            jspb.BinaryWriter.prototype.writeUint64 = function(a, b) {
              null != b && (goog.asserts.assert(0 <= b && b < jspb.BinaryConstants.TWO_TO_64), 
              this.writeUnsignedVarint64_(a, b));
            };
            jspb.BinaryWriter.prototype.writeUint64String = function(a, b) {
              if (null != b) {
                var c = jspb.arith.UInt64.fromString(b);
                this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.VARINT);
                this.encoder_.writeSplitVarint64(c.lo, c.hi);
              }
            };
            jspb.BinaryWriter.prototype.writeSint32 = function(a, b) {
              null != b && (goog.asserts.assert(b >= -jspb.BinaryConstants.TWO_TO_31 && b < jspb.BinaryConstants.TWO_TO_31), 
              this.writeZigzagVarint32_(a, b));
            };
            jspb.BinaryWriter.prototype.writeSint64 = function(a, b) {
              null != b && (goog.asserts.assert(b >= -jspb.BinaryConstants.TWO_TO_63 && b < jspb.BinaryConstants.TWO_TO_63), 
              this.writeZigzagVarint64_(a, b));
            };
            jspb.BinaryWriter.prototype.writeSint64String = function(a, b) {
              null != b && (goog.asserts.assert(+b >= -jspb.BinaryConstants.TWO_TO_63 && +b < jspb.BinaryConstants.TWO_TO_63), 
              this.writeZigzagVarint64String_(a, b));
            };
            jspb.BinaryWriter.prototype.writeFixed32 = function(a, b) {
              null != b && (goog.asserts.assert(0 <= b && b < jspb.BinaryConstants.TWO_TO_32), 
              this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.FIXED32), this.encoder_.writeUint32(b));
            };
            jspb.BinaryWriter.prototype.writeFixed64 = function(a, b) {
              null != b && (goog.asserts.assert(0 <= b && b < jspb.BinaryConstants.TWO_TO_64), 
              this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.FIXED64), this.encoder_.writeUint64(b));
            };
            jspb.BinaryWriter.prototype.writeFixed64String = function(a, b) {
              if (null != b) {
                var c = jspb.arith.UInt64.fromString(b);
                this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.FIXED64);
                this.encoder_.writeSplitFixed64(c.lo, c.hi);
              }
            };
            jspb.BinaryWriter.prototype.writeSfixed32 = function(a, b) {
              null != b && (goog.asserts.assert(b >= -jspb.BinaryConstants.TWO_TO_31 && b < jspb.BinaryConstants.TWO_TO_31), 
              this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.FIXED32), this.encoder_.writeInt32(b));
            };
            jspb.BinaryWriter.prototype.writeSfixed64 = function(a, b) {
              null != b && (goog.asserts.assert(b >= -jspb.BinaryConstants.TWO_TO_63 && b < jspb.BinaryConstants.TWO_TO_63), 
              this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.FIXED64), this.encoder_.writeInt64(b));
            };
            jspb.BinaryWriter.prototype.writeSfixed64String = function(a, b) {
              if (null != b) {
                var c = jspb.arith.Int64.fromString(b);
                this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.FIXED64);
                this.encoder_.writeSplitFixed64(c.lo, c.hi);
              }
            };
            jspb.BinaryWriter.prototype.writeFloat = function(a, b) {
              null != b && (this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.FIXED32), 
              this.encoder_.writeFloat(b));
            };
            jspb.BinaryWriter.prototype.writeDouble = function(a, b) {
              null != b && (this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.FIXED64), 
              this.encoder_.writeDouble(b));
            };
            jspb.BinaryWriter.prototype.writeBool = function(a, b) {
              null != b && (goog.asserts.assert(goog.isBoolean(b) || goog.isNumber(b)), this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.VARINT), 
              this.encoder_.writeBool(b));
            };
            jspb.BinaryWriter.prototype.writeEnum = function(a, b) {
              null != b && (goog.asserts.assert(b >= -jspb.BinaryConstants.TWO_TO_31 && b < jspb.BinaryConstants.TWO_TO_31), 
              this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.VARINT), this.encoder_.writeSignedVarint32(b));
            };
            jspb.BinaryWriter.prototype.writeString = function(a, b) {
              if (null != b) {
                var c = this.beginDelimited_(a);
                this.encoder_.writeString(b);
                this.endDelimited_(c);
              }
            };
            jspb.BinaryWriter.prototype.writeBytes = function(a, b) {
              if (null != b) {
                var c = jspb.utils.byteSourceToUint8Array(b);
                this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.DELIMITED);
                this.encoder_.writeUnsignedVarint32(c.length);
                this.appendUint8Array_(c);
              }
            };
            jspb.BinaryWriter.prototype.writeMessage = function(a, b, c) {
              null != b && (a = this.beginDelimited_(a), c(b, this), this.endDelimited_(a));
            };
            jspb.BinaryWriter.prototype.writeGroup = function(a, b, c) {
              null != b && (this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.START_GROUP), 
              c(b, this), this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.END_GROUP));
            };
            jspb.BinaryWriter.prototype.writeFixedHash64 = function(a, b) {
              null != b && (goog.asserts.assert(8 == b.length), this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.FIXED64), 
              this.encoder_.writeFixedHash64(b));
            };
            jspb.BinaryWriter.prototype.writeVarintHash64 = function(a, b) {
              null != b && (goog.asserts.assert(8 == b.length), this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.VARINT), 
              this.encoder_.writeVarintHash64(b));
            };
            jspb.BinaryWriter.prototype.writeRepeatedInt32 = function(a, b) {
              if (null != b) for (var c = 0; c < b.length; c++) this.writeSignedVarint32_(a, b[c]);
            };
            jspb.BinaryWriter.prototype.writeRepeatedInt32String = function(a, b) {
              if (null != b) for (var c = 0; c < b.length; c++) this.writeInt32String(a, b[c]);
            };
            jspb.BinaryWriter.prototype.writeRepeatedInt64 = function(a, b) {
              if (null != b) for (var c = 0; c < b.length; c++) this.writeSignedVarint64_(a, b[c]);
            };
            jspb.BinaryWriter.prototype.writeRepeatedInt64String = function(a, b) {
              if (null != b) for (var c = 0; c < b.length; c++) this.writeInt64String(a, b[c]);
            };
            jspb.BinaryWriter.prototype.writeRepeatedUint32 = function(a, b) {
              if (null != b) for (var c = 0; c < b.length; c++) this.writeUnsignedVarint32_(a, b[c]);
            };
            jspb.BinaryWriter.prototype.writeRepeatedUint32String = function(a, b) {
              if (null != b) for (var c = 0; c < b.length; c++) this.writeUint32String(a, b[c]);
            };
            jspb.BinaryWriter.prototype.writeRepeatedUint64 = function(a, b) {
              if (null != b) for (var c = 0; c < b.length; c++) this.writeUnsignedVarint64_(a, b[c]);
            };
            jspb.BinaryWriter.prototype.writeRepeatedUint64String = function(a, b) {
              if (null != b) for (var c = 0; c < b.length; c++) this.writeUint64String(a, b[c]);
            };
            jspb.BinaryWriter.prototype.writeRepeatedSint32 = function(a, b) {
              if (null != b) for (var c = 0; c < b.length; c++) this.writeZigzagVarint32_(a, b[c]);
            };
            jspb.BinaryWriter.prototype.writeRepeatedSint64 = function(a, b) {
              if (null != b) for (var c = 0; c < b.length; c++) this.writeZigzagVarint64_(a, b[c]);
            };
            jspb.BinaryWriter.prototype.writeRepeatedSint64String = function(a, b) {
              if (null != b) for (var c = 0; c < b.length; c++) this.writeZigzagVarint64String_(a, b[c]);
            };
            jspb.BinaryWriter.prototype.writeRepeatedFixed32 = function(a, b) {
              if (null != b) for (var c = 0; c < b.length; c++) this.writeFixed32(a, b[c]);
            };
            jspb.BinaryWriter.prototype.writeRepeatedFixed64 = function(a, b) {
              if (null != b) for (var c = 0; c < b.length; c++) this.writeFixed64(a, b[c]);
            };
            jspb.BinaryWriter.prototype.writeRepeatedFixed64String = function(a, b) {
              if (null != b) for (var c = 0; c < b.length; c++) this.writeFixed64String(a, b[c]);
            };
            jspb.BinaryWriter.prototype.writeRepeatedSfixed32 = function(a, b) {
              if (null != b) for (var c = 0; c < b.length; c++) this.writeSfixed32(a, b[c]);
            };
            jspb.BinaryWriter.prototype.writeRepeatedSfixed64 = function(a, b) {
              if (null != b) for (var c = 0; c < b.length; c++) this.writeSfixed64(a, b[c]);
            };
            jspb.BinaryWriter.prototype.writeRepeatedSfixed64String = function(a, b) {
              if (null != b) for (var c = 0; c < b.length; c++) this.writeSfixed64String(a, b[c]);
            };
            jspb.BinaryWriter.prototype.writeRepeatedFloat = function(a, b) {
              if (null != b) for (var c = 0; c < b.length; c++) this.writeFloat(a, b[c]);
            };
            jspb.BinaryWriter.prototype.writeRepeatedDouble = function(a, b) {
              if (null != b) for (var c = 0; c < b.length; c++) this.writeDouble(a, b[c]);
            };
            jspb.BinaryWriter.prototype.writeRepeatedBool = function(a, b) {
              if (null != b) for (var c = 0; c < b.length; c++) this.writeBool(a, b[c]);
            };
            jspb.BinaryWriter.prototype.writeRepeatedEnum = function(a, b) {
              if (null != b) for (var c = 0; c < b.length; c++) this.writeEnum(a, b[c]);
            };
            jspb.BinaryWriter.prototype.writeRepeatedString = function(a, b) {
              if (null != b) for (var c = 0; c < b.length; c++) this.writeString(a, b[c]);
            };
            jspb.BinaryWriter.prototype.writeRepeatedBytes = function(a, b) {
              if (null != b) for (var c = 0; c < b.length; c++) this.writeBytes(a, b[c]);
            };
            jspb.BinaryWriter.prototype.writeRepeatedMessage = function(a, b, c) {
              if (null != b) for (var d = 0; d < b.length; d++) {
                var e = this.beginDelimited_(a);
                c(b[d], this);
                this.endDelimited_(e);
              }
            };
            jspb.BinaryWriter.prototype.writeRepeatedGroup = function(a, b, c) {
              if (null != b) for (var d = 0; d < b.length; d++) this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.START_GROUP), 
              c(b[d], this), this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.END_GROUP);
            };
            jspb.BinaryWriter.prototype.writeRepeatedFixedHash64 = function(a, b) {
              if (null != b) for (var c = 0; c < b.length; c++) this.writeFixedHash64(a, b[c]);
            };
            jspb.BinaryWriter.prototype.writeRepeatedVarintHash64 = function(a, b) {
              if (null != b) for (var c = 0; c < b.length; c++) this.writeVarintHash64(a, b[c]);
            };
            jspb.BinaryWriter.prototype.writePackedInt32 = function(a, b) {
              if (null != b && b.length) {
                for (var c = this.beginDelimited_(a), d = 0; d < b.length; d++) this.encoder_.writeSignedVarint32(b[d]);
                this.endDelimited_(c);
              }
            };
            jspb.BinaryWriter.prototype.writePackedInt32String = function(a, b) {
              if (null != b && b.length) {
                for (var c = this.beginDelimited_(a), d = 0; d < b.length; d++) this.encoder_.writeSignedVarint32(parseInt(b[d], 10));
                this.endDelimited_(c);
              }
            };
            jspb.BinaryWriter.prototype.writePackedInt64 = function(a, b) {
              if (null != b && b.length) {
                for (var c = this.beginDelimited_(a), d = 0; d < b.length; d++) this.encoder_.writeSignedVarint64(b[d]);
                this.endDelimited_(c);
              }
            };
            jspb.BinaryWriter.prototype.writePackedInt64String = function(a, b) {
              if (null != b && b.length) {
                for (var c = this.beginDelimited_(a), d = 0; d < b.length; d++) {
                  var e = jspb.arith.Int64.fromString(b[d]);
                  this.encoder_.writeSplitVarint64(e.lo, e.hi);
                }
                this.endDelimited_(c);
              }
            };
            jspb.BinaryWriter.prototype.writePackedUint32 = function(a, b) {
              if (null != b && b.length) {
                for (var c = this.beginDelimited_(a), d = 0; d < b.length; d++) this.encoder_.writeUnsignedVarint32(b[d]);
                this.endDelimited_(c);
              }
            };
            jspb.BinaryWriter.prototype.writePackedUint32String = function(a, b) {
              if (null != b && b.length) {
                for (var c = this.beginDelimited_(a), d = 0; d < b.length; d++) this.encoder_.writeUnsignedVarint32(parseInt(b[d], 10));
                this.endDelimited_(c);
              }
            };
            jspb.BinaryWriter.prototype.writePackedUint64 = function(a, b) {
              if (null != b && b.length) {
                for (var c = this.beginDelimited_(a), d = 0; d < b.length; d++) this.encoder_.writeUnsignedVarint64(b[d]);
                this.endDelimited_(c);
              }
            };
            jspb.BinaryWriter.prototype.writePackedUint64String = function(a, b) {
              if (null != b && b.length) {
                for (var c = this.beginDelimited_(a), d = 0; d < b.length; d++) {
                  var e = jspb.arith.UInt64.fromString(b[d]);
                  this.encoder_.writeSplitVarint64(e.lo, e.hi);
                }
                this.endDelimited_(c);
              }
            };
            jspb.BinaryWriter.prototype.writePackedSint32 = function(a, b) {
              if (null != b && b.length) {
                for (var c = this.beginDelimited_(a), d = 0; d < b.length; d++) this.encoder_.writeZigzagVarint32(b[d]);
                this.endDelimited_(c);
              }
            };
            jspb.BinaryWriter.prototype.writePackedSint64 = function(a, b) {
              if (null != b && b.length) {
                for (var c = this.beginDelimited_(a), d = 0; d < b.length; d++) this.encoder_.writeZigzagVarint64(b[d]);
                this.endDelimited_(c);
              }
            };
            jspb.BinaryWriter.prototype.writePackedSint64String = function(a, b) {
              if (null != b && b.length) {
                for (var c = this.beginDelimited_(a), d = 0; d < b.length; d++) this.encoder_.writeZigzagVarint64(parseInt(b[d], 10));
                this.endDelimited_(c);
              }
            };
            jspb.BinaryWriter.prototype.writePackedFixed32 = function(a, b) {
              if (null != b && b.length) {
                this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.DELIMITED);
                this.encoder_.writeUnsignedVarint32(4 * b.length);
                for (var c = 0; c < b.length; c++) this.encoder_.writeUint32(b[c]);
              }
            };
            jspb.BinaryWriter.prototype.writePackedFixed64 = function(a, b) {
              if (null != b && b.length) {
                this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.DELIMITED);
                this.encoder_.writeUnsignedVarint32(8 * b.length);
                for (var c = 0; c < b.length; c++) this.encoder_.writeUint64(b[c]);
              }
            };
            jspb.BinaryWriter.prototype.writePackedFixed64String = function(a, b) {
              if (null != b && b.length) {
                this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.DELIMITED);
                this.encoder_.writeUnsignedVarint32(8 * b.length);
                for (var c = 0; c < b.length; c++) {
                  var d = jspb.arith.UInt64.fromString(b[c]);
                  this.encoder_.writeSplitFixed64(d.lo, d.hi);
                }
              }
            };
            jspb.BinaryWriter.prototype.writePackedSfixed32 = function(a, b) {
              if (null != b && b.length) {
                this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.DELIMITED);
                this.encoder_.writeUnsignedVarint32(4 * b.length);
                for (var c = 0; c < b.length; c++) this.encoder_.writeInt32(b[c]);
              }
            };
            jspb.BinaryWriter.prototype.writePackedSfixed64 = function(a, b) {
              if (null != b && b.length) {
                this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.DELIMITED);
                this.encoder_.writeUnsignedVarint32(8 * b.length);
                for (var c = 0; c < b.length; c++) this.encoder_.writeInt64(b[c]);
              }
            };
            jspb.BinaryWriter.prototype.writePackedSfixed64String = function(a, b) {
              if (null != b && b.length) {
                this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.DELIMITED);
                this.encoder_.writeUnsignedVarint32(8 * b.length);
                for (var c = 0; c < b.length; c++) this.encoder_.writeInt64String(b[c]);
              }
            };
            jspb.BinaryWriter.prototype.writePackedFloat = function(a, b) {
              if (null != b && b.length) {
                this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.DELIMITED);
                this.encoder_.writeUnsignedVarint32(4 * b.length);
                for (var c = 0; c < b.length; c++) this.encoder_.writeFloat(b[c]);
              }
            };
            jspb.BinaryWriter.prototype.writePackedDouble = function(a, b) {
              if (null != b && b.length) {
                this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.DELIMITED);
                this.encoder_.writeUnsignedVarint32(8 * b.length);
                for (var c = 0; c < b.length; c++) this.encoder_.writeDouble(b[c]);
              }
            };
            jspb.BinaryWriter.prototype.writePackedBool = function(a, b) {
              if (null != b && b.length) {
                this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.DELIMITED);
                this.encoder_.writeUnsignedVarint32(b.length);
                for (var c = 0; c < b.length; c++) this.encoder_.writeBool(b[c]);
              }
            };
            jspb.BinaryWriter.prototype.writePackedEnum = function(a, b) {
              if (null != b && b.length) {
                for (var c = this.beginDelimited_(a), d = 0; d < b.length; d++) this.encoder_.writeEnum(b[d]);
                this.endDelimited_(c);
              }
            };
            jspb.BinaryWriter.prototype.writePackedFixedHash64 = function(a, b) {
              if (null != b && b.length) {
                this.writeFieldHeader_(a, jspb.BinaryConstants.WireType.DELIMITED);
                this.encoder_.writeUnsignedVarint32(8 * b.length);
                for (var c = 0; c < b.length; c++) this.encoder_.writeFixedHash64(b[c]);
              }
            };
            jspb.BinaryWriter.prototype.writePackedVarintHash64 = function(a, b) {
              if (null != b && b.length) {
                for (var c = this.beginDelimited_(a), d = 0; d < b.length; d++) this.encoder_.writeVarintHash64(b[d]);
                this.endDelimited_(c);
              }
            };
            jspb.BinaryIterator = function(a, b, c) {
              this.elements_ = this.nextMethod_ = this.decoder_ = null;
              this.cursor_ = 0;
              this.nextValue_ = null;
              this.atEnd_ = !0;
              this.init_(a, b, c);
            };
            jspb.BinaryIterator.prototype.init_ = function(a, b, c) {
              a && b && (this.decoder_ = a, this.nextMethod_ = b);
              this.elements_ = c || null;
              this.cursor_ = 0;
              this.nextValue_ = null;
              this.atEnd_ = !this.decoder_ && !this.elements_;
              this.next();
            };
            jspb.BinaryIterator.instanceCache_ = [];
            jspb.BinaryIterator.alloc = function(a, b, c) {
              if (jspb.BinaryIterator.instanceCache_.length) {
                var d = jspb.BinaryIterator.instanceCache_.pop();
                d.init_(a, b, c);
                return d;
              }
              return new jspb.BinaryIterator(a, b, c);
            };
            jspb.BinaryIterator.prototype.free = function() {
              this.clear();
              100 > jspb.BinaryIterator.instanceCache_.length && jspb.BinaryIterator.instanceCache_.push(this);
            };
            jspb.BinaryIterator.prototype.clear = function() {
              this.decoder_ && this.decoder_.free();
              this.elements_ = this.nextMethod_ = this.decoder_ = null;
              this.cursor_ = 0;
              this.nextValue_ = null;
              this.atEnd_ = !0;
            };
            jspb.BinaryIterator.prototype.get = function() {
              return this.nextValue_;
            };
            jspb.BinaryIterator.prototype.atEnd = function() {
              return this.atEnd_;
            };
            jspb.BinaryIterator.prototype.next = function() {
              var a = this.nextValue_;
              this.decoder_ ? this.decoder_.atEnd() ? (this.nextValue_ = null, this.atEnd_ = !0) : this.nextValue_ = this.nextMethod_.call(this.decoder_) : this.elements_ && (this.cursor_ == this.elements_.length ? (this.nextValue_ = null, 
              this.atEnd_ = !0) : this.nextValue_ = this.elements_[this.cursor_++]);
              return a;
            };
            jspb.BinaryDecoder = function(a, b, c) {
              this.bytes_ = null;
              this.tempHigh_ = this.tempLow_ = this.cursor_ = this.end_ = this.start_ = 0;
              this.error_ = !1;
              a && this.setBlock(a, b, c);
            };
            jspb.BinaryDecoder.instanceCache_ = [];
            jspb.BinaryDecoder.alloc = function(a, b, c) {
              if (jspb.BinaryDecoder.instanceCache_.length) {
                var d = jspb.BinaryDecoder.instanceCache_.pop();
                a && d.setBlock(a, b, c);
                return d;
              }
              return new jspb.BinaryDecoder(a, b, c);
            };
            jspb.BinaryDecoder.prototype.free = function() {
              this.clear();
              100 > jspb.BinaryDecoder.instanceCache_.length && jspb.BinaryDecoder.instanceCache_.push(this);
            };
            jspb.BinaryDecoder.prototype.clone = function() {
              return jspb.BinaryDecoder.alloc(this.bytes_, this.start_, this.end_ - this.start_);
            };
            jspb.BinaryDecoder.prototype.clear = function() {
              this.bytes_ = null;
              this.cursor_ = this.end_ = this.start_ = 0;
              this.error_ = !1;
            };
            jspb.BinaryDecoder.prototype.getBuffer = function() {
              return this.bytes_;
            };
            jspb.BinaryDecoder.prototype.setBlock = function(a, b, c) {
              this.bytes_ = jspb.utils.byteSourceToUint8Array(a);
              this.start_ = goog.isDef(b) ? b : 0;
              this.end_ = goog.isDef(c) ? this.start_ + c : this.bytes_.length;
              this.cursor_ = this.start_;
            };
            jspb.BinaryDecoder.prototype.getEnd = function() {
              return this.end_;
            };
            jspb.BinaryDecoder.prototype.setEnd = function(a) {
              this.end_ = a;
            };
            jspb.BinaryDecoder.prototype.reset = function() {
              this.cursor_ = this.start_;
            };
            jspb.BinaryDecoder.prototype.getCursor = function() {
              return this.cursor_;
            };
            jspb.BinaryDecoder.prototype.setCursor = function(a) {
              this.cursor_ = a;
            };
            jspb.BinaryDecoder.prototype.advance = function(a) {
              this.cursor_ += a;
              goog.asserts.assert(this.cursor_ <= this.end_);
            };
            jspb.BinaryDecoder.prototype.atEnd = function() {
              return this.cursor_ == this.end_;
            };
            jspb.BinaryDecoder.prototype.pastEnd = function() {
              return this.cursor_ > this.end_;
            };
            jspb.BinaryDecoder.prototype.getError = function() {
              return this.error_ || 0 > this.cursor_ || this.cursor_ > this.end_;
            };
            jspb.BinaryDecoder.prototype.readSplitVarint64_ = function() {
              for (var a, b = 0, c, d = 0; 4 > d; d++) if (a = this.bytes_[this.cursor_++], b |= (127 & a) << 7 * d, 
              128 > a) {
                this.tempLow_ = b >>> 0;
                this.tempHigh_ = 0;
                return;
              }
              a = this.bytes_[this.cursor_++];
              b |= (127 & a) << 28;
              c = 0 | (127 & a) >> 4;
              if (128 > a) this.tempLow_ = b >>> 0, this.tempHigh_ = c >>> 0; else {
                for (d = 0; 5 > d; d++) if (a = this.bytes_[this.cursor_++], c |= (127 & a) << 7 * d + 3, 
                128 > a) {
                  this.tempLow_ = b >>> 0;
                  this.tempHigh_ = c >>> 0;
                  return;
                }
                goog.asserts.fail("Failed to read varint, encoding is invalid.");
                this.error_ = !0;
              }
            };
            jspb.BinaryDecoder.prototype.skipVarint = function() {
              for (;128 & this.bytes_[this.cursor_]; ) this.cursor_++;
              this.cursor_++;
            };
            jspb.BinaryDecoder.prototype.unskipVarint = function(a) {
              for (;128 < a; ) this.cursor_--, a >>>= 7;
              this.cursor_--;
            };
            jspb.BinaryDecoder.prototype.readUnsignedVarint32 = function() {
              var a, b = this.bytes_;
              a = b[this.cursor_ + 0];
              var c = 127 & a;
              if (128 > a) return this.cursor_ += 1, goog.asserts.assert(this.cursor_ <= this.end_), 
              c;
              a = b[this.cursor_ + 1];
              c |= (127 & a) << 7;
              if (128 > a) return this.cursor_ += 2, goog.asserts.assert(this.cursor_ <= this.end_), 
              c;
              a = b[this.cursor_ + 2];
              c |= (127 & a) << 14;
              if (128 > a) return this.cursor_ += 3, goog.asserts.assert(this.cursor_ <= this.end_), 
              c;
              a = b[this.cursor_ + 3];
              c |= (127 & a) << 21;
              if (128 > a) return this.cursor_ += 4, goog.asserts.assert(this.cursor_ <= this.end_), 
              c;
              a = b[this.cursor_ + 4];
              c |= (15 & a) << 28;
              if (128 > a) return this.cursor_ += 5, goog.asserts.assert(this.cursor_ <= this.end_), 
              c >>> 0;
              this.cursor_ += 5;
              128 <= b[this.cursor_++] && 128 <= b[this.cursor_++] && 128 <= b[this.cursor_++] && 128 <= b[this.cursor_++] && 128 <= b[this.cursor_++] && goog.asserts.assert(!1);
              goog.asserts.assert(this.cursor_ <= this.end_);
              return c;
            };
            jspb.BinaryDecoder.prototype.readSignedVarint32 = jspb.BinaryDecoder.prototype.readUnsignedVarint32;
            jspb.BinaryDecoder.prototype.readUnsignedVarint32String = function() {
              return this.readUnsignedVarint32().toString();
            };
            jspb.BinaryDecoder.prototype.readSignedVarint32String = function() {
              return this.readSignedVarint32().toString();
            };
            jspb.BinaryDecoder.prototype.readZigzagVarint32 = function() {
              var a = this.readUnsignedVarint32();
              return a >>> 1 ^ -(1 & a);
            };
            jspb.BinaryDecoder.prototype.readUnsignedVarint64 = function() {
              this.readSplitVarint64_();
              return jspb.utils.joinUint64(this.tempLow_, this.tempHigh_);
            };
            jspb.BinaryDecoder.prototype.readUnsignedVarint64String = function() {
              this.readSplitVarint64_();
              return jspb.utils.joinUnsignedDecimalString(this.tempLow_, this.tempHigh_);
            };
            jspb.BinaryDecoder.prototype.readSignedVarint64 = function() {
              this.readSplitVarint64_();
              return jspb.utils.joinInt64(this.tempLow_, this.tempHigh_);
            };
            jspb.BinaryDecoder.prototype.readSignedVarint64String = function() {
              this.readSplitVarint64_();
              return jspb.utils.joinSignedDecimalString(this.tempLow_, this.tempHigh_);
            };
            jspb.BinaryDecoder.prototype.readZigzagVarint64 = function() {
              this.readSplitVarint64_();
              return jspb.utils.joinZigzag64(this.tempLow_, this.tempHigh_);
            };
            jspb.BinaryDecoder.prototype.readZigzagVarint64String = function() {
              return this.readZigzagVarint64().toString();
            };
            jspb.BinaryDecoder.prototype.readUint8 = function() {
              var a = this.bytes_[this.cursor_ + 0];
              this.cursor_ += 1;
              goog.asserts.assert(this.cursor_ <= this.end_);
              return a;
            };
            jspb.BinaryDecoder.prototype.readUint16 = function() {
              var a = this.bytes_[this.cursor_ + 0], b = this.bytes_[this.cursor_ + 1];
              this.cursor_ += 2;
              goog.asserts.assert(this.cursor_ <= this.end_);
              return a << 0 | b << 8;
            };
            jspb.BinaryDecoder.prototype.readUint32 = function() {
              var a = this.bytes_[this.cursor_ + 0], b = this.bytes_[this.cursor_ + 1], c = this.bytes_[this.cursor_ + 2], d = this.bytes_[this.cursor_ + 3];
              this.cursor_ += 4;
              goog.asserts.assert(this.cursor_ <= this.end_);
              return (a << 0 | b << 8 | c << 16 | d << 24) >>> 0;
            };
            jspb.BinaryDecoder.prototype.readUint64 = function() {
              var a = this.readUint32(), b = this.readUint32();
              return jspb.utils.joinUint64(a, b);
            };
            jspb.BinaryDecoder.prototype.readUint64String = function() {
              var a = this.readUint32(), b = this.readUint32();
              return jspb.utils.joinUnsignedDecimalString(a, b);
            };
            jspb.BinaryDecoder.prototype.readInt8 = function() {
              var a = this.bytes_[this.cursor_ + 0];
              this.cursor_ += 1;
              goog.asserts.assert(this.cursor_ <= this.end_);
              return a << 24 >> 24;
            };
            jspb.BinaryDecoder.prototype.readInt16 = function() {
              var a = this.bytes_[this.cursor_ + 0], b = this.bytes_[this.cursor_ + 1];
              this.cursor_ += 2;
              goog.asserts.assert(this.cursor_ <= this.end_);
              return (a << 0 | b << 8) << 16 >> 16;
            };
            jspb.BinaryDecoder.prototype.readInt32 = function() {
              var a = this.bytes_[this.cursor_ + 0], b = this.bytes_[this.cursor_ + 1], c = this.bytes_[this.cursor_ + 2], d = this.bytes_[this.cursor_ + 3];
              this.cursor_ += 4;
              goog.asserts.assert(this.cursor_ <= this.end_);
              return a << 0 | b << 8 | c << 16 | d << 24;
            };
            jspb.BinaryDecoder.prototype.readInt64 = function() {
              var a = this.readUint32(), b = this.readUint32();
              return jspb.utils.joinInt64(a, b);
            };
            jspb.BinaryDecoder.prototype.readInt64String = function() {
              var a = this.readUint32(), b = this.readUint32();
              return jspb.utils.joinSignedDecimalString(a, b);
            };
            jspb.BinaryDecoder.prototype.readFloat = function() {
              var a = this.readUint32();
              return jspb.utils.joinFloat32(a, 0);
            };
            jspb.BinaryDecoder.prototype.readDouble = function() {
              var a = this.readUint32(), b = this.readUint32();
              return jspb.utils.joinFloat64(a, b);
            };
            jspb.BinaryDecoder.prototype.readBool = function() {
              return !!this.bytes_[this.cursor_++];
            };
            jspb.BinaryDecoder.prototype.readEnum = function() {
              return this.readSignedVarint32();
            };
            jspb.BinaryDecoder.prototype.readString = function(a) {
              var b = this.bytes_, c = this.cursor_;
              a = c + a;
              for (var d = [], e = ""; c < a; ) {
                var f = b[c++];
                if (128 > f) d.push(f); else {
                  if (192 > f) continue;
                  if (224 > f) {
                    var g = b[c++];
                    d.push((31 & f) << 6 | 63 & g);
                  } else if (240 > f) {
                    var g = b[c++], h = b[c++];
                    d.push((15 & f) << 12 | (63 & g) << 6 | 63 & h);
                  } else if (248 > f) {
                    var g = b[c++], h = b[c++], k = b[c++], f = (7 & f) << 18 | (63 & g) << 12 | (63 & h) << 6 | 63 & k, f = f - 65536;
                    d.push(55296 + (f >> 10 & 1023), 56320 + (1023 & f));
                  }
                }
                8192 <= d.length && (e += String.fromCharCode.apply(null, d), d.length = 0);
              }
              e += goog.crypt.byteArrayToString(d);
              this.cursor_ = c;
              return e;
            };
            jspb.BinaryDecoder.prototype.readStringWithLength = function() {
              var a = this.readUnsignedVarint32();
              return this.readString(a);
            };
            jspb.BinaryDecoder.prototype.readBytes = function(a) {
              if (0 > a || this.cursor_ + a > this.bytes_.length) return this.error_ = !0, goog.asserts.fail("Invalid byte length!"), 
              new Uint8Array(0);
              var b = this.bytes_.subarray(this.cursor_, this.cursor_ + a);
              this.cursor_ += a;
              goog.asserts.assert(this.cursor_ <= this.end_);
              return b;
            };
            jspb.BinaryDecoder.prototype.readVarintHash64 = function() {
              this.readSplitVarint64_();
              return jspb.utils.joinHash64(this.tempLow_, this.tempHigh_);
            };
            jspb.BinaryDecoder.prototype.readFixedHash64 = function() {
              var a = this.bytes_, b = this.cursor_, c = a[b + 0], d = a[b + 1], e = a[b + 2], f = a[b + 3], g = a[b + 4], h = a[b + 5], k = a[b + 6], a = a[b + 7];
              this.cursor_ += 8;
              return String.fromCharCode(c, d, e, f, g, h, k, a);
            };
            jspb.BinaryReader = function(a, b, c) {
              this.decoder_ = jspb.BinaryDecoder.alloc(a, b, c);
              this.fieldCursor_ = this.decoder_.getCursor();
              this.nextField_ = jspb.BinaryConstants.INVALID_FIELD_NUMBER;
              this.nextWireType_ = jspb.BinaryConstants.WireType.INVALID;
              this.error_ = !1;
              this.readCallbacks_ = null;
            };
            jspb.BinaryReader.instanceCache_ = [];
            jspb.BinaryReader.alloc = function(a, b, c) {
              if (jspb.BinaryReader.instanceCache_.length) {
                var d = jspb.BinaryReader.instanceCache_.pop();
                a && d.decoder_.setBlock(a, b, c);
                return d;
              }
              return new jspb.BinaryReader(a, b, c);
            };
            jspb.BinaryReader.prototype.alloc = jspb.BinaryReader.alloc;
            jspb.BinaryReader.prototype.free = function() {
              this.decoder_.clear();
              this.nextField_ = jspb.BinaryConstants.INVALID_FIELD_NUMBER;
              this.nextWireType_ = jspb.BinaryConstants.WireType.INVALID;
              this.error_ = !1;
              this.readCallbacks_ = null;
              100 > jspb.BinaryReader.instanceCache_.length && jspb.BinaryReader.instanceCache_.push(this);
            };
            jspb.BinaryReader.prototype.getFieldCursor = function() {
              return this.fieldCursor_;
            };
            jspb.BinaryReader.prototype.getCursor = function() {
              return this.decoder_.getCursor();
            };
            jspb.BinaryReader.prototype.getBuffer = function() {
              return this.decoder_.getBuffer();
            };
            jspb.BinaryReader.prototype.getFieldNumber = function() {
              return this.nextField_;
            };
            jspb.BinaryReader.prototype.getWireType = function() {
              return this.nextWireType_;
            };
            jspb.BinaryReader.prototype.isEndGroup = function() {
              return this.nextWireType_ == jspb.BinaryConstants.WireType.END_GROUP;
            };
            jspb.BinaryReader.prototype.getError = function() {
              return this.error_ || this.decoder_.getError();
            };
            jspb.BinaryReader.prototype.setBlock = function(a, b, c) {
              this.decoder_.setBlock(a, b, c);
              this.nextField_ = jspb.BinaryConstants.INVALID_FIELD_NUMBER;
              this.nextWireType_ = jspb.BinaryConstants.WireType.INVALID;
            };
            jspb.BinaryReader.prototype.reset = function() {
              this.decoder_.reset();
              this.nextField_ = jspb.BinaryConstants.INVALID_FIELD_NUMBER;
              this.nextWireType_ = jspb.BinaryConstants.WireType.INVALID;
            };
            jspb.BinaryReader.prototype.advance = function(a) {
              this.decoder_.advance(a);
            };
            jspb.BinaryReader.prototype.nextField = function() {
              if (this.decoder_.atEnd()) return !1;
              if (this.getError()) return goog.asserts.fail("Decoder hit an error"), !1;
              this.fieldCursor_ = this.decoder_.getCursor();
              var a = this.decoder_.readUnsignedVarint32(), b = a >>> 3, a = 7 & a;
              if (a != jspb.BinaryConstants.WireType.VARINT && a != jspb.BinaryConstants.WireType.FIXED32 && a != jspb.BinaryConstants.WireType.FIXED64 && a != jspb.BinaryConstants.WireType.DELIMITED && a != jspb.BinaryConstants.WireType.START_GROUP && a != jspb.BinaryConstants.WireType.END_GROUP) return goog.asserts.fail("Invalid wire type"), 
              this.error_ = !0, !1;
              this.nextField_ = b;
              this.nextWireType_ = a;
              return !0;
            };
            jspb.BinaryReader.prototype.unskipHeader = function() {
              this.decoder_.unskipVarint(this.nextField_ << 3 | this.nextWireType_);
            };
            jspb.BinaryReader.prototype.skipMatchingFields = function() {
              var a = this.nextField_;
              for (this.unskipHeader(); this.nextField() && this.getFieldNumber() == a; ) this.skipField();
              this.decoder_.atEnd() || this.unskipHeader();
            };
            jspb.BinaryReader.prototype.skipVarintField = function() {
              this.nextWireType_ != jspb.BinaryConstants.WireType.VARINT ? (goog.asserts.fail("Invalid wire type for skipVarintField"), 
              this.skipField()) : this.decoder_.skipVarint();
            };
            jspb.BinaryReader.prototype.skipDelimitedField = function() {
              if (this.nextWireType_ != jspb.BinaryConstants.WireType.DELIMITED) goog.asserts.fail("Invalid wire type for skipDelimitedField"), 
              this.skipField(); else {
                var a = this.decoder_.readUnsignedVarint32();
                this.decoder_.advance(a);
              }
            };
            jspb.BinaryReader.prototype.skipFixed32Field = function() {
              this.nextWireType_ != jspb.BinaryConstants.WireType.FIXED32 ? (goog.asserts.fail("Invalid wire type for skipFixed32Field"), 
              this.skipField()) : this.decoder_.advance(4);
            };
            jspb.BinaryReader.prototype.skipFixed64Field = function() {
              this.nextWireType_ != jspb.BinaryConstants.WireType.FIXED64 ? (goog.asserts.fail("Invalid wire type for skipFixed64Field"), 
              this.skipField()) : this.decoder_.advance(8);
            };
            jspb.BinaryReader.prototype.skipGroup = function() {
              var a = [ this.nextField_ ];
              do {
                if (!this.nextField()) {
                  goog.asserts.fail("Unmatched start-group tag: stream EOF");
                  this.error_ = !0;
                  break;
                }
                if (this.nextWireType_ == jspb.BinaryConstants.WireType.START_GROUP) a.push(this.nextField_); else if (this.nextWireType_ == jspb.BinaryConstants.WireType.END_GROUP && this.nextField_ != a.pop()) {
                  goog.asserts.fail("Unmatched end-group tag");
                  this.error_ = !0;
                  break;
                }
              } while (0 < a.length);
            };
            jspb.BinaryReader.prototype.skipField = function() {
              switch (this.nextWireType_) {
               case jspb.BinaryConstants.WireType.VARINT:
                this.skipVarintField();
                break;

               case jspb.BinaryConstants.WireType.FIXED64:
                this.skipFixed64Field();
                break;

               case jspb.BinaryConstants.WireType.DELIMITED:
                this.skipDelimitedField();
                break;

               case jspb.BinaryConstants.WireType.FIXED32:
                this.skipFixed32Field();
                break;

               case jspb.BinaryConstants.WireType.START_GROUP:
                this.skipGroup();
                break;

               default:
                goog.asserts.fail("Invalid wire encoding for field.");
              }
            };
            jspb.BinaryReader.prototype.registerReadCallback = function(a, b) {
              goog.isNull(this.readCallbacks_) && (this.readCallbacks_ = {});
              goog.asserts.assert(!this.readCallbacks_[a]);
              this.readCallbacks_[a] = b;
            };
            jspb.BinaryReader.prototype.runReadCallback = function(a) {
              goog.asserts.assert(!goog.isNull(this.readCallbacks_));
              a = this.readCallbacks_[a];
              goog.asserts.assert(a);
              return a(this);
            };
            jspb.BinaryReader.prototype.readAny = function(a) {
              this.nextWireType_ = jspb.BinaryConstants.FieldTypeToWireType(a);
              var b = jspb.BinaryConstants.FieldType;
              switch (a) {
               case b.DOUBLE:
                return this.readDouble();

               case b.FLOAT:
                return this.readFloat();

               case b.INT64:
                return this.readInt64();

               case b.UINT64:
                return this.readUint64();

               case b.INT32:
                return this.readInt32();

               case b.FIXED64:
                return this.readFixed64();

               case b.FIXED32:
                return this.readFixed32();

               case b.BOOL:
                return this.readBool();

               case b.STRING:
                return this.readString();

               case b.GROUP:
                goog.asserts.fail("Group field type not supported in readAny()");

               case b.MESSAGE:
                goog.asserts.fail("Message field type not supported in readAny()");

               case b.BYTES:
                return this.readBytes();

               case b.UINT32:
                return this.readUint32();

               case b.ENUM:
                return this.readEnum();

               case b.SFIXED32:
                return this.readSfixed32();

               case b.SFIXED64:
                return this.readSfixed64();

               case b.SINT32:
                return this.readSint32();

               case b.SINT64:
                return this.readSint64();

               case b.FHASH64:
                return this.readFixedHash64();

               case b.VHASH64:
                return this.readVarintHash64();

               default:
                goog.asserts.fail("Invalid field type in readAny()");
              }
              return 0;
            };
            jspb.BinaryReader.prototype.readMessage = function(a, b) {
              goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.DELIMITED);
              var c = this.decoder_.getEnd(), d = this.decoder_.readUnsignedVarint32(), d = this.decoder_.getCursor() + d;
              this.decoder_.setEnd(d);
              b(a, this);
              this.decoder_.setCursor(d);
              this.decoder_.setEnd(c);
            };
            jspb.BinaryReader.prototype.readGroup = function(a, b, c) {
              goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.START_GROUP);
              goog.asserts.assert(this.nextField_ == a);
              c(b, this);
              this.error_ || this.nextWireType_ == jspb.BinaryConstants.WireType.END_GROUP || (goog.asserts.fail("Group submessage did not end with an END_GROUP tag"), 
              this.error_ = !0);
            };
            jspb.BinaryReader.prototype.getFieldDecoder = function() {
              goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.DELIMITED);
              var a = this.decoder_.readUnsignedVarint32(), b = this.decoder_.getCursor(), c = b + a, a = jspb.BinaryDecoder.alloc(this.decoder_.getBuffer(), b, a);
              this.decoder_.setCursor(c);
              return a;
            };
            jspb.BinaryReader.prototype.readInt32 = function() {
              goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.VARINT);
              return this.decoder_.readSignedVarint32();
            };
            jspb.BinaryReader.prototype.readInt32String = function() {
              goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.VARINT);
              return this.decoder_.readSignedVarint32String();
            };
            jspb.BinaryReader.prototype.readInt64 = function() {
              goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.VARINT);
              return this.decoder_.readSignedVarint64();
            };
            jspb.BinaryReader.prototype.readInt64String = function() {
              goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.VARINT);
              return this.decoder_.readSignedVarint64String();
            };
            jspb.BinaryReader.prototype.readUint32 = function() {
              goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.VARINT);
              return this.decoder_.readUnsignedVarint32();
            };
            jspb.BinaryReader.prototype.readUint32String = function() {
              goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.VARINT);
              return this.decoder_.readUnsignedVarint32String();
            };
            jspb.BinaryReader.prototype.readUint64 = function() {
              goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.VARINT);
              return this.decoder_.readUnsignedVarint64();
            };
            jspb.BinaryReader.prototype.readUint64String = function() {
              goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.VARINT);
              return this.decoder_.readUnsignedVarint64String();
            };
            jspb.BinaryReader.prototype.readSint32 = function() {
              goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.VARINT);
              return this.decoder_.readZigzagVarint32();
            };
            jspb.BinaryReader.prototype.readSint64 = function() {
              goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.VARINT);
              return this.decoder_.readZigzagVarint64();
            };
            jspb.BinaryReader.prototype.readSint64String = function() {
              goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.VARINT);
              return this.decoder_.readZigzagVarint64String();
            };
            jspb.BinaryReader.prototype.readFixed32 = function() {
              goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.FIXED32);
              return this.decoder_.readUint32();
            };
            jspb.BinaryReader.prototype.readFixed64 = function() {
              goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.FIXED64);
              return this.decoder_.readUint64();
            };
            jspb.BinaryReader.prototype.readFixed64String = function() {
              goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.FIXED64);
              return this.decoder_.readUint64String();
            };
            jspb.BinaryReader.prototype.readSfixed32 = function() {
              goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.FIXED32);
              return this.decoder_.readInt32();
            };
            jspb.BinaryReader.prototype.readSfixed32String = function() {
              goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.FIXED32);
              return this.decoder_.readInt32().toString();
            };
            jspb.BinaryReader.prototype.readSfixed64 = function() {
              goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.FIXED64);
              return this.decoder_.readInt64();
            };
            jspb.BinaryReader.prototype.readSfixed64String = function() {
              goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.FIXED64);
              return this.decoder_.readInt64String();
            };
            jspb.BinaryReader.prototype.readFloat = function() {
              goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.FIXED32);
              return this.decoder_.readFloat();
            };
            jspb.BinaryReader.prototype.readDouble = function() {
              goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.FIXED64);
              return this.decoder_.readDouble();
            };
            jspb.BinaryReader.prototype.readBool = function() {
              goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.VARINT);
              return !!this.decoder_.readUnsignedVarint32();
            };
            jspb.BinaryReader.prototype.readEnum = function() {
              goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.VARINT);
              return this.decoder_.readSignedVarint64();
            };
            jspb.BinaryReader.prototype.readString = function() {
              goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.DELIMITED);
              var a = this.decoder_.readUnsignedVarint32();
              return this.decoder_.readString(a);
            };
            jspb.BinaryReader.prototype.readBytes = function() {
              goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.DELIMITED);
              var a = this.decoder_.readUnsignedVarint32();
              return this.decoder_.readBytes(a);
            };
            jspb.BinaryReader.prototype.readVarintHash64 = function() {
              goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.VARINT);
              return this.decoder_.readVarintHash64();
            };
            jspb.BinaryReader.prototype.readFixedHash64 = function() {
              goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.FIXED64);
              return this.decoder_.readFixedHash64();
            };
            jspb.BinaryReader.prototype.readPackedField_ = function(a) {
              goog.asserts.assert(this.nextWireType_ == jspb.BinaryConstants.WireType.DELIMITED);
              for (var b = this.decoder_.readUnsignedVarint32(), b = this.decoder_.getCursor() + b, c = []; this.decoder_.getCursor() < b; ) c.push(a.call(this.decoder_));
              return c;
            };
            jspb.BinaryReader.prototype.readPackedInt32 = function() {
              return this.readPackedField_(this.decoder_.readSignedVarint32);
            };
            jspb.BinaryReader.prototype.readPackedInt32String = function() {
              return this.readPackedField_(this.decoder_.readSignedVarint32String);
            };
            jspb.BinaryReader.prototype.readPackedInt64 = function() {
              return this.readPackedField_(this.decoder_.readSignedVarint64);
            };
            jspb.BinaryReader.prototype.readPackedInt64String = function() {
              return this.readPackedField_(this.decoder_.readSignedVarint64String);
            };
            jspb.BinaryReader.prototype.readPackedUint32 = function() {
              return this.readPackedField_(this.decoder_.readUnsignedVarint32);
            };
            jspb.BinaryReader.prototype.readPackedUint32String = function() {
              return this.readPackedField_(this.decoder_.readUnsignedVarint32String);
            };
            jspb.BinaryReader.prototype.readPackedUint64 = function() {
              return this.readPackedField_(this.decoder_.readUnsignedVarint64);
            };
            jspb.BinaryReader.prototype.readPackedUint64String = function() {
              return this.readPackedField_(this.decoder_.readUnsignedVarint64String);
            };
            jspb.BinaryReader.prototype.readPackedSint32 = function() {
              return this.readPackedField_(this.decoder_.readZigzagVarint32);
            };
            jspb.BinaryReader.prototype.readPackedSint64 = function() {
              return this.readPackedField_(this.decoder_.readZigzagVarint64);
            };
            jspb.BinaryReader.prototype.readPackedSint64String = function() {
              return this.readPackedField_(this.decoder_.readZigzagVarint64String);
            };
            jspb.BinaryReader.prototype.readPackedFixed32 = function() {
              return this.readPackedField_(this.decoder_.readUint32);
            };
            jspb.BinaryReader.prototype.readPackedFixed64 = function() {
              return this.readPackedField_(this.decoder_.readUint64);
            };
            jspb.BinaryReader.prototype.readPackedFixed64String = function() {
              return this.readPackedField_(this.decoder_.readUint64String);
            };
            jspb.BinaryReader.prototype.readPackedSfixed32 = function() {
              return this.readPackedField_(this.decoder_.readInt32);
            };
            jspb.BinaryReader.prototype.readPackedSfixed64 = function() {
              return this.readPackedField_(this.decoder_.readInt64);
            };
            jspb.BinaryReader.prototype.readPackedSfixed64String = function() {
              return this.readPackedField_(this.decoder_.readInt64String);
            };
            jspb.BinaryReader.prototype.readPackedFloat = function() {
              return this.readPackedField_(this.decoder_.readFloat);
            };
            jspb.BinaryReader.prototype.readPackedDouble = function() {
              return this.readPackedField_(this.decoder_.readDouble);
            };
            jspb.BinaryReader.prototype.readPackedBool = function() {
              return this.readPackedField_(this.decoder_.readBool);
            };
            jspb.BinaryReader.prototype.readPackedEnum = function() {
              return this.readPackedField_(this.decoder_.readEnum);
            };
            jspb.BinaryReader.prototype.readPackedVarintHash64 = function() {
              return this.readPackedField_(this.decoder_.readVarintHash64);
            };
            jspb.BinaryReader.prototype.readPackedFixedHash64 = function() {
              return this.readPackedField_(this.decoder_.readFixedHash64);
            };
            jspb.Export = {};
            exports.Map = jspb.Map;
            exports.Message = jspb.Message;
            exports.BinaryReader = jspb.BinaryReader;
            exports.BinaryWriter = jspb.BinaryWriter;
            exports.ExtensionFieldInfo = jspb.ExtensionFieldInfo;
            exports.ExtensionFieldBinaryInfo = jspb.ExtensionFieldBinaryInfo;
            exports.exportSymbol = goog.exportSymbol;
            exports.inherits = goog.inherits;
            exports.object = {
              extend: goog.object.extend
            };
            exports.typeOf = goog.typeOf;
          }).call(this, "undefined" !== typeof global ? global : "undefined" !== typeof self ? self : "undefined" !== typeof window ? window : {});
        }, {} ],
        2: [ function(_require, module, exports) {
          var jspb = _require("google-protobuf");
          var goog = jspb;
          var global = window;
          goog.exportSymbol("proto.stream.ErrorCode", null, global);
          proto.stream.ErrorCode = {
            NOERROR: 0,
            OK: 200,
            ACCEPTED: 202,
            NOCONTENT: 204,
            BADREQUEST: 400,
            UNAUTHORIZED: 401,
            SIGNATUREFAILED: 402,
            FORBIDDEN: 403,
            NOTFOUND: 404,
            INTERNALSERVERERROR: 500,
            NOTIMPLEMENTED: 501,
            BADGATEWAY: 502,
            SERVICEUNAVAILABLE: 503
          };
          goog.object.extend(exports, proto.stream);
        }, {
          "google-protobuf": 1
        } ],
        3: [ function(_require, module, exports) {
          var _module$exports;
          var myProto = _require("./sdk_pb");
          var myProto1 = _require("./gateway_pb");
          var myProto2 = _require("./errorcode_pb");
          module.exports = (_module$exports = {
            DataProto: myProto
          }, _defineProperty(_module$exports, "DataProto", myProto1), _defineProperty(_module$exports, "DataProto", myProto2), 
          _module$exports);
        }, {
          "./errorcode_pb": 2,
          "./gateway_pb": 4,
          "./sdk_pb": 5
        } ],
        4: [ function(_require, module, exports) {
          var jspb = _require("google-protobuf");
          var goog = jspb;
          var global = window;
          var errorcode_pb = _require("./errorcode_pb.js");
          goog.exportSymbol("proto.stream.BookInfo", null, global);
          goog.exportSymbol("proto.stream.CmdId", null, global);
          goog.exportSymbol("proto.stream.ConnDetailV2", null, global);
          goog.exportSymbol("proto.stream.CreateRoom", null, global);
          goog.exportSymbol("proto.stream.CreateRoomRsp", null, global);
          goog.exportSymbol("proto.stream.DisconnectReq", null, global);
          goog.exportSymbol("proto.stream.DisconnectRsp", null, global);
          goog.exportSymbol("proto.stream.GetRoomDetailReq", null, global);
          goog.exportSymbol("proto.stream.GetRoomDetailRsp", null, global);
          goog.exportSymbol("proto.stream.GetRoomList", null, global);
          goog.exportSymbol("proto.stream.GetRoomListExReq", null, global);
          goog.exportSymbol("proto.stream.GetRoomListExRsp", null, global);
          goog.exportSymbol("proto.stream.GetRoomListRsp", null, global);
          goog.exportSymbol("proto.stream.HeartbeatReq", null, global);
          goog.exportSymbol("proto.stream.HeartbeatRsp", null, global);
          goog.exportSymbol("proto.stream.JoinOpenNotify", null, global);
          goog.exportSymbol("proto.stream.JoinOpenReq", null, global);
          goog.exportSymbol("proto.stream.JoinOpenRsp", null, global);
          goog.exportSymbol("proto.stream.JoinOverNotify", null, global);
          goog.exportSymbol("proto.stream.JoinOverReq", null, global);
          goog.exportSymbol("proto.stream.JoinOverRsp", null, global);
          goog.exportSymbol("proto.stream.JoinRoomReq", null, global);
          goog.exportSymbol("proto.stream.JoinRoomRsp", null, global);
          goog.exportSymbol("proto.stream.JoinRoomType", null, global);
          goog.exportSymbol("proto.stream.KickPlayer", null, global);
          goog.exportSymbol("proto.stream.KickPlayerNotify", null, global);
          goog.exportSymbol("proto.stream.KickPlayerRsp", null, global);
          goog.exportSymbol("proto.stream.LeaveRoomReq", null, global);
          goog.exportSymbol("proto.stream.LeaveRoomRsp", null, global);
          goog.exportSymbol("proto.stream.LoginReq", null, global);
          goog.exportSymbol("proto.stream.LoginRsp", null, global);
          goog.exportSymbol("proto.stream.LogoutRsp", null, global);
          goog.exportSymbol("proto.stream.NetworkStateNotify", null, global);
          goog.exportSymbol("proto.stream.NetworkStateReq", null, global);
          goog.exportSymbol("proto.stream.NetworkStateRsp", null, global);
          goog.exportSymbol("proto.stream.NoticeJoin", null, global);
          goog.exportSymbol("proto.stream.NoticeLeave", null, global);
          goog.exportSymbol("proto.stream.NoticeRoomProperty", null, global);
          goog.exportSymbol("proto.stream.PlayerInfo", null, global);
          goog.exportSymbol("proto.stream.RoomDetail", null, global);
          goog.exportSymbol("proto.stream.RoomFilter", null, global);
          goog.exportSymbol("proto.stream.RoomInfo", null, global);
          goog.exportSymbol("proto.stream.RoomInfoEx", null, global);
          goog.exportSymbol("proto.stream.RoomListSort", null, global);
          goog.exportSymbol("proto.stream.RoomState", null, global);
          goog.exportSymbol("proto.stream.SetRoomPropertyReq", null, global);
          goog.exportSymbol("proto.stream.SetRoomPropertyRsp", null, global);
          goog.exportSymbol("proto.stream.SortOrder", null, global);
          goog.exportSymbol("proto.stream.TcpProtoHeader", null, global);
          goog.exportSymbol("proto.stream.UserV2", null, global);
          goog.exportSymbol("proto.stream.keyValue", null, global);
          proto.stream.LoginReq = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.LoginReq, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.LoginReq.displayName = "proto.stream.LoginReq");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.LoginReq.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.LoginReq.toObject(opt_includeInstance, this);
            };
            proto.stream.LoginReq.toObject = function(includeInstance, msg) {
              var f, obj = {
                gameid: jspb.Message.getFieldWithDefault(msg, 1, 0),
                appkey: jspb.Message.getFieldWithDefault(msg, 2, ""),
                deviceid: jspb.Message.getFieldWithDefault(msg, 3, ""),
                sign: jspb.Message.getFieldWithDefault(msg, 4, ""),
                sdkver: jspb.Message.getFieldWithDefault(msg, 5, ""),
                vendor: jspb.Message.getFieldWithDefault(msg, 6, 0),
                token: jspb.Message.getFieldWithDefault(msg, 7, "")
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.LoginReq.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.LoginReq();
            return proto.stream.LoginReq.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.LoginReq.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint32();
                msg.setGameid(value);
                break;

               case 2:
                var value = reader.readString();
                msg.setAppkey(value);
                break;

               case 3:
                var value = reader.readString();
                msg.setDeviceid(value);
                break;

               case 4:
                var value = reader.readString();
                msg.setSign(value);
                break;

               case 5:
                var value = reader.readString();
                msg.setSdkver(value);
                break;

               case 6:
                var value = reader.readUint32();
                msg.setVendor(value);
                break;

               case 7:
                var value = reader.readString();
                msg.setToken(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.LoginReq.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.LoginReq.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.LoginReq.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getGameid();
            0 !== f && writer.writeUint32(1, f);
            f = message.getAppkey();
            f.length > 0 && writer.writeString(2, f);
            f = message.getDeviceid();
            f.length > 0 && writer.writeString(3, f);
            f = message.getSign();
            f.length > 0 && writer.writeString(4, f);
            f = message.getSdkver();
            f.length > 0 && writer.writeString(5, f);
            f = message.getVendor();
            0 !== f && writer.writeUint32(6, f);
            f = message.getToken();
            f.length > 0 && writer.writeString(7, f);
          };
          proto.stream.LoginReq.prototype.getGameid = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.LoginReq.prototype.setGameid = function(value) {
            jspb.Message.setProto3IntField(this, 1, value);
          };
          proto.stream.LoginReq.prototype.getAppkey = function() {
            return jspb.Message.getFieldWithDefault(this, 2, "");
          };
          proto.stream.LoginReq.prototype.setAppkey = function(value) {
            jspb.Message.setProto3StringField(this, 2, value);
          };
          proto.stream.LoginReq.prototype.getDeviceid = function() {
            return jspb.Message.getFieldWithDefault(this, 3, "");
          };
          proto.stream.LoginReq.prototype.setDeviceid = function(value) {
            jspb.Message.setProto3StringField(this, 3, value);
          };
          proto.stream.LoginReq.prototype.getSign = function() {
            return jspb.Message.getFieldWithDefault(this, 4, "");
          };
          proto.stream.LoginReq.prototype.setSign = function(value) {
            jspb.Message.setProto3StringField(this, 4, value);
          };
          proto.stream.LoginReq.prototype.getSdkver = function() {
            return jspb.Message.getFieldWithDefault(this, 5, "");
          };
          proto.stream.LoginReq.prototype.setSdkver = function(value) {
            jspb.Message.setProto3StringField(this, 5, value);
          };
          proto.stream.LoginReq.prototype.getVendor = function() {
            return jspb.Message.getFieldWithDefault(this, 6, 0);
          };
          proto.stream.LoginReq.prototype.setVendor = function(value) {
            jspb.Message.setProto3IntField(this, 6, value);
          };
          proto.stream.LoginReq.prototype.getToken = function() {
            return jspb.Message.getFieldWithDefault(this, 7, "");
          };
          proto.stream.LoginReq.prototype.setToken = function(value) {
            jspb.Message.setProto3StringField(this, 7, value);
          };
          proto.stream.LoginRsp = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.LoginRsp, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.LoginRsp.displayName = "proto.stream.LoginRsp");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.LoginRsp.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.LoginRsp.toObject(opt_includeInstance, this);
            };
            proto.stream.LoginRsp.toObject = function(includeInstance, msg) {
              var f, obj = {
                status: jspb.Message.getFieldWithDefault(msg, 1, 0),
                roomid: jspb.Message.getFieldWithDefault(msg, 2, "0")
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.LoginRsp.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.LoginRsp();
            return proto.stream.LoginRsp.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.LoginRsp.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readEnum();
                msg.setStatus(value);
                break;

               case 2:
                var value = reader.readUint64String();
                msg.setRoomid(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.LoginRsp.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.LoginRsp.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.LoginRsp.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getStatus();
            0 !== f && writer.writeEnum(1, f);
            f = message.getRoomid();
            0 !== parseInt(f, 10) && writer.writeUint64String(2, f);
          };
          proto.stream.LoginRsp.prototype.getStatus = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.LoginRsp.prototype.setStatus = function(value) {
            jspb.Message.setProto3EnumField(this, 1, value);
          };
          proto.stream.LoginRsp.prototype.getRoomid = function() {
            return jspb.Message.getFieldWithDefault(this, 2, "0");
          };
          proto.stream.LoginRsp.prototype.setRoomid = function(value) {
            jspb.Message.setProto3StringIntField(this, 2, value);
          };
          proto.stream.HeartbeatReq = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.HeartbeatReq, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.HeartbeatReq.displayName = "proto.stream.HeartbeatReq");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.HeartbeatReq.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.HeartbeatReq.toObject(opt_includeInstance, this);
            };
            proto.stream.HeartbeatReq.toObject = function(includeInstance, msg) {
              var f, obj = {
                gameid: jspb.Message.getFieldWithDefault(msg, 1, 0),
                roomid: jspb.Message.getFieldWithDefault(msg, 2, "0")
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.HeartbeatReq.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.HeartbeatReq();
            return proto.stream.HeartbeatReq.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.HeartbeatReq.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint32();
                msg.setGameid(value);
                break;

               case 2:
                var value = reader.readUint64String();
                msg.setRoomid(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.HeartbeatReq.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.HeartbeatReq.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.HeartbeatReq.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getGameid();
            0 !== f && writer.writeUint32(1, f);
            f = message.getRoomid();
            0 !== parseInt(f, 10) && writer.writeUint64String(2, f);
          };
          proto.stream.HeartbeatReq.prototype.getGameid = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.HeartbeatReq.prototype.setGameid = function(value) {
            jspb.Message.setProto3IntField(this, 1, value);
          };
          proto.stream.HeartbeatReq.prototype.getRoomid = function() {
            return jspb.Message.getFieldWithDefault(this, 2, "0");
          };
          proto.stream.HeartbeatReq.prototype.setRoomid = function(value) {
            jspb.Message.setProto3StringIntField(this, 2, value);
          };
          proto.stream.HeartbeatRsp = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.HeartbeatRsp, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.HeartbeatRsp.displayName = "proto.stream.HeartbeatRsp");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.HeartbeatRsp.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.HeartbeatRsp.toObject(opt_includeInstance, this);
            };
            proto.stream.HeartbeatRsp.toObject = function(includeInstance, msg) {
              var f, obj = {
                gameid: jspb.Message.getFieldWithDefault(msg, 1, 0),
                gsexist: jspb.Message.getFieldWithDefault(msg, 2, 0)
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.HeartbeatRsp.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.HeartbeatRsp();
            return proto.stream.HeartbeatRsp.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.HeartbeatRsp.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint32();
                msg.setGameid(value);
                break;

               case 2:
                var value = reader.readInt32();
                msg.setGsexist(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.HeartbeatRsp.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.HeartbeatRsp.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.HeartbeatRsp.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getGameid();
            0 !== f && writer.writeUint32(1, f);
            f = message.getGsexist();
            0 !== f && writer.writeInt32(2, f);
          };
          proto.stream.HeartbeatRsp.prototype.getGameid = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.HeartbeatRsp.prototype.setGameid = function(value) {
            jspb.Message.setProto3IntField(this, 1, value);
          };
          proto.stream.HeartbeatRsp.prototype.getGsexist = function() {
            return jspb.Message.getFieldWithDefault(this, 2, 0);
          };
          proto.stream.HeartbeatRsp.prototype.setGsexist = function(value) {
            jspb.Message.setProto3IntField(this, 2, value);
          };
          proto.stream.DisconnectReq = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.DisconnectReq, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.DisconnectReq.displayName = "proto.stream.DisconnectReq");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.DisconnectReq.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.DisconnectReq.toObject(opt_includeInstance, this);
            };
            proto.stream.DisconnectReq.toObject = function(includeInstance, msg) {
              var f, obj = {
                userid: jspb.Message.getFieldWithDefault(msg, 1, 0),
                gameid: jspb.Message.getFieldWithDefault(msg, 2, 0),
                roomid: jspb.Message.getFieldWithDefault(msg, 3, "0")
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.DisconnectReq.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.DisconnectReq();
            return proto.stream.DisconnectReq.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.DisconnectReq.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint32();
                msg.setUserid(value);
                break;

               case 2:
                var value = reader.readUint32();
                msg.setGameid(value);
                break;

               case 3:
                var value = reader.readUint64String();
                msg.setRoomid(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.DisconnectReq.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.DisconnectReq.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.DisconnectReq.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getUserid();
            0 !== f && writer.writeUint32(1, f);
            f = message.getGameid();
            0 !== f && writer.writeUint32(2, f);
            f = message.getRoomid();
            0 !== parseInt(f, 10) && writer.writeUint64String(3, f);
          };
          proto.stream.DisconnectReq.prototype.getUserid = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.DisconnectReq.prototype.setUserid = function(value) {
            jspb.Message.setProto3IntField(this, 1, value);
          };
          proto.stream.DisconnectReq.prototype.getGameid = function() {
            return jspb.Message.getFieldWithDefault(this, 2, 0);
          };
          proto.stream.DisconnectReq.prototype.setGameid = function(value) {
            jspb.Message.setProto3IntField(this, 2, value);
          };
          proto.stream.DisconnectReq.prototype.getRoomid = function() {
            return jspb.Message.getFieldWithDefault(this, 3, "0");
          };
          proto.stream.DisconnectReq.prototype.setRoomid = function(value) {
            jspb.Message.setProto3StringIntField(this, 3, value);
          };
          proto.stream.DisconnectRsp = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.DisconnectRsp, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.DisconnectRsp.displayName = "proto.stream.DisconnectRsp");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.DisconnectRsp.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.DisconnectRsp.toObject(opt_includeInstance, this);
            };
            proto.stream.DisconnectRsp.toObject = function(includeInstance, msg) {
              var f, obj = {
                status: jspb.Message.getFieldWithDefault(msg, 1, 0)
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.DisconnectRsp.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.DisconnectRsp();
            return proto.stream.DisconnectRsp.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.DisconnectRsp.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readEnum();
                msg.setStatus(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.DisconnectRsp.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.DisconnectRsp.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.DisconnectRsp.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getStatus();
            0 !== f && writer.writeEnum(1, f);
          };
          proto.stream.DisconnectRsp.prototype.getStatus = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.DisconnectRsp.prototype.setStatus = function(value) {
            jspb.Message.setProto3EnumField(this, 1, value);
          };
          proto.stream.LogoutRsp = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.LogoutRsp, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.LogoutRsp.displayName = "proto.stream.LogoutRsp");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.LogoutRsp.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.LogoutRsp.toObject(opt_includeInstance, this);
            };
            proto.stream.LogoutRsp.toObject = function(includeInstance, msg) {
              var f, obj = {
                status: jspb.Message.getFieldWithDefault(msg, 1, 0)
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.LogoutRsp.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.LogoutRsp();
            return proto.stream.LogoutRsp.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.LogoutRsp.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readEnum();
                msg.setStatus(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.LogoutRsp.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.LogoutRsp.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.LogoutRsp.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getStatus();
            0 !== f && writer.writeEnum(1, f);
          };
          proto.stream.LogoutRsp.prototype.getStatus = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.LogoutRsp.prototype.setStatus = function(value) {
            jspb.Message.setProto3EnumField(this, 1, value);
          };
          proto.stream.keyValue = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.keyValue, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.keyValue.displayName = "proto.stream.keyValue");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.keyValue.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.keyValue.toObject(opt_includeInstance, this);
            };
            proto.stream.keyValue.toObject = function(includeInstance, msg) {
              var f, obj = {
                key: jspb.Message.getFieldWithDefault(msg, 1, ""),
                value: jspb.Message.getFieldWithDefault(msg, 2, "")
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.keyValue.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.keyValue();
            return proto.stream.keyValue.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.keyValue.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readString();
                msg.setKey(value);
                break;

               case 2:
                var value = reader.readString();
                msg.setValue(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.keyValue.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.keyValue.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.keyValue.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getKey();
            f.length > 0 && writer.writeString(1, f);
            f = message.getValue();
            f.length > 0 && writer.writeString(2, f);
          };
          proto.stream.keyValue.prototype.getKey = function() {
            return jspb.Message.getFieldWithDefault(this, 1, "");
          };
          proto.stream.keyValue.prototype.setKey = function(value) {
            jspb.Message.setProto3StringField(this, 1, value);
          };
          proto.stream.keyValue.prototype.getValue = function() {
            return jspb.Message.getFieldWithDefault(this, 2, "");
          };
          proto.stream.keyValue.prototype.setValue = function(value) {
            jspb.Message.setProto3StringField(this, 2, value);
          };
          proto.stream.PlayerInfo = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.PlayerInfo, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.PlayerInfo.displayName = "proto.stream.PlayerInfo");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.PlayerInfo.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.PlayerInfo.toObject(opt_includeInstance, this);
            };
            proto.stream.PlayerInfo.toObject = function(includeInstance, msg) {
              var f, obj = {
                userid: jspb.Message.getFieldWithDefault(msg, 1, 0),
                userprofile: msg.getUserprofile_asB64()
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.PlayerInfo.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.PlayerInfo();
            return proto.stream.PlayerInfo.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.PlayerInfo.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint32();
                msg.setUserid(value);
                break;

               case 2:
                var value = reader.readBytes();
                msg.setUserprofile(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.PlayerInfo.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.PlayerInfo.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.PlayerInfo.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getUserid();
            0 !== f && writer.writeUint32(1, f);
            f = message.getUserprofile_asU8();
            f.length > 0 && writer.writeBytes(2, f);
          };
          proto.stream.PlayerInfo.prototype.getUserid = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.PlayerInfo.prototype.setUserid = function(value) {
            jspb.Message.setProto3IntField(this, 1, value);
          };
          proto.stream.PlayerInfo.prototype.getUserprofile = function() {
            return jspb.Message.getFieldWithDefault(this, 2, "");
          };
          proto.stream.PlayerInfo.prototype.getUserprofile_asB64 = function() {
            return jspb.Message.bytesAsB64(this.getUserprofile());
          };
          proto.stream.PlayerInfo.prototype.getUserprofile_asU8 = function() {
            return jspb.Message.bytesAsU8(this.getUserprofile());
          };
          proto.stream.PlayerInfo.prototype.setUserprofile = function(value) {
            jspb.Message.setProto3BytesField(this, 2, value);
          };
          proto.stream.BookInfo = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.BookInfo, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.BookInfo.displayName = "proto.stream.BookInfo");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.BookInfo.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.BookInfo.toObject(opt_includeInstance, this);
            };
            proto.stream.BookInfo.toObject = function(includeInstance, msg) {
              var f, obj = {
                bookid: jspb.Message.getFieldWithDefault(msg, 1, ""),
                bookkey: jspb.Message.getFieldWithDefault(msg, 2, ""),
                hoteladdr: jspb.Message.getFieldWithDefault(msg, 3, ""),
                wssproxy: jspb.Message.getFieldWithDefault(msg, 4, "")
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.BookInfo.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.BookInfo();
            return proto.stream.BookInfo.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.BookInfo.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readString();
                msg.setBookid(value);
                break;

               case 2:
                var value = reader.readString();
                msg.setBookkey(value);
                break;

               case 3:
                var value = reader.readString();
                msg.setHoteladdr(value);
                break;

               case 4:
                var value = reader.readString();
                msg.setWssproxy(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.BookInfo.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.BookInfo.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.BookInfo.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getBookid();
            f.length > 0 && writer.writeString(1, f);
            f = message.getBookkey();
            f.length > 0 && writer.writeString(2, f);
            f = message.getHoteladdr();
            f.length > 0 && writer.writeString(3, f);
            f = message.getWssproxy();
            f.length > 0 && writer.writeString(4, f);
          };
          proto.stream.BookInfo.prototype.getBookid = function() {
            return jspb.Message.getFieldWithDefault(this, 1, "");
          };
          proto.stream.BookInfo.prototype.setBookid = function(value) {
            jspb.Message.setProto3StringField(this, 1, value);
          };
          proto.stream.BookInfo.prototype.getBookkey = function() {
            return jspb.Message.getFieldWithDefault(this, 2, "");
          };
          proto.stream.BookInfo.prototype.setBookkey = function(value) {
            jspb.Message.setProto3StringField(this, 2, value);
          };
          proto.stream.BookInfo.prototype.getHoteladdr = function() {
            return jspb.Message.getFieldWithDefault(this, 3, "");
          };
          proto.stream.BookInfo.prototype.setHoteladdr = function(value) {
            jspb.Message.setProto3StringField(this, 3, value);
          };
          proto.stream.BookInfo.prototype.getWssproxy = function() {
            return jspb.Message.getFieldWithDefault(this, 4, "");
          };
          proto.stream.BookInfo.prototype.setWssproxy = function(value) {
            jspb.Message.setProto3StringField(this, 4, value);
          };
          proto.stream.RoomInfo = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.RoomInfo, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.RoomInfo.displayName = "proto.stream.RoomInfo");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.RoomInfo.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.RoomInfo.toObject(opt_includeInstance, this);
            };
            proto.stream.RoomInfo.toObject = function(includeInstance, msg) {
              var f, obj = {
                roomid: jspb.Message.getFieldWithDefault(msg, 1, "0"),
                roomname: jspb.Message.getFieldWithDefault(msg, 2, ""),
                maxplayer: jspb.Message.getFieldWithDefault(msg, 3, 0),
                mode: jspb.Message.getFieldWithDefault(msg, 4, 0),
                canwatch: jspb.Message.getFieldWithDefault(msg, 5, 0),
                visibility: jspb.Message.getFieldWithDefault(msg, 6, 0),
                roomproperty: msg.getRoomproperty_asB64(),
                owner: jspb.Message.getFieldWithDefault(msg, 8, 0),
                state: jspb.Message.getFieldWithDefault(msg, 9, 0)
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.RoomInfo.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.RoomInfo();
            return proto.stream.RoomInfo.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.RoomInfo.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint64String();
                msg.setRoomid(value);
                break;

               case 2:
                var value = reader.readString();
                msg.setRoomname(value);
                break;

               case 3:
                var value = reader.readUint32();
                msg.setMaxplayer(value);
                break;

               case 4:
                var value = reader.readInt32();
                msg.setMode(value);
                break;

               case 5:
                var value = reader.readInt32();
                msg.setCanwatch(value);
                break;

               case 6:
                var value = reader.readInt32();
                msg.setVisibility(value);
                break;

               case 7:
                var value = reader.readBytes();
                msg.setRoomproperty(value);
                break;

               case 8:
                var value = reader.readUint32();
                msg.setOwner(value);
                break;

               case 9:
                var value = reader.readEnum();
                msg.setState(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.RoomInfo.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.RoomInfo.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.RoomInfo.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getRoomid();
            0 !== parseInt(f, 10) && writer.writeUint64String(1, f);
            f = message.getRoomname();
            f.length > 0 && writer.writeString(2, f);
            f = message.getMaxplayer();
            0 !== f && writer.writeUint32(3, f);
            f = message.getMode();
            0 !== f && writer.writeInt32(4, f);
            f = message.getCanwatch();
            0 !== f && writer.writeInt32(5, f);
            f = message.getVisibility();
            0 !== f && writer.writeInt32(6, f);
            f = message.getRoomproperty_asU8();
            f.length > 0 && writer.writeBytes(7, f);
            f = message.getOwner();
            0 !== f && writer.writeUint32(8, f);
            f = message.getState();
            0 !== f && writer.writeEnum(9, f);
          };
          proto.stream.RoomInfo.prototype.getRoomid = function() {
            return jspb.Message.getFieldWithDefault(this, 1, "0");
          };
          proto.stream.RoomInfo.prototype.setRoomid = function(value) {
            jspb.Message.setProto3StringIntField(this, 1, value);
          };
          proto.stream.RoomInfo.prototype.getRoomname = function() {
            return jspb.Message.getFieldWithDefault(this, 2, "");
          };
          proto.stream.RoomInfo.prototype.setRoomname = function(value) {
            jspb.Message.setProto3StringField(this, 2, value);
          };
          proto.stream.RoomInfo.prototype.getMaxplayer = function() {
            return jspb.Message.getFieldWithDefault(this, 3, 0);
          };
          proto.stream.RoomInfo.prototype.setMaxplayer = function(value) {
            jspb.Message.setProto3IntField(this, 3, value);
          };
          proto.stream.RoomInfo.prototype.getMode = function() {
            return jspb.Message.getFieldWithDefault(this, 4, 0);
          };
          proto.stream.RoomInfo.prototype.setMode = function(value) {
            jspb.Message.setProto3IntField(this, 4, value);
          };
          proto.stream.RoomInfo.prototype.getCanwatch = function() {
            return jspb.Message.getFieldWithDefault(this, 5, 0);
          };
          proto.stream.RoomInfo.prototype.setCanwatch = function(value) {
            jspb.Message.setProto3IntField(this, 5, value);
          };
          proto.stream.RoomInfo.prototype.getVisibility = function() {
            return jspb.Message.getFieldWithDefault(this, 6, 0);
          };
          proto.stream.RoomInfo.prototype.setVisibility = function(value) {
            jspb.Message.setProto3IntField(this, 6, value);
          };
          proto.stream.RoomInfo.prototype.getRoomproperty = function() {
            return jspb.Message.getFieldWithDefault(this, 7, "");
          };
          proto.stream.RoomInfo.prototype.getRoomproperty_asB64 = function() {
            return jspb.Message.bytesAsB64(this.getRoomproperty());
          };
          proto.stream.RoomInfo.prototype.getRoomproperty_asU8 = function() {
            return jspb.Message.bytesAsU8(this.getRoomproperty());
          };
          proto.stream.RoomInfo.prototype.setRoomproperty = function(value) {
            jspb.Message.setProto3BytesField(this, 7, value);
          };
          proto.stream.RoomInfo.prototype.getOwner = function() {
            return jspb.Message.getFieldWithDefault(this, 8, 0);
          };
          proto.stream.RoomInfo.prototype.setOwner = function(value) {
            jspb.Message.setProto3IntField(this, 8, value);
          };
          proto.stream.RoomInfo.prototype.getState = function() {
            return jspb.Message.getFieldWithDefault(this, 9, 0);
          };
          proto.stream.RoomInfo.prototype.setState = function(value) {
            jspb.Message.setProto3EnumField(this, 9, value);
          };
          proto.stream.JoinRoomReq = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, proto.stream.JoinRoomReq.repeatedFields_, null);
          };
          goog.inherits(proto.stream.JoinRoomReq, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.JoinRoomReq.displayName = "proto.stream.JoinRoomReq");
          proto.stream.JoinRoomReq.repeatedFields_ = [ 5 ];
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.JoinRoomReq.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.JoinRoomReq.toObject(opt_includeInstance, this);
            };
            proto.stream.JoinRoomReq.toObject = function(includeInstance, msg) {
              var f, obj = {
                jointype: jspb.Message.getFieldWithDefault(msg, 1, 0),
                playerinfo: (f = msg.getPlayerinfo()) && proto.stream.PlayerInfo.toObject(includeInstance, f),
                gameid: jspb.Message.getFieldWithDefault(msg, 3, 0),
                roominfo: (f = msg.getRoominfo()) && proto.stream.RoomInfo.toObject(includeInstance, f),
                tagsList: jspb.Message.toObjectList(msg.getTagsList(), proto.stream.keyValue.toObject, includeInstance),
                cpproto: msg.getCpproto_asB64()
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.JoinRoomReq.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.JoinRoomReq();
            return proto.stream.JoinRoomReq.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.JoinRoomReq.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readEnum();
                msg.setJointype(value);
                break;

               case 2:
                var value = new proto.stream.PlayerInfo();
                reader.readMessage(value, proto.stream.PlayerInfo.deserializeBinaryFromReader);
                msg.setPlayerinfo(value);
                break;

               case 3:
                var value = reader.readUint32();
                msg.setGameid(value);
                break;

               case 4:
                var value = new proto.stream.RoomInfo();
                reader.readMessage(value, proto.stream.RoomInfo.deserializeBinaryFromReader);
                msg.setRoominfo(value);
                break;

               case 5:
                var value = new proto.stream.keyValue();
                reader.readMessage(value, proto.stream.keyValue.deserializeBinaryFromReader);
                msg.addTags(value);
                break;

               case 6:
                var value = reader.readBytes();
                msg.setCpproto(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.JoinRoomReq.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.JoinRoomReq.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.JoinRoomReq.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getJointype();
            0 !== f && writer.writeEnum(1, f);
            f = message.getPlayerinfo();
            null != f && writer.writeMessage(2, f, proto.stream.PlayerInfo.serializeBinaryToWriter);
            f = message.getGameid();
            0 !== f && writer.writeUint32(3, f);
            f = message.getRoominfo();
            null != f && writer.writeMessage(4, f, proto.stream.RoomInfo.serializeBinaryToWriter);
            f = message.getTagsList();
            f.length > 0 && writer.writeRepeatedMessage(5, f, proto.stream.keyValue.serializeBinaryToWriter);
            f = message.getCpproto_asU8();
            f.length > 0 && writer.writeBytes(6, f);
          };
          proto.stream.JoinRoomReq.prototype.getJointype = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.JoinRoomReq.prototype.setJointype = function(value) {
            jspb.Message.setProto3EnumField(this, 1, value);
          };
          proto.stream.JoinRoomReq.prototype.getPlayerinfo = function() {
            return jspb.Message.getWrapperField(this, proto.stream.PlayerInfo, 2);
          };
          proto.stream.JoinRoomReq.prototype.setPlayerinfo = function(value) {
            jspb.Message.setWrapperField(this, 2, value);
          };
          proto.stream.JoinRoomReq.prototype.clearPlayerinfo = function() {
            this.setPlayerinfo(void 0);
          };
          proto.stream.JoinRoomReq.prototype.hasPlayerinfo = function() {
            return null != jspb.Message.getField(this, 2);
          };
          proto.stream.JoinRoomReq.prototype.getGameid = function() {
            return jspb.Message.getFieldWithDefault(this, 3, 0);
          };
          proto.stream.JoinRoomReq.prototype.setGameid = function(value) {
            jspb.Message.setProto3IntField(this, 3, value);
          };
          proto.stream.JoinRoomReq.prototype.getRoominfo = function() {
            return jspb.Message.getWrapperField(this, proto.stream.RoomInfo, 4);
          };
          proto.stream.JoinRoomReq.prototype.setRoominfo = function(value) {
            jspb.Message.setWrapperField(this, 4, value);
          };
          proto.stream.JoinRoomReq.prototype.clearRoominfo = function() {
            this.setRoominfo(void 0);
          };
          proto.stream.JoinRoomReq.prototype.hasRoominfo = function() {
            return null != jspb.Message.getField(this, 4);
          };
          proto.stream.JoinRoomReq.prototype.getTagsList = function() {
            return jspb.Message.getRepeatedWrapperField(this, proto.stream.keyValue, 5);
          };
          proto.stream.JoinRoomReq.prototype.setTagsList = function(value) {
            jspb.Message.setRepeatedWrapperField(this, 5, value);
          };
          proto.stream.JoinRoomReq.prototype.addTags = function(opt_value, opt_index) {
            return jspb.Message.addToRepeatedWrapperField(this, 5, opt_value, proto.stream.keyValue, opt_index);
          };
          proto.stream.JoinRoomReq.prototype.clearTagsList = function() {
            this.setTagsList([]);
          };
          proto.stream.JoinRoomReq.prototype.getCpproto = function() {
            return jspb.Message.getFieldWithDefault(this, 6, "");
          };
          proto.stream.JoinRoomReq.prototype.getCpproto_asB64 = function() {
            return jspb.Message.bytesAsB64(this.getCpproto());
          };
          proto.stream.JoinRoomReq.prototype.getCpproto_asU8 = function() {
            return jspb.Message.bytesAsU8(this.getCpproto());
          };
          proto.stream.JoinRoomReq.prototype.setCpproto = function(value) {
            jspb.Message.setProto3BytesField(this, 6, value);
          };
          proto.stream.JoinRoomRsp = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, proto.stream.JoinRoomRsp.repeatedFields_, null);
          };
          goog.inherits(proto.stream.JoinRoomRsp, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.JoinRoomRsp.displayName = "proto.stream.JoinRoomRsp");
          proto.stream.JoinRoomRsp.repeatedFields_ = [ 2 ];
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.JoinRoomRsp.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.JoinRoomRsp.toObject(opt_includeInstance, this);
            };
            proto.stream.JoinRoomRsp.toObject = function(includeInstance, msg) {
              var f, obj = {
                status: jspb.Message.getFieldWithDefault(msg, 1, 0),
                usersList: jspb.Message.toObjectList(msg.getUsersList(), proto.stream.PlayerInfo.toObject, includeInstance),
                roominfo: (f = msg.getRoominfo()) && proto.stream.RoomInfo.toObject(includeInstance, f),
                bookinfo: (f = msg.getBookinfo()) && proto.stream.BookInfo.toObject(includeInstance, f),
                cpproto: msg.getCpproto_asB64()
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.JoinRoomRsp.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.JoinRoomRsp();
            return proto.stream.JoinRoomRsp.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.JoinRoomRsp.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readEnum();
                msg.setStatus(value);
                break;

               case 2:
                var value = new proto.stream.PlayerInfo();
                reader.readMessage(value, proto.stream.PlayerInfo.deserializeBinaryFromReader);
                msg.addUsers(value);
                break;

               case 3:
                var value = new proto.stream.RoomInfo();
                reader.readMessage(value, proto.stream.RoomInfo.deserializeBinaryFromReader);
                msg.setRoominfo(value);
                break;

               case 4:
                var value = new proto.stream.BookInfo();
                reader.readMessage(value, proto.stream.BookInfo.deserializeBinaryFromReader);
                msg.setBookinfo(value);
                break;

               case 5:
                var value = reader.readBytes();
                msg.setCpproto(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.JoinRoomRsp.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.JoinRoomRsp.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.JoinRoomRsp.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getStatus();
            0 !== f && writer.writeEnum(1, f);
            f = message.getUsersList();
            f.length > 0 && writer.writeRepeatedMessage(2, f, proto.stream.PlayerInfo.serializeBinaryToWriter);
            f = message.getRoominfo();
            null != f && writer.writeMessage(3, f, proto.stream.RoomInfo.serializeBinaryToWriter);
            f = message.getBookinfo();
            null != f && writer.writeMessage(4, f, proto.stream.BookInfo.serializeBinaryToWriter);
            f = message.getCpproto_asU8();
            f.length > 0 && writer.writeBytes(5, f);
          };
          proto.stream.JoinRoomRsp.prototype.getStatus = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.JoinRoomRsp.prototype.setStatus = function(value) {
            jspb.Message.setProto3EnumField(this, 1, value);
          };
          proto.stream.JoinRoomRsp.prototype.getUsersList = function() {
            return jspb.Message.getRepeatedWrapperField(this, proto.stream.PlayerInfo, 2);
          };
          proto.stream.JoinRoomRsp.prototype.setUsersList = function(value) {
            jspb.Message.setRepeatedWrapperField(this, 2, value);
          };
          proto.stream.JoinRoomRsp.prototype.addUsers = function(opt_value, opt_index) {
            return jspb.Message.addToRepeatedWrapperField(this, 2, opt_value, proto.stream.PlayerInfo, opt_index);
          };
          proto.stream.JoinRoomRsp.prototype.clearUsersList = function() {
            this.setUsersList([]);
          };
          proto.stream.JoinRoomRsp.prototype.getRoominfo = function() {
            return jspb.Message.getWrapperField(this, proto.stream.RoomInfo, 3);
          };
          proto.stream.JoinRoomRsp.prototype.setRoominfo = function(value) {
            jspb.Message.setWrapperField(this, 3, value);
          };
          proto.stream.JoinRoomRsp.prototype.clearRoominfo = function() {
            this.setRoominfo(void 0);
          };
          proto.stream.JoinRoomRsp.prototype.hasRoominfo = function() {
            return null != jspb.Message.getField(this, 3);
          };
          proto.stream.JoinRoomRsp.prototype.getBookinfo = function() {
            return jspb.Message.getWrapperField(this, proto.stream.BookInfo, 4);
          };
          proto.stream.JoinRoomRsp.prototype.setBookinfo = function(value) {
            jspb.Message.setWrapperField(this, 4, value);
          };
          proto.stream.JoinRoomRsp.prototype.clearBookinfo = function() {
            this.setBookinfo(void 0);
          };
          proto.stream.JoinRoomRsp.prototype.hasBookinfo = function() {
            return null != jspb.Message.getField(this, 4);
          };
          proto.stream.JoinRoomRsp.prototype.getCpproto = function() {
            return jspb.Message.getFieldWithDefault(this, 5, "");
          };
          proto.stream.JoinRoomRsp.prototype.getCpproto_asB64 = function() {
            return jspb.Message.bytesAsB64(this.getCpproto());
          };
          proto.stream.JoinRoomRsp.prototype.getCpproto_asU8 = function() {
            return jspb.Message.bytesAsU8(this.getCpproto());
          };
          proto.stream.JoinRoomRsp.prototype.setCpproto = function(value) {
            jspb.Message.setProto3BytesField(this, 5, value);
          };
          proto.stream.NoticeJoin = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.NoticeJoin, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.NoticeJoin.displayName = "proto.stream.NoticeJoin");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.NoticeJoin.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.NoticeJoin.toObject(opt_includeInstance, this);
            };
            proto.stream.NoticeJoin.toObject = function(includeInstance, msg) {
              var f, obj = {
                user: (f = msg.getUser()) && proto.stream.PlayerInfo.toObject(includeInstance, f)
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.NoticeJoin.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.NoticeJoin();
            return proto.stream.NoticeJoin.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.NoticeJoin.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = new proto.stream.PlayerInfo();
                reader.readMessage(value, proto.stream.PlayerInfo.deserializeBinaryFromReader);
                msg.setUser(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.NoticeJoin.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.NoticeJoin.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.NoticeJoin.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getUser();
            null != f && writer.writeMessage(1, f, proto.stream.PlayerInfo.serializeBinaryToWriter);
          };
          proto.stream.NoticeJoin.prototype.getUser = function() {
            return jspb.Message.getWrapperField(this, proto.stream.PlayerInfo, 1);
          };
          proto.stream.NoticeJoin.prototype.setUser = function(value) {
            jspb.Message.setWrapperField(this, 1, value);
          };
          proto.stream.NoticeJoin.prototype.clearUser = function() {
            this.setUser(void 0);
          };
          proto.stream.NoticeJoin.prototype.hasUser = function() {
            return null != jspb.Message.getField(this, 1);
          };
          proto.stream.NoticeLeave = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.NoticeLeave, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.NoticeLeave.displayName = "proto.stream.NoticeLeave");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.NoticeLeave.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.NoticeLeave.toObject(opt_includeInstance, this);
            };
            proto.stream.NoticeLeave.toObject = function(includeInstance, msg) {
              var f, obj = {
                userid: jspb.Message.getFieldWithDefault(msg, 1, 0),
                roomid: jspb.Message.getFieldWithDefault(msg, 2, "0"),
                owner: jspb.Message.getFieldWithDefault(msg, 3, 0),
                cpproto: msg.getCpproto_asB64()
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.NoticeLeave.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.NoticeLeave();
            return proto.stream.NoticeLeave.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.NoticeLeave.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint32();
                msg.setUserid(value);
                break;

               case 2:
                var value = reader.readUint64String();
                msg.setRoomid(value);
                break;

               case 3:
                var value = reader.readUint32();
                msg.setOwner(value);
                break;

               case 4:
                var value = reader.readBytes();
                msg.setCpproto(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.NoticeLeave.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.NoticeLeave.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.NoticeLeave.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getUserid();
            0 !== f && writer.writeUint32(1, f);
            f = message.getRoomid();
            0 !== parseInt(f, 10) && writer.writeUint64String(2, f);
            f = message.getOwner();
            0 !== f && writer.writeUint32(3, f);
            f = message.getCpproto_asU8();
            f.length > 0 && writer.writeBytes(4, f);
          };
          proto.stream.NoticeLeave.prototype.getUserid = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.NoticeLeave.prototype.setUserid = function(value) {
            jspb.Message.setProto3IntField(this, 1, value);
          };
          proto.stream.NoticeLeave.prototype.getRoomid = function() {
            return jspb.Message.getFieldWithDefault(this, 2, "0");
          };
          proto.stream.NoticeLeave.prototype.setRoomid = function(value) {
            jspb.Message.setProto3StringIntField(this, 2, value);
          };
          proto.stream.NoticeLeave.prototype.getOwner = function() {
            return jspb.Message.getFieldWithDefault(this, 3, 0);
          };
          proto.stream.NoticeLeave.prototype.setOwner = function(value) {
            jspb.Message.setProto3IntField(this, 3, value);
          };
          proto.stream.NoticeLeave.prototype.getCpproto = function() {
            return jspb.Message.getFieldWithDefault(this, 4, "");
          };
          proto.stream.NoticeLeave.prototype.getCpproto_asB64 = function() {
            return jspb.Message.bytesAsB64(this.getCpproto());
          };
          proto.stream.NoticeLeave.prototype.getCpproto_asU8 = function() {
            return jspb.Message.bytesAsU8(this.getCpproto());
          };
          proto.stream.NoticeLeave.prototype.setCpproto = function(value) {
            jspb.Message.setProto3BytesField(this, 4, value);
          };
          proto.stream.JoinOverReq = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.JoinOverReq, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.JoinOverReq.displayName = "proto.stream.JoinOverReq");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.JoinOverReq.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.JoinOverReq.toObject(opt_includeInstance, this);
            };
            proto.stream.JoinOverReq.toObject = function(includeInstance, msg) {
              var f, obj = {
                roomid: jspb.Message.getFieldWithDefault(msg, 1, "0"),
                gameid: jspb.Message.getFieldWithDefault(msg, 2, 0),
                cpproto: msg.getCpproto_asB64(),
                userid: jspb.Message.getFieldWithDefault(msg, 4, 0)
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.JoinOverReq.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.JoinOverReq();
            return proto.stream.JoinOverReq.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.JoinOverReq.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint64String();
                msg.setRoomid(value);
                break;

               case 2:
                var value = reader.readUint32();
                msg.setGameid(value);
                break;

               case 3:
                var value = reader.readBytes();
                msg.setCpproto(value);
                break;

               case 4:
                var value = reader.readUint32();
                msg.setUserid(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.JoinOverReq.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.JoinOverReq.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.JoinOverReq.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getRoomid();
            0 !== parseInt(f, 10) && writer.writeUint64String(1, f);
            f = message.getGameid();
            0 !== f && writer.writeUint32(2, f);
            f = message.getCpproto_asU8();
            f.length > 0 && writer.writeBytes(3, f);
            f = message.getUserid();
            0 !== f && writer.writeUint32(4, f);
          };
          proto.stream.JoinOverReq.prototype.getRoomid = function() {
            return jspb.Message.getFieldWithDefault(this, 1, "0");
          };
          proto.stream.JoinOverReq.prototype.setRoomid = function(value) {
            jspb.Message.setProto3StringIntField(this, 1, value);
          };
          proto.stream.JoinOverReq.prototype.getGameid = function() {
            return jspb.Message.getFieldWithDefault(this, 2, 0);
          };
          proto.stream.JoinOverReq.prototype.setGameid = function(value) {
            jspb.Message.setProto3IntField(this, 2, value);
          };
          proto.stream.JoinOverReq.prototype.getCpproto = function() {
            return jspb.Message.getFieldWithDefault(this, 3, "");
          };
          proto.stream.JoinOverReq.prototype.getCpproto_asB64 = function() {
            return jspb.Message.bytesAsB64(this.getCpproto());
          };
          proto.stream.JoinOverReq.prototype.getCpproto_asU8 = function() {
            return jspb.Message.bytesAsU8(this.getCpproto());
          };
          proto.stream.JoinOverReq.prototype.setCpproto = function(value) {
            jspb.Message.setProto3BytesField(this, 3, value);
          };
          proto.stream.JoinOverReq.prototype.getUserid = function() {
            return jspb.Message.getFieldWithDefault(this, 4, 0);
          };
          proto.stream.JoinOverReq.prototype.setUserid = function(value) {
            jspb.Message.setProto3IntField(this, 4, value);
          };
          proto.stream.JoinOverRsp = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.JoinOverRsp, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.JoinOverRsp.displayName = "proto.stream.JoinOverRsp");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.JoinOverRsp.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.JoinOverRsp.toObject(opt_includeInstance, this);
            };
            proto.stream.JoinOverRsp.toObject = function(includeInstance, msg) {
              var f, obj = {
                status: jspb.Message.getFieldWithDefault(msg, 1, 0),
                cpproto: msg.getCpproto_asB64()
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.JoinOverRsp.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.JoinOverRsp();
            return proto.stream.JoinOverRsp.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.JoinOverRsp.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readEnum();
                msg.setStatus(value);
                break;

               case 2:
                var value = reader.readBytes();
                msg.setCpproto(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.JoinOverRsp.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.JoinOverRsp.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.JoinOverRsp.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getStatus();
            0 !== f && writer.writeEnum(1, f);
            f = message.getCpproto_asU8();
            f.length > 0 && writer.writeBytes(2, f);
          };
          proto.stream.JoinOverRsp.prototype.getStatus = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.JoinOverRsp.prototype.setStatus = function(value) {
            jspb.Message.setProto3EnumField(this, 1, value);
          };
          proto.stream.JoinOverRsp.prototype.getCpproto = function() {
            return jspb.Message.getFieldWithDefault(this, 2, "");
          };
          proto.stream.JoinOverRsp.prototype.getCpproto_asB64 = function() {
            return jspb.Message.bytesAsB64(this.getCpproto());
          };
          proto.stream.JoinOverRsp.prototype.getCpproto_asU8 = function() {
            return jspb.Message.bytesAsU8(this.getCpproto());
          };
          proto.stream.JoinOverRsp.prototype.setCpproto = function(value) {
            jspb.Message.setProto3BytesField(this, 2, value);
          };
          proto.stream.JoinOverNotify = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.JoinOverNotify, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.JoinOverNotify.displayName = "proto.stream.JoinOverNotify");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.JoinOverNotify.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.JoinOverNotify.toObject(opt_includeInstance, this);
            };
            proto.stream.JoinOverNotify.toObject = function(includeInstance, msg) {
              var f, obj = {
                srcuserid: jspb.Message.getFieldWithDefault(msg, 1, 0),
                roomid: jspb.Message.getFieldWithDefault(msg, 2, "0"),
                cpproto: msg.getCpproto_asB64()
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.JoinOverNotify.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.JoinOverNotify();
            return proto.stream.JoinOverNotify.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.JoinOverNotify.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint32();
                msg.setSrcuserid(value);
                break;

               case 2:
                var value = reader.readUint64String();
                msg.setRoomid(value);
                break;

               case 3:
                var value = reader.readBytes();
                msg.setCpproto(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.JoinOverNotify.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.JoinOverNotify.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.JoinOverNotify.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getSrcuserid();
            0 !== f && writer.writeUint32(1, f);
            f = message.getRoomid();
            0 !== parseInt(f, 10) && writer.writeUint64String(2, f);
            f = message.getCpproto_asU8();
            f.length > 0 && writer.writeBytes(3, f);
          };
          proto.stream.JoinOverNotify.prototype.getSrcuserid = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.JoinOverNotify.prototype.setSrcuserid = function(value) {
            jspb.Message.setProto3IntField(this, 1, value);
          };
          proto.stream.JoinOverNotify.prototype.getRoomid = function() {
            return jspb.Message.getFieldWithDefault(this, 2, "0");
          };
          proto.stream.JoinOverNotify.prototype.setRoomid = function(value) {
            jspb.Message.setProto3StringIntField(this, 2, value);
          };
          proto.stream.JoinOverNotify.prototype.getCpproto = function() {
            return jspb.Message.getFieldWithDefault(this, 3, "");
          };
          proto.stream.JoinOverNotify.prototype.getCpproto_asB64 = function() {
            return jspb.Message.bytesAsB64(this.getCpproto());
          };
          proto.stream.JoinOverNotify.prototype.getCpproto_asU8 = function() {
            return jspb.Message.bytesAsU8(this.getCpproto());
          };
          proto.stream.JoinOverNotify.prototype.setCpproto = function(value) {
            jspb.Message.setProto3BytesField(this, 3, value);
          };
          proto.stream.JoinOpenReq = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.JoinOpenReq, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.JoinOpenReq.displayName = "proto.stream.JoinOpenReq");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.JoinOpenReq.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.JoinOpenReq.toObject(opt_includeInstance, this);
            };
            proto.stream.JoinOpenReq.toObject = function(includeInstance, msg) {
              var f, obj = {
                roomid: jspb.Message.getFieldWithDefault(msg, 1, "0"),
                gameid: jspb.Message.getFieldWithDefault(msg, 2, 0),
                userid: jspb.Message.getFieldWithDefault(msg, 3, 0),
                cpproto: msg.getCpproto_asB64()
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.JoinOpenReq.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.JoinOpenReq();
            return proto.stream.JoinOpenReq.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.JoinOpenReq.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint64String();
                msg.setRoomid(value);
                break;

               case 2:
                var value = reader.readUint32();
                msg.setGameid(value);
                break;

               case 3:
                var value = reader.readUint32();
                msg.setUserid(value);
                break;

               case 4:
                var value = reader.readBytes();
                msg.setCpproto(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.JoinOpenReq.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.JoinOpenReq.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.JoinOpenReq.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getRoomid();
            0 !== parseInt(f, 10) && writer.writeUint64String(1, f);
            f = message.getGameid();
            0 !== f && writer.writeUint32(2, f);
            f = message.getUserid();
            0 !== f && writer.writeUint32(3, f);
            f = message.getCpproto_asU8();
            f.length > 0 && writer.writeBytes(4, f);
          };
          proto.stream.JoinOpenReq.prototype.getRoomid = function() {
            return jspb.Message.getFieldWithDefault(this, 1, "0");
          };
          proto.stream.JoinOpenReq.prototype.setRoomid = function(value) {
            jspb.Message.setProto3StringIntField(this, 1, value);
          };
          proto.stream.JoinOpenReq.prototype.getGameid = function() {
            return jspb.Message.getFieldWithDefault(this, 2, 0);
          };
          proto.stream.JoinOpenReq.prototype.setGameid = function(value) {
            jspb.Message.setProto3IntField(this, 2, value);
          };
          proto.stream.JoinOpenReq.prototype.getUserid = function() {
            return jspb.Message.getFieldWithDefault(this, 3, 0);
          };
          proto.stream.JoinOpenReq.prototype.setUserid = function(value) {
            jspb.Message.setProto3IntField(this, 3, value);
          };
          proto.stream.JoinOpenReq.prototype.getCpproto = function() {
            return jspb.Message.getFieldWithDefault(this, 4, "");
          };
          proto.stream.JoinOpenReq.prototype.getCpproto_asB64 = function() {
            return jspb.Message.bytesAsB64(this.getCpproto());
          };
          proto.stream.JoinOpenReq.prototype.getCpproto_asU8 = function() {
            return jspb.Message.bytesAsU8(this.getCpproto());
          };
          proto.stream.JoinOpenReq.prototype.setCpproto = function(value) {
            jspb.Message.setProto3BytesField(this, 4, value);
          };
          proto.stream.JoinOpenRsp = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.JoinOpenRsp, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.JoinOpenRsp.displayName = "proto.stream.JoinOpenRsp");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.JoinOpenRsp.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.JoinOpenRsp.toObject(opt_includeInstance, this);
            };
            proto.stream.JoinOpenRsp.toObject = function(includeInstance, msg) {
              var f, obj = {
                status: jspb.Message.getFieldWithDefault(msg, 1, 0),
                cpproto: msg.getCpproto_asB64()
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.JoinOpenRsp.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.JoinOpenRsp();
            return proto.stream.JoinOpenRsp.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.JoinOpenRsp.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readEnum();
                msg.setStatus(value);
                break;

               case 2:
                var value = reader.readBytes();
                msg.setCpproto(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.JoinOpenRsp.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.JoinOpenRsp.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.JoinOpenRsp.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getStatus();
            0 !== f && writer.writeEnum(1, f);
            f = message.getCpproto_asU8();
            f.length > 0 && writer.writeBytes(2, f);
          };
          proto.stream.JoinOpenRsp.prototype.getStatus = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.JoinOpenRsp.prototype.setStatus = function(value) {
            jspb.Message.setProto3EnumField(this, 1, value);
          };
          proto.stream.JoinOpenRsp.prototype.getCpproto = function() {
            return jspb.Message.getFieldWithDefault(this, 2, "");
          };
          proto.stream.JoinOpenRsp.prototype.getCpproto_asB64 = function() {
            return jspb.Message.bytesAsB64(this.getCpproto());
          };
          proto.stream.JoinOpenRsp.prototype.getCpproto_asU8 = function() {
            return jspb.Message.bytesAsU8(this.getCpproto());
          };
          proto.stream.JoinOpenRsp.prototype.setCpproto = function(value) {
            jspb.Message.setProto3BytesField(this, 2, value);
          };
          proto.stream.JoinOpenNotify = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.JoinOpenNotify, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.JoinOpenNotify.displayName = "proto.stream.JoinOpenNotify");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.JoinOpenNotify.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.JoinOpenNotify.toObject(opt_includeInstance, this);
            };
            proto.stream.JoinOpenNotify.toObject = function(includeInstance, msg) {
              var f, obj = {
                userid: jspb.Message.getFieldWithDefault(msg, 1, 0),
                roomid: jspb.Message.getFieldWithDefault(msg, 2, "0"),
                cpproto: msg.getCpproto_asB64()
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.JoinOpenNotify.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.JoinOpenNotify();
            return proto.stream.JoinOpenNotify.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.JoinOpenNotify.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint32();
                msg.setUserid(value);
                break;

               case 2:
                var value = reader.readUint64String();
                msg.setRoomid(value);
                break;

               case 3:
                var value = reader.readBytes();
                msg.setCpproto(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.JoinOpenNotify.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.JoinOpenNotify.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.JoinOpenNotify.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getUserid();
            0 !== f && writer.writeUint32(1, f);
            f = message.getRoomid();
            0 !== parseInt(f, 10) && writer.writeUint64String(2, f);
            f = message.getCpproto_asU8();
            f.length > 0 && writer.writeBytes(3, f);
          };
          proto.stream.JoinOpenNotify.prototype.getUserid = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.JoinOpenNotify.prototype.setUserid = function(value) {
            jspb.Message.setProto3IntField(this, 1, value);
          };
          proto.stream.JoinOpenNotify.prototype.getRoomid = function() {
            return jspb.Message.getFieldWithDefault(this, 2, "0");
          };
          proto.stream.JoinOpenNotify.prototype.setRoomid = function(value) {
            jspb.Message.setProto3StringIntField(this, 2, value);
          };
          proto.stream.JoinOpenNotify.prototype.getCpproto = function() {
            return jspb.Message.getFieldWithDefault(this, 3, "");
          };
          proto.stream.JoinOpenNotify.prototype.getCpproto_asB64 = function() {
            return jspb.Message.bytesAsB64(this.getCpproto());
          };
          proto.stream.JoinOpenNotify.prototype.getCpproto_asU8 = function() {
            return jspb.Message.bytesAsU8(this.getCpproto());
          };
          proto.stream.JoinOpenNotify.prototype.setCpproto = function(value) {
            jspb.Message.setProto3BytesField(this, 3, value);
          };
          proto.stream.LeaveRoomReq = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.LeaveRoomReq, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.LeaveRoomReq.displayName = "proto.stream.LeaveRoomReq");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.LeaveRoomReq.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.LeaveRoomReq.toObject(opt_includeInstance, this);
            };
            proto.stream.LeaveRoomReq.toObject = function(includeInstance, msg) {
              var f, obj = {
                userid: jspb.Message.getFieldWithDefault(msg, 1, 0),
                gameid: jspb.Message.getFieldWithDefault(msg, 2, 0),
                roomid: jspb.Message.getFieldWithDefault(msg, 3, "0"),
                cpproto: msg.getCpproto_asB64()
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.LeaveRoomReq.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.LeaveRoomReq();
            return proto.stream.LeaveRoomReq.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.LeaveRoomReq.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint32();
                msg.setUserid(value);
                break;

               case 2:
                var value = reader.readUint32();
                msg.setGameid(value);
                break;

               case 3:
                var value = reader.readUint64String();
                msg.setRoomid(value);
                break;

               case 4:
                var value = reader.readBytes();
                msg.setCpproto(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.LeaveRoomReq.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.LeaveRoomReq.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.LeaveRoomReq.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getUserid();
            0 !== f && writer.writeUint32(1, f);
            f = message.getGameid();
            0 !== f && writer.writeUint32(2, f);
            f = message.getRoomid();
            0 !== parseInt(f, 10) && writer.writeUint64String(3, f);
            f = message.getCpproto_asU8();
            f.length > 0 && writer.writeBytes(4, f);
          };
          proto.stream.LeaveRoomReq.prototype.getUserid = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.LeaveRoomReq.prototype.setUserid = function(value) {
            jspb.Message.setProto3IntField(this, 1, value);
          };
          proto.stream.LeaveRoomReq.prototype.getGameid = function() {
            return jspb.Message.getFieldWithDefault(this, 2, 0);
          };
          proto.stream.LeaveRoomReq.prototype.setGameid = function(value) {
            jspb.Message.setProto3IntField(this, 2, value);
          };
          proto.stream.LeaveRoomReq.prototype.getRoomid = function() {
            return jspb.Message.getFieldWithDefault(this, 3, "0");
          };
          proto.stream.LeaveRoomReq.prototype.setRoomid = function(value) {
            jspb.Message.setProto3StringIntField(this, 3, value);
          };
          proto.stream.LeaveRoomReq.prototype.getCpproto = function() {
            return jspb.Message.getFieldWithDefault(this, 4, "");
          };
          proto.stream.LeaveRoomReq.prototype.getCpproto_asB64 = function() {
            return jspb.Message.bytesAsB64(this.getCpproto());
          };
          proto.stream.LeaveRoomReq.prototype.getCpproto_asU8 = function() {
            return jspb.Message.bytesAsU8(this.getCpproto());
          };
          proto.stream.LeaveRoomReq.prototype.setCpproto = function(value) {
            jspb.Message.setProto3BytesField(this, 4, value);
          };
          proto.stream.LeaveRoomRsp = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.LeaveRoomRsp, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.LeaveRoomRsp.displayName = "proto.stream.LeaveRoomRsp");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.LeaveRoomRsp.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.LeaveRoomRsp.toObject(opt_includeInstance, this);
            };
            proto.stream.LeaveRoomRsp.toObject = function(includeInstance, msg) {
              var f, obj = {
                status: jspb.Message.getFieldWithDefault(msg, 1, 0),
                roomid: jspb.Message.getFieldWithDefault(msg, 2, "0"),
                userid: jspb.Message.getFieldWithDefault(msg, 3, 0),
                cpproto: msg.getCpproto_asB64()
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.LeaveRoomRsp.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.LeaveRoomRsp();
            return proto.stream.LeaveRoomRsp.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.LeaveRoomRsp.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readEnum();
                msg.setStatus(value);
                break;

               case 2:
                var value = reader.readUint64String();
                msg.setRoomid(value);
                break;

               case 3:
                var value = reader.readUint32();
                msg.setUserid(value);
                break;

               case 4:
                var value = reader.readBytes();
                msg.setCpproto(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.LeaveRoomRsp.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.LeaveRoomRsp.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.LeaveRoomRsp.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getStatus();
            0 !== f && writer.writeEnum(1, f);
            f = message.getRoomid();
            0 !== parseInt(f, 10) && writer.writeUint64String(2, f);
            f = message.getUserid();
            0 !== f && writer.writeUint32(3, f);
            f = message.getCpproto_asU8();
            f.length > 0 && writer.writeBytes(4, f);
          };
          proto.stream.LeaveRoomRsp.prototype.getStatus = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.LeaveRoomRsp.prototype.setStatus = function(value) {
            jspb.Message.setProto3EnumField(this, 1, value);
          };
          proto.stream.LeaveRoomRsp.prototype.getRoomid = function() {
            return jspb.Message.getFieldWithDefault(this, 2, "0");
          };
          proto.stream.LeaveRoomRsp.prototype.setRoomid = function(value) {
            jspb.Message.setProto3StringIntField(this, 2, value);
          };
          proto.stream.LeaveRoomRsp.prototype.getUserid = function() {
            return jspb.Message.getFieldWithDefault(this, 3, 0);
          };
          proto.stream.LeaveRoomRsp.prototype.setUserid = function(value) {
            jspb.Message.setProto3IntField(this, 3, value);
          };
          proto.stream.LeaveRoomRsp.prototype.getCpproto = function() {
            return jspb.Message.getFieldWithDefault(this, 4, "");
          };
          proto.stream.LeaveRoomRsp.prototype.getCpproto_asB64 = function() {
            return jspb.Message.bytesAsB64(this.getCpproto());
          };
          proto.stream.LeaveRoomRsp.prototype.getCpproto_asU8 = function() {
            return jspb.Message.bytesAsU8(this.getCpproto());
          };
          proto.stream.LeaveRoomRsp.prototype.setCpproto = function(value) {
            jspb.Message.setProto3BytesField(this, 4, value);
          };
          proto.stream.TcpProtoHeader = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.TcpProtoHeader, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.TcpProtoHeader.displayName = "proto.stream.TcpProtoHeader");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.TcpProtoHeader.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.TcpProtoHeader.toObject(opt_includeInstance, this);
            };
            proto.stream.TcpProtoHeader.toObject = function(includeInstance, msg) {
              var f, obj = {
                size: jspb.Message.getFieldWithDefault(msg, 1, 0),
                seq: jspb.Message.getFieldWithDefault(msg, 2, 0),
                cmd: jspb.Message.getFieldWithDefault(msg, 3, 0),
                version: jspb.Message.getFieldWithDefault(msg, 4, 0),
                userid: jspb.Message.getFieldWithDefault(msg, 5, 0)
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.TcpProtoHeader.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.TcpProtoHeader();
            return proto.stream.TcpProtoHeader.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.TcpProtoHeader.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint32();
                msg.setSize(value);
                break;

               case 2:
                var value = reader.readUint32();
                msg.setSeq(value);
                break;

               case 3:
                var value = reader.readUint32();
                msg.setCmd(value);
                break;

               case 4:
                var value = reader.readUint32();
                msg.setVersion(value);
                break;

               case 5:
                var value = reader.readUint32();
                msg.setUserid(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.TcpProtoHeader.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.TcpProtoHeader.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.TcpProtoHeader.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getSize();
            0 !== f && writer.writeUint32(1, f);
            f = message.getSeq();
            0 !== f && writer.writeUint32(2, f);
            f = message.getCmd();
            0 !== f && writer.writeUint32(3, f);
            f = message.getVersion();
            0 !== f && writer.writeUint32(4, f);
            f = message.getUserid();
            0 !== f && writer.writeUint32(5, f);
          };
          proto.stream.TcpProtoHeader.prototype.getSize = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.TcpProtoHeader.prototype.setSize = function(value) {
            jspb.Message.setProto3IntField(this, 1, value);
          };
          proto.stream.TcpProtoHeader.prototype.getSeq = function() {
            return jspb.Message.getFieldWithDefault(this, 2, 0);
          };
          proto.stream.TcpProtoHeader.prototype.setSeq = function(value) {
            jspb.Message.setProto3IntField(this, 2, value);
          };
          proto.stream.TcpProtoHeader.prototype.getCmd = function() {
            return jspb.Message.getFieldWithDefault(this, 3, 0);
          };
          proto.stream.TcpProtoHeader.prototype.setCmd = function(value) {
            jspb.Message.setProto3IntField(this, 3, value);
          };
          proto.stream.TcpProtoHeader.prototype.getVersion = function() {
            return jspb.Message.getFieldWithDefault(this, 4, 0);
          };
          proto.stream.TcpProtoHeader.prototype.setVersion = function(value) {
            jspb.Message.setProto3IntField(this, 4, value);
          };
          proto.stream.TcpProtoHeader.prototype.getUserid = function() {
            return jspb.Message.getFieldWithDefault(this, 5, 0);
          };
          proto.stream.TcpProtoHeader.prototype.setUserid = function(value) {
            jspb.Message.setProto3IntField(this, 5, value);
          };
          proto.stream.ConnDetailV2 = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.ConnDetailV2, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.ConnDetailV2.displayName = "proto.stream.ConnDetailV2");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.ConnDetailV2.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.ConnDetailV2.toObject(opt_includeInstance, this);
            };
            proto.stream.ConnDetailV2.toObject = function(includeInstance, msg) {
              var f, obj = {
                userid: jspb.Message.getFieldWithDefault(msg, 1, 0),
                gameid: jspb.Message.getFieldWithDefault(msg, 2, 0),
                fieldid: jspb.Message.getFieldWithDefault(msg, 3, 0),
                roomid: jspb.Message.getFieldWithDefault(msg, 4, "0"),
                heartbeattime: jspb.Message.getFieldWithDefault(msg, 5, "0"),
                version: jspb.Message.getFieldWithDefault(msg, 6, 0)
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.ConnDetailV2.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.ConnDetailV2();
            return proto.stream.ConnDetailV2.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.ConnDetailV2.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint32();
                msg.setUserid(value);
                break;

               case 2:
                var value = reader.readUint32();
                msg.setGameid(value);
                break;

               case 3:
                var value = reader.readUint32();
                msg.setFieldid(value);
                break;

               case 4:
                var value = reader.readUint64String();
                msg.setRoomid(value);
                break;

               case 5:
                var value = reader.readUint64String();
                msg.setHeartbeattime(value);
                break;

               case 6:
                var value = reader.readUint32();
                msg.setVersion(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.ConnDetailV2.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.ConnDetailV2.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.ConnDetailV2.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getUserid();
            0 !== f && writer.writeUint32(1, f);
            f = message.getGameid();
            0 !== f && writer.writeUint32(2, f);
            f = message.getFieldid();
            0 !== f && writer.writeUint32(3, f);
            f = message.getRoomid();
            0 !== parseInt(f, 10) && writer.writeUint64String(4, f);
            f = message.getHeartbeattime();
            0 !== parseInt(f, 10) && writer.writeUint64String(5, f);
            f = message.getVersion();
            0 !== f && writer.writeUint32(6, f);
          };
          proto.stream.ConnDetailV2.prototype.getUserid = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.ConnDetailV2.prototype.setUserid = function(value) {
            jspb.Message.setProto3IntField(this, 1, value);
          };
          proto.stream.ConnDetailV2.prototype.getGameid = function() {
            return jspb.Message.getFieldWithDefault(this, 2, 0);
          };
          proto.stream.ConnDetailV2.prototype.setGameid = function(value) {
            jspb.Message.setProto3IntField(this, 2, value);
          };
          proto.stream.ConnDetailV2.prototype.getFieldid = function() {
            return jspb.Message.getFieldWithDefault(this, 3, 0);
          };
          proto.stream.ConnDetailV2.prototype.setFieldid = function(value) {
            jspb.Message.setProto3IntField(this, 3, value);
          };
          proto.stream.ConnDetailV2.prototype.getRoomid = function() {
            return jspb.Message.getFieldWithDefault(this, 4, "0");
          };
          proto.stream.ConnDetailV2.prototype.setRoomid = function(value) {
            jspb.Message.setProto3StringIntField(this, 4, value);
          };
          proto.stream.ConnDetailV2.prototype.getHeartbeattime = function() {
            return jspb.Message.getFieldWithDefault(this, 5, "0");
          };
          proto.stream.ConnDetailV2.prototype.setHeartbeattime = function(value) {
            jspb.Message.setProto3StringIntField(this, 5, value);
          };
          proto.stream.ConnDetailV2.prototype.getVersion = function() {
            return jspb.Message.getFieldWithDefault(this, 6, 0);
          };
          proto.stream.ConnDetailV2.prototype.setVersion = function(value) {
            jspb.Message.setProto3IntField(this, 6, value);
          };
          proto.stream.UserV2 = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.UserV2, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.UserV2.displayName = "proto.stream.UserV2");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.UserV2.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.UserV2.toObject(opt_includeInstance, this);
            };
            proto.stream.UserV2.toObject = function(includeInstance, msg) {
              var f, obj = {
                userId: jspb.Message.getFieldWithDefault(msg, 1, 0),
                gameId: jspb.Message.getFieldWithDefault(msg, 2, 0),
                versionSdk: jspb.Message.getFieldWithDefault(msg, 3, 0),
                connectionId: jspb.Message.getFieldWithDefault(msg, 4, "0"),
                serviceId: jspb.Message.getFieldWithDefault(msg, 5, 0),
                roomId: jspb.Message.getFieldWithDefault(msg, 6, "0"),
                deviceId: jspb.Message.getFieldWithDefault(msg, 7, ""),
                connStatus: jspb.Message.getFieldWithDefault(msg, 8, 0)
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.UserV2.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.UserV2();
            return proto.stream.UserV2.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.UserV2.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint32();
                msg.setUserId(value);
                break;

               case 2:
                var value = reader.readUint32();
                msg.setGameId(value);
                break;

               case 3:
                var value = reader.readUint32();
                msg.setVersionSdk(value);
                break;

               case 4:
                var value = reader.readUint64String();
                msg.setConnectionId(value);
                break;

               case 5:
                var value = reader.readUint32();
                msg.setServiceId(value);
                break;

               case 6:
                var value = reader.readUint64String();
                msg.setRoomId(value);
                break;

               case 7:
                var value = reader.readString();
                msg.setDeviceId(value);
                break;

               case 8:
                var value = reader.readUint32();
                msg.setConnStatus(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.UserV2.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.UserV2.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.UserV2.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getUserId();
            0 !== f && writer.writeUint32(1, f);
            f = message.getGameId();
            0 !== f && writer.writeUint32(2, f);
            f = message.getVersionSdk();
            0 !== f && writer.writeUint32(3, f);
            f = message.getConnectionId();
            0 !== parseInt(f, 10) && writer.writeUint64String(4, f);
            f = message.getServiceId();
            0 !== f && writer.writeUint32(5, f);
            f = message.getRoomId();
            0 !== parseInt(f, 10) && writer.writeUint64String(6, f);
            f = message.getDeviceId();
            f.length > 0 && writer.writeString(7, f);
            f = message.getConnStatus();
            0 !== f && writer.writeUint32(8, f);
          };
          proto.stream.UserV2.prototype.getUserId = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.UserV2.prototype.setUserId = function(value) {
            jspb.Message.setProto3IntField(this, 1, value);
          };
          proto.stream.UserV2.prototype.getGameId = function() {
            return jspb.Message.getFieldWithDefault(this, 2, 0);
          };
          proto.stream.UserV2.prototype.setGameId = function(value) {
            jspb.Message.setProto3IntField(this, 2, value);
          };
          proto.stream.UserV2.prototype.getVersionSdk = function() {
            return jspb.Message.getFieldWithDefault(this, 3, 0);
          };
          proto.stream.UserV2.prototype.setVersionSdk = function(value) {
            jspb.Message.setProto3IntField(this, 3, value);
          };
          proto.stream.UserV2.prototype.getConnectionId = function() {
            return jspb.Message.getFieldWithDefault(this, 4, "0");
          };
          proto.stream.UserV2.prototype.setConnectionId = function(value) {
            jspb.Message.setProto3StringIntField(this, 4, value);
          };
          proto.stream.UserV2.prototype.getServiceId = function() {
            return jspb.Message.getFieldWithDefault(this, 5, 0);
          };
          proto.stream.UserV2.prototype.setServiceId = function(value) {
            jspb.Message.setProto3IntField(this, 5, value);
          };
          proto.stream.UserV2.prototype.getRoomId = function() {
            return jspb.Message.getFieldWithDefault(this, 6, "0");
          };
          proto.stream.UserV2.prototype.setRoomId = function(value) {
            jspb.Message.setProto3StringIntField(this, 6, value);
          };
          proto.stream.UserV2.prototype.getDeviceId = function() {
            return jspb.Message.getFieldWithDefault(this, 7, "");
          };
          proto.stream.UserV2.prototype.setDeviceId = function(value) {
            jspb.Message.setProto3StringField(this, 7, value);
          };
          proto.stream.UserV2.prototype.getConnStatus = function() {
            return jspb.Message.getFieldWithDefault(this, 8, 0);
          };
          proto.stream.UserV2.prototype.setConnStatus = function(value) {
            jspb.Message.setProto3IntField(this, 8, value);
          };
          proto.stream.NetworkStateReq = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.NetworkStateReq, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.NetworkStateReq.displayName = "proto.stream.NetworkStateReq");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.NetworkStateReq.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.NetworkStateReq.toObject(opt_includeInstance, this);
            };
            proto.stream.NetworkStateReq.toObject = function(includeInstance, msg) {
              var f, obj = {
                gameid: jspb.Message.getFieldWithDefault(msg, 1, 0),
                roomid: jspb.Message.getFieldWithDefault(msg, 2, "0"),
                userid: jspb.Message.getFieldWithDefault(msg, 3, 0),
                state: jspb.Message.getFieldWithDefault(msg, 4, 0)
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.NetworkStateReq.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.NetworkStateReq();
            return proto.stream.NetworkStateReq.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.NetworkStateReq.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint32();
                msg.setGameid(value);
                break;

               case 2:
                var value = reader.readUint64String();
                msg.setRoomid(value);
                break;

               case 3:
                var value = reader.readUint32();
                msg.setUserid(value);
                break;

               case 4:
                var value = reader.readUint32();
                msg.setState(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.NetworkStateReq.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.NetworkStateReq.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.NetworkStateReq.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getGameid();
            0 !== f && writer.writeUint32(1, f);
            f = message.getRoomid();
            0 !== parseInt(f, 10) && writer.writeUint64String(2, f);
            f = message.getUserid();
            0 !== f && writer.writeUint32(3, f);
            f = message.getState();
            0 !== f && writer.writeUint32(4, f);
          };
          proto.stream.NetworkStateReq.prototype.getGameid = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.NetworkStateReq.prototype.setGameid = function(value) {
            jspb.Message.setProto3IntField(this, 1, value);
          };
          proto.stream.NetworkStateReq.prototype.getRoomid = function() {
            return jspb.Message.getFieldWithDefault(this, 2, "0");
          };
          proto.stream.NetworkStateReq.prototype.setRoomid = function(value) {
            jspb.Message.setProto3StringIntField(this, 2, value);
          };
          proto.stream.NetworkStateReq.prototype.getUserid = function() {
            return jspb.Message.getFieldWithDefault(this, 3, 0);
          };
          proto.stream.NetworkStateReq.prototype.setUserid = function(value) {
            jspb.Message.setProto3IntField(this, 3, value);
          };
          proto.stream.NetworkStateReq.prototype.getState = function() {
            return jspb.Message.getFieldWithDefault(this, 4, 0);
          };
          proto.stream.NetworkStateReq.prototype.setState = function(value) {
            jspb.Message.setProto3IntField(this, 4, value);
          };
          proto.stream.NetworkStateRsp = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.NetworkStateRsp, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.NetworkStateRsp.displayName = "proto.stream.NetworkStateRsp");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.NetworkStateRsp.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.NetworkStateRsp.toObject(opt_includeInstance, this);
            };
            proto.stream.NetworkStateRsp.toObject = function(includeInstance, msg) {
              var f, obj = {
                status: jspb.Message.getFieldWithDefault(msg, 1, 0)
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.NetworkStateRsp.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.NetworkStateRsp();
            return proto.stream.NetworkStateRsp.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.NetworkStateRsp.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint32();
                msg.setStatus(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.NetworkStateRsp.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.NetworkStateRsp.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.NetworkStateRsp.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getStatus();
            0 !== f && writer.writeUint32(1, f);
          };
          proto.stream.NetworkStateRsp.prototype.getStatus = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.NetworkStateRsp.prototype.setStatus = function(value) {
            jspb.Message.setProto3IntField(this, 1, value);
          };
          proto.stream.NetworkStateNotify = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.NetworkStateNotify, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.NetworkStateNotify.displayName = "proto.stream.NetworkStateNotify");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.NetworkStateNotify.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.NetworkStateNotify.toObject(opt_includeInstance, this);
            };
            proto.stream.NetworkStateNotify.toObject = function(includeInstance, msg) {
              var f, obj = {
                roomid: jspb.Message.getFieldWithDefault(msg, 1, "0"),
                userid: jspb.Message.getFieldWithDefault(msg, 2, 0),
                state: jspb.Message.getFieldWithDefault(msg, 3, 0),
                owner: jspb.Message.getFieldWithDefault(msg, 4, 0)
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.NetworkStateNotify.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.NetworkStateNotify();
            return proto.stream.NetworkStateNotify.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.NetworkStateNotify.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint64String();
                msg.setRoomid(value);
                break;

               case 2:
                var value = reader.readUint32();
                msg.setUserid(value);
                break;

               case 3:
                var value = reader.readUint32();
                msg.setState(value);
                break;

               case 4:
                var value = reader.readUint32();
                msg.setOwner(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.NetworkStateNotify.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.NetworkStateNotify.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.NetworkStateNotify.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getRoomid();
            0 !== parseInt(f, 10) && writer.writeUint64String(1, f);
            f = message.getUserid();
            0 !== f && writer.writeUint32(2, f);
            f = message.getState();
            0 !== f && writer.writeUint32(3, f);
            f = message.getOwner();
            0 !== f && writer.writeUint32(4, f);
          };
          proto.stream.NetworkStateNotify.prototype.getRoomid = function() {
            return jspb.Message.getFieldWithDefault(this, 1, "0");
          };
          proto.stream.NetworkStateNotify.prototype.setRoomid = function(value) {
            jspb.Message.setProto3StringIntField(this, 1, value);
          };
          proto.stream.NetworkStateNotify.prototype.getUserid = function() {
            return jspb.Message.getFieldWithDefault(this, 2, 0);
          };
          proto.stream.NetworkStateNotify.prototype.setUserid = function(value) {
            jspb.Message.setProto3IntField(this, 2, value);
          };
          proto.stream.NetworkStateNotify.prototype.getState = function() {
            return jspb.Message.getFieldWithDefault(this, 3, 0);
          };
          proto.stream.NetworkStateNotify.prototype.setState = function(value) {
            jspb.Message.setProto3IntField(this, 3, value);
          };
          proto.stream.NetworkStateNotify.prototype.getOwner = function() {
            return jspb.Message.getFieldWithDefault(this, 4, 0);
          };
          proto.stream.NetworkStateNotify.prototype.setOwner = function(value) {
            jspb.Message.setProto3IntField(this, 4, value);
          };
          proto.stream.CreateRoom = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.CreateRoom, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.CreateRoom.displayName = "proto.stream.CreateRoom");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.CreateRoom.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.CreateRoom.toObject(opt_includeInstance, this);
            };
            proto.stream.CreateRoom.toObject = function(includeInstance, msg) {
              var f, obj = {
                playerinfo: (f = msg.getPlayerinfo()) && proto.stream.PlayerInfo.toObject(includeInstance, f),
                gameid: jspb.Message.getFieldWithDefault(msg, 2, 0),
                roominfo: (f = msg.getRoominfo()) && proto.stream.RoomInfo.toObject(includeInstance, f)
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.CreateRoom.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.CreateRoom();
            return proto.stream.CreateRoom.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.CreateRoom.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = new proto.stream.PlayerInfo();
                reader.readMessage(value, proto.stream.PlayerInfo.deserializeBinaryFromReader);
                msg.setPlayerinfo(value);
                break;

               case 2:
                var value = reader.readUint32();
                msg.setGameid(value);
                break;

               case 3:
                var value = new proto.stream.RoomInfo();
                reader.readMessage(value, proto.stream.RoomInfo.deserializeBinaryFromReader);
                msg.setRoominfo(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.CreateRoom.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.CreateRoom.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.CreateRoom.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getPlayerinfo();
            null != f && writer.writeMessage(1, f, proto.stream.PlayerInfo.serializeBinaryToWriter);
            f = message.getGameid();
            0 !== f && writer.writeUint32(2, f);
            f = message.getRoominfo();
            null != f && writer.writeMessage(3, f, proto.stream.RoomInfo.serializeBinaryToWriter);
          };
          proto.stream.CreateRoom.prototype.getPlayerinfo = function() {
            return jspb.Message.getWrapperField(this, proto.stream.PlayerInfo, 1);
          };
          proto.stream.CreateRoom.prototype.setPlayerinfo = function(value) {
            jspb.Message.setWrapperField(this, 1, value);
          };
          proto.stream.CreateRoom.prototype.clearPlayerinfo = function() {
            this.setPlayerinfo(void 0);
          };
          proto.stream.CreateRoom.prototype.hasPlayerinfo = function() {
            return null != jspb.Message.getField(this, 1);
          };
          proto.stream.CreateRoom.prototype.getGameid = function() {
            return jspb.Message.getFieldWithDefault(this, 2, 0);
          };
          proto.stream.CreateRoom.prototype.setGameid = function(value) {
            jspb.Message.setProto3IntField(this, 2, value);
          };
          proto.stream.CreateRoom.prototype.getRoominfo = function() {
            return jspb.Message.getWrapperField(this, proto.stream.RoomInfo, 3);
          };
          proto.stream.CreateRoom.prototype.setRoominfo = function(value) {
            jspb.Message.setWrapperField(this, 3, value);
          };
          proto.stream.CreateRoom.prototype.clearRoominfo = function() {
            this.setRoominfo(void 0);
          };
          proto.stream.CreateRoom.prototype.hasRoominfo = function() {
            return null != jspb.Message.getField(this, 3);
          };
          proto.stream.CreateRoomRsp = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.CreateRoomRsp, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.CreateRoomRsp.displayName = "proto.stream.CreateRoomRsp");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.CreateRoomRsp.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.CreateRoomRsp.toObject(opt_includeInstance, this);
            };
            proto.stream.CreateRoomRsp.toObject = function(includeInstance, msg) {
              var f, obj = {
                status: jspb.Message.getFieldWithDefault(msg, 1, 0),
                roomid: jspb.Message.getFieldWithDefault(msg, 2, "0"),
                bookinfo: (f = msg.getBookinfo()) && proto.stream.BookInfo.toObject(includeInstance, f),
                owner: jspb.Message.getFieldWithDefault(msg, 4, 0)
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.CreateRoomRsp.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.CreateRoomRsp();
            return proto.stream.CreateRoomRsp.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.CreateRoomRsp.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readEnum();
                msg.setStatus(value);
                break;

               case 2:
                var value = reader.readUint64String();
                msg.setRoomid(value);
                break;

               case 3:
                var value = new proto.stream.BookInfo();
                reader.readMessage(value, proto.stream.BookInfo.deserializeBinaryFromReader);
                msg.setBookinfo(value);
                break;

               case 4:
                var value = reader.readUint32();
                msg.setOwner(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.CreateRoomRsp.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.CreateRoomRsp.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.CreateRoomRsp.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getStatus();
            0 !== f && writer.writeEnum(1, f);
            f = message.getRoomid();
            0 !== parseInt(f, 10) && writer.writeUint64String(2, f);
            f = message.getBookinfo();
            null != f && writer.writeMessage(3, f, proto.stream.BookInfo.serializeBinaryToWriter);
            f = message.getOwner();
            0 !== f && writer.writeUint32(4, f);
          };
          proto.stream.CreateRoomRsp.prototype.getStatus = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.CreateRoomRsp.prototype.setStatus = function(value) {
            jspb.Message.setProto3EnumField(this, 1, value);
          };
          proto.stream.CreateRoomRsp.prototype.getRoomid = function() {
            return jspb.Message.getFieldWithDefault(this, 2, "0");
          };
          proto.stream.CreateRoomRsp.prototype.setRoomid = function(value) {
            jspb.Message.setProto3StringIntField(this, 2, value);
          };
          proto.stream.CreateRoomRsp.prototype.getBookinfo = function() {
            return jspb.Message.getWrapperField(this, proto.stream.BookInfo, 3);
          };
          proto.stream.CreateRoomRsp.prototype.setBookinfo = function(value) {
            jspb.Message.setWrapperField(this, 3, value);
          };
          proto.stream.CreateRoomRsp.prototype.clearBookinfo = function() {
            this.setBookinfo(void 0);
          };
          proto.stream.CreateRoomRsp.prototype.hasBookinfo = function() {
            return null != jspb.Message.getField(this, 3);
          };
          proto.stream.CreateRoomRsp.prototype.getOwner = function() {
            return jspb.Message.getFieldWithDefault(this, 4, 0);
          };
          proto.stream.CreateRoomRsp.prototype.setOwner = function(value) {
            jspb.Message.setProto3IntField(this, 4, value);
          };
          proto.stream.GetRoomList = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.GetRoomList, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.GetRoomList.displayName = "proto.stream.GetRoomList");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.GetRoomList.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.GetRoomList.toObject(opt_includeInstance, this);
            };
            proto.stream.GetRoomList.toObject = function(includeInstance, msg) {
              var f, obj = {
                gameid: jspb.Message.getFieldWithDefault(msg, 1, 0),
                roomfilter: (f = msg.getRoomfilter()) && proto.stream.RoomFilter.toObject(includeInstance, f)
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.GetRoomList.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.GetRoomList();
            return proto.stream.GetRoomList.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.GetRoomList.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint32();
                msg.setGameid(value);
                break;

               case 2:
                var value = new proto.stream.RoomFilter();
                reader.readMessage(value, proto.stream.RoomFilter.deserializeBinaryFromReader);
                msg.setRoomfilter(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.GetRoomList.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.GetRoomList.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.GetRoomList.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getGameid();
            0 !== f && writer.writeUint32(1, f);
            f = message.getRoomfilter();
            null != f && writer.writeMessage(2, f, proto.stream.RoomFilter.serializeBinaryToWriter);
          };
          proto.stream.GetRoomList.prototype.getGameid = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.GetRoomList.prototype.setGameid = function(value) {
            jspb.Message.setProto3IntField(this, 1, value);
          };
          proto.stream.GetRoomList.prototype.getRoomfilter = function() {
            return jspb.Message.getWrapperField(this, proto.stream.RoomFilter, 2);
          };
          proto.stream.GetRoomList.prototype.setRoomfilter = function(value) {
            jspb.Message.setWrapperField(this, 2, value);
          };
          proto.stream.GetRoomList.prototype.clearRoomfilter = function() {
            this.setRoomfilter(void 0);
          };
          proto.stream.GetRoomList.prototype.hasRoomfilter = function() {
            return null != jspb.Message.getField(this, 2);
          };
          proto.stream.RoomFilter = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.RoomFilter, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.RoomFilter.displayName = "proto.stream.RoomFilter");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.RoomFilter.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.RoomFilter.toObject(opt_includeInstance, this);
            };
            proto.stream.RoomFilter.toObject = function(includeInstance, msg) {
              var f, obj = {
                maxplayer: jspb.Message.getFieldWithDefault(msg, 1, 0),
                mode: jspb.Message.getFieldWithDefault(msg, 2, 0),
                canwatch: jspb.Message.getFieldWithDefault(msg, 3, 0),
                roomproperty: msg.getRoomproperty_asB64(),
                full: jspb.Message.getFieldWithDefault(msg, 5, 0),
                state: jspb.Message.getFieldWithDefault(msg, 6, 0)
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.RoomFilter.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.RoomFilter();
            return proto.stream.RoomFilter.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.RoomFilter.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint32();
                msg.setMaxplayer(value);
                break;

               case 2:
                var value = reader.readInt32();
                msg.setMode(value);
                break;

               case 3:
                var value = reader.readInt32();
                msg.setCanwatch(value);
                break;

               case 4:
                var value = reader.readBytes();
                msg.setRoomproperty(value);
                break;

               case 5:
                var value = reader.readInt32();
                msg.setFull(value);
                break;

               case 6:
                var value = reader.readEnum();
                msg.setState(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.RoomFilter.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.RoomFilter.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.RoomFilter.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getMaxplayer();
            0 !== f && writer.writeUint32(1, f);
            f = message.getMode();
            0 !== f && writer.writeInt32(2, f);
            f = message.getCanwatch();
            0 !== f && writer.writeInt32(3, f);
            f = message.getRoomproperty_asU8();
            f.length > 0 && writer.writeBytes(4, f);
            f = message.getFull();
            0 !== f && writer.writeInt32(5, f);
            f = message.getState();
            0 !== f && writer.writeEnum(6, f);
          };
          proto.stream.RoomFilter.prototype.getMaxplayer = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.RoomFilter.prototype.setMaxplayer = function(value) {
            jspb.Message.setProto3IntField(this, 1, value);
          };
          proto.stream.RoomFilter.prototype.getMode = function() {
            return jspb.Message.getFieldWithDefault(this, 2, 0);
          };
          proto.stream.RoomFilter.prototype.setMode = function(value) {
            jspb.Message.setProto3IntField(this, 2, value);
          };
          proto.stream.RoomFilter.prototype.getCanwatch = function() {
            return jspb.Message.getFieldWithDefault(this, 3, 0);
          };
          proto.stream.RoomFilter.prototype.setCanwatch = function(value) {
            jspb.Message.setProto3IntField(this, 3, value);
          };
          proto.stream.RoomFilter.prototype.getRoomproperty = function() {
            return jspb.Message.getFieldWithDefault(this, 4, "");
          };
          proto.stream.RoomFilter.prototype.getRoomproperty_asB64 = function() {
            return jspb.Message.bytesAsB64(this.getRoomproperty());
          };
          proto.stream.RoomFilter.prototype.getRoomproperty_asU8 = function() {
            return jspb.Message.bytesAsU8(this.getRoomproperty());
          };
          proto.stream.RoomFilter.prototype.setRoomproperty = function(value) {
            jspb.Message.setProto3BytesField(this, 4, value);
          };
          proto.stream.RoomFilter.prototype.getFull = function() {
            return jspb.Message.getFieldWithDefault(this, 5, 0);
          };
          proto.stream.RoomFilter.prototype.setFull = function(value) {
            jspb.Message.setProto3IntField(this, 5, value);
          };
          proto.stream.RoomFilter.prototype.getState = function() {
            return jspb.Message.getFieldWithDefault(this, 6, 0);
          };
          proto.stream.RoomFilter.prototype.setState = function(value) {
            jspb.Message.setProto3EnumField(this, 6, value);
          };
          proto.stream.GetRoomListRsp = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, proto.stream.GetRoomListRsp.repeatedFields_, null);
          };
          goog.inherits(proto.stream.GetRoomListRsp, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.GetRoomListRsp.displayName = "proto.stream.GetRoomListRsp");
          proto.stream.GetRoomListRsp.repeatedFields_ = [ 2 ];
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.GetRoomListRsp.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.GetRoomListRsp.toObject(opt_includeInstance, this);
            };
            proto.stream.GetRoomListRsp.toObject = function(includeInstance, msg) {
              var f, obj = {
                status: jspb.Message.getFieldWithDefault(msg, 1, 0),
                roominfoList: jspb.Message.toObjectList(msg.getRoominfoList(), proto.stream.RoomInfo.toObject, includeInstance)
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.GetRoomListRsp.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.GetRoomListRsp();
            return proto.stream.GetRoomListRsp.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.GetRoomListRsp.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readEnum();
                msg.setStatus(value);
                break;

               case 2:
                var value = new proto.stream.RoomInfo();
                reader.readMessage(value, proto.stream.RoomInfo.deserializeBinaryFromReader);
                msg.addRoominfo(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.GetRoomListRsp.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.GetRoomListRsp.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.GetRoomListRsp.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getStatus();
            0 !== f && writer.writeEnum(1, f);
            f = message.getRoominfoList();
            f.length > 0 && writer.writeRepeatedMessage(2, f, proto.stream.RoomInfo.serializeBinaryToWriter);
          };
          proto.stream.GetRoomListRsp.prototype.getStatus = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.GetRoomListRsp.prototype.setStatus = function(value) {
            jspb.Message.setProto3EnumField(this, 1, value);
          };
          proto.stream.GetRoomListRsp.prototype.getRoominfoList = function() {
            return jspb.Message.getRepeatedWrapperField(this, proto.stream.RoomInfo, 2);
          };
          proto.stream.GetRoomListRsp.prototype.setRoominfoList = function(value) {
            jspb.Message.setRepeatedWrapperField(this, 2, value);
          };
          proto.stream.GetRoomListRsp.prototype.addRoominfo = function(opt_value, opt_index) {
            return jspb.Message.addToRepeatedWrapperField(this, 2, opt_value, proto.stream.RoomInfo, opt_index);
          };
          proto.stream.GetRoomListRsp.prototype.clearRoominfoList = function() {
            this.setRoominfoList([]);
          };
          proto.stream.GetRoomListExReq = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.GetRoomListExReq, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.GetRoomListExReq.displayName = "proto.stream.GetRoomListExReq");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.GetRoomListExReq.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.GetRoomListExReq.toObject(opt_includeInstance, this);
            };
            proto.stream.GetRoomListExReq.toObject = function(includeInstance, msg) {
              var f, obj = {
                gameid: jspb.Message.getFieldWithDefault(msg, 1, 0),
                roomfilter: (f = msg.getRoomfilter()) && proto.stream.RoomFilter.toObject(includeInstance, f),
                sort: jspb.Message.getFieldWithDefault(msg, 3, 0),
                order: jspb.Message.getFieldWithDefault(msg, 4, 0),
                pageno: jspb.Message.getFieldWithDefault(msg, 5, 0),
                pagesize: jspb.Message.getFieldWithDefault(msg, 6, 0)
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.GetRoomListExReq.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.GetRoomListExReq();
            return proto.stream.GetRoomListExReq.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.GetRoomListExReq.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint32();
                msg.setGameid(value);
                break;

               case 2:
                var value = new proto.stream.RoomFilter();
                reader.readMessage(value, proto.stream.RoomFilter.deserializeBinaryFromReader);
                msg.setRoomfilter(value);
                break;

               case 3:
                var value = reader.readEnum();
                msg.setSort(value);
                break;

               case 4:
                var value = reader.readEnum();
                msg.setOrder(value);
                break;

               case 5:
                var value = reader.readInt32();
                msg.setPageno(value);
                break;

               case 6:
                var value = reader.readInt32();
                msg.setPagesize(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.GetRoomListExReq.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.GetRoomListExReq.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.GetRoomListExReq.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getGameid();
            0 !== f && writer.writeUint32(1, f);
            f = message.getRoomfilter();
            null != f && writer.writeMessage(2, f, proto.stream.RoomFilter.serializeBinaryToWriter);
            f = message.getSort();
            0 !== f && writer.writeEnum(3, f);
            f = message.getOrder();
            0 !== f && writer.writeEnum(4, f);
            f = message.getPageno();
            0 !== f && writer.writeInt32(5, f);
            f = message.getPagesize();
            0 !== f && writer.writeInt32(6, f);
          };
          proto.stream.GetRoomListExReq.prototype.getGameid = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.GetRoomListExReq.prototype.setGameid = function(value) {
            jspb.Message.setProto3IntField(this, 1, value);
          };
          proto.stream.GetRoomListExReq.prototype.getRoomfilter = function() {
            return jspb.Message.getWrapperField(this, proto.stream.RoomFilter, 2);
          };
          proto.stream.GetRoomListExReq.prototype.setRoomfilter = function(value) {
            jspb.Message.setWrapperField(this, 2, value);
          };
          proto.stream.GetRoomListExReq.prototype.clearRoomfilter = function() {
            this.setRoomfilter(void 0);
          };
          proto.stream.GetRoomListExReq.prototype.hasRoomfilter = function() {
            return null != jspb.Message.getField(this, 2);
          };
          proto.stream.GetRoomListExReq.prototype.getSort = function() {
            return jspb.Message.getFieldWithDefault(this, 3, 0);
          };
          proto.stream.GetRoomListExReq.prototype.setSort = function(value) {
            jspb.Message.setProto3EnumField(this, 3, value);
          };
          proto.stream.GetRoomListExReq.prototype.getOrder = function() {
            return jspb.Message.getFieldWithDefault(this, 4, 0);
          };
          proto.stream.GetRoomListExReq.prototype.setOrder = function(value) {
            jspb.Message.setProto3EnumField(this, 4, value);
          };
          proto.stream.GetRoomListExReq.prototype.getPageno = function() {
            return jspb.Message.getFieldWithDefault(this, 5, 0);
          };
          proto.stream.GetRoomListExReq.prototype.setPageno = function(value) {
            jspb.Message.setProto3IntField(this, 5, value);
          };
          proto.stream.GetRoomListExReq.prototype.getPagesize = function() {
            return jspb.Message.getFieldWithDefault(this, 6, 0);
          };
          proto.stream.GetRoomListExReq.prototype.setPagesize = function(value) {
            jspb.Message.setProto3IntField(this, 6, value);
          };
          proto.stream.RoomInfoEx = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.RoomInfoEx, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.RoomInfoEx.displayName = "proto.stream.RoomInfoEx");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.RoomInfoEx.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.RoomInfoEx.toObject(opt_includeInstance, this);
            };
            proto.stream.RoomInfoEx.toObject = function(includeInstance, msg) {
              var f, obj = {
                roomid: jspb.Message.getFieldWithDefault(msg, 1, "0"),
                roomname: jspb.Message.getFieldWithDefault(msg, 2, ""),
                maxplayer: jspb.Message.getFieldWithDefault(msg, 3, 0),
                gameplayer: jspb.Message.getFieldWithDefault(msg, 4, 0),
                watchplayer: jspb.Message.getFieldWithDefault(msg, 5, 0),
                mode: jspb.Message.getFieldWithDefault(msg, 6, 0),
                canwatch: jspb.Message.getFieldWithDefault(msg, 7, 0),
                roomproperty: msg.getRoomproperty_asB64(),
                owner: jspb.Message.getFieldWithDefault(msg, 9, 0),
                state: jspb.Message.getFieldWithDefault(msg, 10, 0),
                createtime: jspb.Message.getFieldWithDefault(msg, 11, 0)
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.RoomInfoEx.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.RoomInfoEx();
            return proto.stream.RoomInfoEx.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.RoomInfoEx.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint64String();
                msg.setRoomid(value);
                break;

               case 2:
                var value = reader.readString();
                msg.setRoomname(value);
                break;

               case 3:
                var value = reader.readUint32();
                msg.setMaxplayer(value);
                break;

               case 4:
                var value = reader.readUint32();
                msg.setGameplayer(value);
                break;

               case 5:
                var value = reader.readUint32();
                msg.setWatchplayer(value);
                break;

               case 6:
                var value = reader.readInt32();
                msg.setMode(value);
                break;

               case 7:
                var value = reader.readInt32();
                msg.setCanwatch(value);
                break;

               case 8:
                var value = reader.readBytes();
                msg.setRoomproperty(value);
                break;

               case 9:
                var value = reader.readUint32();
                msg.setOwner(value);
                break;

               case 10:
                var value = reader.readEnum();
                msg.setState(value);
                break;

               case 11:
                var value = reader.readUint64();
                msg.setCreatetime(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.RoomInfoEx.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.RoomInfoEx.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.RoomInfoEx.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getRoomid();
            0 !== parseInt(f, 10) && writer.writeUint64String(1, f);
            f = message.getRoomname();
            f.length > 0 && writer.writeString(2, f);
            f = message.getMaxplayer();
            0 !== f && writer.writeUint32(3, f);
            f = message.getGameplayer();
            0 !== f && writer.writeUint32(4, f);
            f = message.getWatchplayer();
            0 !== f && writer.writeUint32(5, f);
            f = message.getMode();
            0 !== f && writer.writeInt32(6, f);
            f = message.getCanwatch();
            0 !== f && writer.writeInt32(7, f);
            f = message.getRoomproperty_asU8();
            f.length > 0 && writer.writeBytes(8, f);
            f = message.getOwner();
            0 !== f && writer.writeUint32(9, f);
            f = message.getState();
            0 !== f && writer.writeEnum(10, f);
            f = message.getCreatetime();
            0 !== f && writer.writeUint64(11, f);
          };
          proto.stream.RoomInfoEx.prototype.getRoomid = function() {
            return jspb.Message.getFieldWithDefault(this, 1, "0");
          };
          proto.stream.RoomInfoEx.prototype.setRoomid = function(value) {
            jspb.Message.setProto3StringIntField(this, 1, value);
          };
          proto.stream.RoomInfoEx.prototype.getRoomname = function() {
            return jspb.Message.getFieldWithDefault(this, 2, "");
          };
          proto.stream.RoomInfoEx.prototype.setRoomname = function(value) {
            jspb.Message.setProto3StringField(this, 2, value);
          };
          proto.stream.RoomInfoEx.prototype.getMaxplayer = function() {
            return jspb.Message.getFieldWithDefault(this, 3, 0);
          };
          proto.stream.RoomInfoEx.prototype.setMaxplayer = function(value) {
            jspb.Message.setProto3IntField(this, 3, value);
          };
          proto.stream.RoomInfoEx.prototype.getGameplayer = function() {
            return jspb.Message.getFieldWithDefault(this, 4, 0);
          };
          proto.stream.RoomInfoEx.prototype.setGameplayer = function(value) {
            jspb.Message.setProto3IntField(this, 4, value);
          };
          proto.stream.RoomInfoEx.prototype.getWatchplayer = function() {
            return jspb.Message.getFieldWithDefault(this, 5, 0);
          };
          proto.stream.RoomInfoEx.prototype.setWatchplayer = function(value) {
            jspb.Message.setProto3IntField(this, 5, value);
          };
          proto.stream.RoomInfoEx.prototype.getMode = function() {
            return jspb.Message.getFieldWithDefault(this, 6, 0);
          };
          proto.stream.RoomInfoEx.prototype.setMode = function(value) {
            jspb.Message.setProto3IntField(this, 6, value);
          };
          proto.stream.RoomInfoEx.prototype.getCanwatch = function() {
            return jspb.Message.getFieldWithDefault(this, 7, 0);
          };
          proto.stream.RoomInfoEx.prototype.setCanwatch = function(value) {
            jspb.Message.setProto3IntField(this, 7, value);
          };
          proto.stream.RoomInfoEx.prototype.getRoomproperty = function() {
            return jspb.Message.getFieldWithDefault(this, 8, "");
          };
          proto.stream.RoomInfoEx.prototype.getRoomproperty_asB64 = function() {
            return jspb.Message.bytesAsB64(this.getRoomproperty());
          };
          proto.stream.RoomInfoEx.prototype.getRoomproperty_asU8 = function() {
            return jspb.Message.bytesAsU8(this.getRoomproperty());
          };
          proto.stream.RoomInfoEx.prototype.setRoomproperty = function(value) {
            jspb.Message.setProto3BytesField(this, 8, value);
          };
          proto.stream.RoomInfoEx.prototype.getOwner = function() {
            return jspb.Message.getFieldWithDefault(this, 9, 0);
          };
          proto.stream.RoomInfoEx.prototype.setOwner = function(value) {
            jspb.Message.setProto3IntField(this, 9, value);
          };
          proto.stream.RoomInfoEx.prototype.getState = function() {
            return jspb.Message.getFieldWithDefault(this, 10, 0);
          };
          proto.stream.RoomInfoEx.prototype.setState = function(value) {
            jspb.Message.setProto3EnumField(this, 10, value);
          };
          proto.stream.RoomInfoEx.prototype.getCreatetime = function() {
            return jspb.Message.getFieldWithDefault(this, 11, 0);
          };
          proto.stream.RoomInfoEx.prototype.setCreatetime = function(value) {
            jspb.Message.setProto3IntField(this, 11, value);
          };
          proto.stream.GetRoomListExRsp = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, proto.stream.GetRoomListExRsp.repeatedFields_, null);
          };
          goog.inherits(proto.stream.GetRoomListExRsp, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.GetRoomListExRsp.displayName = "proto.stream.GetRoomListExRsp");
          proto.stream.GetRoomListExRsp.repeatedFields_ = [ 3 ];
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.GetRoomListExRsp.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.GetRoomListExRsp.toObject(opt_includeInstance, this);
            };
            proto.stream.GetRoomListExRsp.toObject = function(includeInstance, msg) {
              var f, obj = {
                status: jspb.Message.getFieldWithDefault(msg, 1, 0),
                total: jspb.Message.getFieldWithDefault(msg, 2, 0),
                roominfoexList: jspb.Message.toObjectList(msg.getRoominfoexList(), proto.stream.RoomInfoEx.toObject, includeInstance)
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.GetRoomListExRsp.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.GetRoomListExRsp();
            return proto.stream.GetRoomListExRsp.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.GetRoomListExRsp.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readEnum();
                msg.setStatus(value);
                break;

               case 2:
                var value = reader.readInt32();
                msg.setTotal(value);
                break;

               case 3:
                var value = new proto.stream.RoomInfoEx();
                reader.readMessage(value, proto.stream.RoomInfoEx.deserializeBinaryFromReader);
                msg.addRoominfoex(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.GetRoomListExRsp.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.GetRoomListExRsp.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.GetRoomListExRsp.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getStatus();
            0 !== f && writer.writeEnum(1, f);
            f = message.getTotal();
            0 !== f && writer.writeInt32(2, f);
            f = message.getRoominfoexList();
            f.length > 0 && writer.writeRepeatedMessage(3, f, proto.stream.RoomInfoEx.serializeBinaryToWriter);
          };
          proto.stream.GetRoomListExRsp.prototype.getStatus = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.GetRoomListExRsp.prototype.setStatus = function(value) {
            jspb.Message.setProto3EnumField(this, 1, value);
          };
          proto.stream.GetRoomListExRsp.prototype.getTotal = function() {
            return jspb.Message.getFieldWithDefault(this, 2, 0);
          };
          proto.stream.GetRoomListExRsp.prototype.setTotal = function(value) {
            jspb.Message.setProto3IntField(this, 2, value);
          };
          proto.stream.GetRoomListExRsp.prototype.getRoominfoexList = function() {
            return jspb.Message.getRepeatedWrapperField(this, proto.stream.RoomInfoEx, 3);
          };
          proto.stream.GetRoomListExRsp.prototype.setRoominfoexList = function(value) {
            jspb.Message.setRepeatedWrapperField(this, 3, value);
          };
          proto.stream.GetRoomListExRsp.prototype.addRoominfoex = function(opt_value, opt_index) {
            return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.stream.RoomInfoEx, opt_index);
          };
          proto.stream.GetRoomListExRsp.prototype.clearRoominfoexList = function() {
            this.setRoominfoexList([]);
          };
          proto.stream.GetRoomDetailReq = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.GetRoomDetailReq, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.GetRoomDetailReq.displayName = "proto.stream.GetRoomDetailReq");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.GetRoomDetailReq.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.GetRoomDetailReq.toObject(opt_includeInstance, this);
            };
            proto.stream.GetRoomDetailReq.toObject = function(includeInstance, msg) {
              var f, obj = {
                gameid: jspb.Message.getFieldWithDefault(msg, 1, 0),
                roomid: jspb.Message.getFieldWithDefault(msg, 2, "0")
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.GetRoomDetailReq.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.GetRoomDetailReq();
            return proto.stream.GetRoomDetailReq.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.GetRoomDetailReq.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint32();
                msg.setGameid(value);
                break;

               case 2:
                var value = reader.readUint64String();
                msg.setRoomid(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.GetRoomDetailReq.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.GetRoomDetailReq.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.GetRoomDetailReq.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getGameid();
            0 !== f && writer.writeUint32(1, f);
            f = message.getRoomid();
            0 !== parseInt(f, 10) && writer.writeUint64String(2, f);
          };
          proto.stream.GetRoomDetailReq.prototype.getGameid = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.GetRoomDetailReq.prototype.setGameid = function(value) {
            jspb.Message.setProto3IntField(this, 1, value);
          };
          proto.stream.GetRoomDetailReq.prototype.getRoomid = function() {
            return jspb.Message.getFieldWithDefault(this, 2, "0");
          };
          proto.stream.GetRoomDetailReq.prototype.setRoomid = function(value) {
            jspb.Message.setProto3StringIntField(this, 2, value);
          };
          proto.stream.GetRoomDetailRsp = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.GetRoomDetailRsp, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.GetRoomDetailRsp.displayName = "proto.stream.GetRoomDetailRsp");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.GetRoomDetailRsp.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.GetRoomDetailRsp.toObject(opt_includeInstance, this);
            };
            proto.stream.GetRoomDetailRsp.toObject = function(includeInstance, msg) {
              var f, obj = {
                status: jspb.Message.getFieldWithDefault(msg, 1, 0),
                roomdetail: (f = msg.getRoomdetail()) && proto.stream.RoomDetail.toObject(includeInstance, f)
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.GetRoomDetailRsp.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.GetRoomDetailRsp();
            return proto.stream.GetRoomDetailRsp.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.GetRoomDetailRsp.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readEnum();
                msg.setStatus(value);
                break;

               case 2:
                var value = new proto.stream.RoomDetail();
                reader.readMessage(value, proto.stream.RoomDetail.deserializeBinaryFromReader);
                msg.setRoomdetail(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.GetRoomDetailRsp.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.GetRoomDetailRsp.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.GetRoomDetailRsp.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getStatus();
            0 !== f && writer.writeEnum(1, f);
            f = message.getRoomdetail();
            null != f && writer.writeMessage(2, f, proto.stream.RoomDetail.serializeBinaryToWriter);
          };
          proto.stream.GetRoomDetailRsp.prototype.getStatus = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.GetRoomDetailRsp.prototype.setStatus = function(value) {
            jspb.Message.setProto3EnumField(this, 1, value);
          };
          proto.stream.GetRoomDetailRsp.prototype.getRoomdetail = function() {
            return jspb.Message.getWrapperField(this, proto.stream.RoomDetail, 2);
          };
          proto.stream.GetRoomDetailRsp.prototype.setRoomdetail = function(value) {
            jspb.Message.setWrapperField(this, 2, value);
          };
          proto.stream.GetRoomDetailRsp.prototype.clearRoomdetail = function() {
            this.setRoomdetail(void 0);
          };
          proto.stream.GetRoomDetailRsp.prototype.hasRoomdetail = function() {
            return null != jspb.Message.getField(this, 2);
          };
          proto.stream.RoomDetail = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, proto.stream.RoomDetail.repeatedFields_, null);
          };
          goog.inherits(proto.stream.RoomDetail, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.RoomDetail.displayName = "proto.stream.RoomDetail");
          proto.stream.RoomDetail.repeatedFields_ = [ 9 ];
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.RoomDetail.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.RoomDetail.toObject(opt_includeInstance, this);
            };
            proto.stream.RoomDetail.toObject = function(includeInstance, msg) {
              var f, obj = {
                roomid: jspb.Message.getFieldWithDefault(msg, 1, "0"),
                state: jspb.Message.getFieldWithDefault(msg, 2, 0),
                maxplayer: jspb.Message.getFieldWithDefault(msg, 3, 0),
                mode: jspb.Message.getFieldWithDefault(msg, 4, 0),
                canwatch: jspb.Message.getFieldWithDefault(msg, 5, 0),
                roomproperty: msg.getRoomproperty_asB64(),
                owner: jspb.Message.getFieldWithDefault(msg, 7, 0),
                createflag: jspb.Message.getFieldWithDefault(msg, 8, 0),
                playerinfosList: jspb.Message.toObjectList(msg.getPlayerinfosList(), proto.stream.PlayerInfo.toObject, includeInstance)
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.RoomDetail.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.RoomDetail();
            return proto.stream.RoomDetail.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.RoomDetail.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint64String();
                msg.setRoomid(value);
                break;

               case 2:
                var value = reader.readEnum();
                msg.setState(value);
                break;

               case 3:
                var value = reader.readUint32();
                msg.setMaxplayer(value);
                break;

               case 4:
                var value = reader.readInt32();
                msg.setMode(value);
                break;

               case 5:
                var value = reader.readInt32();
                msg.setCanwatch(value);
                break;

               case 6:
                var value = reader.readBytes();
                msg.setRoomproperty(value);
                break;

               case 7:
                var value = reader.readUint32();
                msg.setOwner(value);
                break;

               case 8:
                var value = reader.readUint32();
                msg.setCreateflag(value);
                break;

               case 9:
                var value = new proto.stream.PlayerInfo();
                reader.readMessage(value, proto.stream.PlayerInfo.deserializeBinaryFromReader);
                msg.addPlayerinfos(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.RoomDetail.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.RoomDetail.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.RoomDetail.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getRoomid();
            0 !== parseInt(f, 10) && writer.writeUint64String(1, f);
            f = message.getState();
            0 !== f && writer.writeEnum(2, f);
            f = message.getMaxplayer();
            0 !== f && writer.writeUint32(3, f);
            f = message.getMode();
            0 !== f && writer.writeInt32(4, f);
            f = message.getCanwatch();
            0 !== f && writer.writeInt32(5, f);
            f = message.getRoomproperty_asU8();
            f.length > 0 && writer.writeBytes(6, f);
            f = message.getOwner();
            0 !== f && writer.writeUint32(7, f);
            f = message.getCreateflag();
            0 !== f && writer.writeUint32(8, f);
            f = message.getPlayerinfosList();
            f.length > 0 && writer.writeRepeatedMessage(9, f, proto.stream.PlayerInfo.serializeBinaryToWriter);
          };
          proto.stream.RoomDetail.prototype.getRoomid = function() {
            return jspb.Message.getFieldWithDefault(this, 1, "0");
          };
          proto.stream.RoomDetail.prototype.setRoomid = function(value) {
            jspb.Message.setProto3StringIntField(this, 1, value);
          };
          proto.stream.RoomDetail.prototype.getState = function() {
            return jspb.Message.getFieldWithDefault(this, 2, 0);
          };
          proto.stream.RoomDetail.prototype.setState = function(value) {
            jspb.Message.setProto3EnumField(this, 2, value);
          };
          proto.stream.RoomDetail.prototype.getMaxplayer = function() {
            return jspb.Message.getFieldWithDefault(this, 3, 0);
          };
          proto.stream.RoomDetail.prototype.setMaxplayer = function(value) {
            jspb.Message.setProto3IntField(this, 3, value);
          };
          proto.stream.RoomDetail.prototype.getMode = function() {
            return jspb.Message.getFieldWithDefault(this, 4, 0);
          };
          proto.stream.RoomDetail.prototype.setMode = function(value) {
            jspb.Message.setProto3IntField(this, 4, value);
          };
          proto.stream.RoomDetail.prototype.getCanwatch = function() {
            return jspb.Message.getFieldWithDefault(this, 5, 0);
          };
          proto.stream.RoomDetail.prototype.setCanwatch = function(value) {
            jspb.Message.setProto3IntField(this, 5, value);
          };
          proto.stream.RoomDetail.prototype.getRoomproperty = function() {
            return jspb.Message.getFieldWithDefault(this, 6, "");
          };
          proto.stream.RoomDetail.prototype.getRoomproperty_asB64 = function() {
            return jspb.Message.bytesAsB64(this.getRoomproperty());
          };
          proto.stream.RoomDetail.prototype.getRoomproperty_asU8 = function() {
            return jspb.Message.bytesAsU8(this.getRoomproperty());
          };
          proto.stream.RoomDetail.prototype.setRoomproperty = function(value) {
            jspb.Message.setProto3BytesField(this, 6, value);
          };
          proto.stream.RoomDetail.prototype.getOwner = function() {
            return jspb.Message.getFieldWithDefault(this, 7, 0);
          };
          proto.stream.RoomDetail.prototype.setOwner = function(value) {
            jspb.Message.setProto3IntField(this, 7, value);
          };
          proto.stream.RoomDetail.prototype.getCreateflag = function() {
            return jspb.Message.getFieldWithDefault(this, 8, 0);
          };
          proto.stream.RoomDetail.prototype.setCreateflag = function(value) {
            jspb.Message.setProto3IntField(this, 8, value);
          };
          proto.stream.RoomDetail.prototype.getPlayerinfosList = function() {
            return jspb.Message.getRepeatedWrapperField(this, proto.stream.PlayerInfo, 9);
          };
          proto.stream.RoomDetail.prototype.setPlayerinfosList = function(value) {
            jspb.Message.setRepeatedWrapperField(this, 9, value);
          };
          proto.stream.RoomDetail.prototype.addPlayerinfos = function(opt_value, opt_index) {
            return jspb.Message.addToRepeatedWrapperField(this, 9, opt_value, proto.stream.PlayerInfo, opt_index);
          };
          proto.stream.RoomDetail.prototype.clearPlayerinfosList = function() {
            this.setPlayerinfosList([]);
          };
          proto.stream.KickPlayer = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.KickPlayer, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.KickPlayer.displayName = "proto.stream.KickPlayer");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.KickPlayer.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.KickPlayer.toObject(opt_includeInstance, this);
            };
            proto.stream.KickPlayer.toObject = function(includeInstance, msg) {
              var f, obj = {
                roomid: jspb.Message.getFieldWithDefault(msg, 1, "0"),
                srcuserid: jspb.Message.getFieldWithDefault(msg, 2, 0),
                userid: jspb.Message.getFieldWithDefault(msg, 3, 0),
                cpproto: msg.getCpproto_asB64()
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.KickPlayer.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.KickPlayer();
            return proto.stream.KickPlayer.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.KickPlayer.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint64String();
                msg.setRoomid(value);
                break;

               case 2:
                var value = reader.readUint32();
                msg.setSrcuserid(value);
                break;

               case 3:
                var value = reader.readUint32();
                msg.setUserid(value);
                break;

               case 4:
                var value = reader.readBytes();
                msg.setCpproto(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.KickPlayer.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.KickPlayer.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.KickPlayer.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getRoomid();
            0 !== parseInt(f, 10) && writer.writeUint64String(1, f);
            f = message.getSrcuserid();
            0 !== f && writer.writeUint32(2, f);
            f = message.getUserid();
            0 !== f && writer.writeUint32(3, f);
            f = message.getCpproto_asU8();
            f.length > 0 && writer.writeBytes(4, f);
          };
          proto.stream.KickPlayer.prototype.getRoomid = function() {
            return jspb.Message.getFieldWithDefault(this, 1, "0");
          };
          proto.stream.KickPlayer.prototype.setRoomid = function(value) {
            jspb.Message.setProto3StringIntField(this, 1, value);
          };
          proto.stream.KickPlayer.prototype.getSrcuserid = function() {
            return jspb.Message.getFieldWithDefault(this, 2, 0);
          };
          proto.stream.KickPlayer.prototype.setSrcuserid = function(value) {
            jspb.Message.setProto3IntField(this, 2, value);
          };
          proto.stream.KickPlayer.prototype.getUserid = function() {
            return jspb.Message.getFieldWithDefault(this, 3, 0);
          };
          proto.stream.KickPlayer.prototype.setUserid = function(value) {
            jspb.Message.setProto3IntField(this, 3, value);
          };
          proto.stream.KickPlayer.prototype.getCpproto = function() {
            return jspb.Message.getFieldWithDefault(this, 4, "");
          };
          proto.stream.KickPlayer.prototype.getCpproto_asB64 = function() {
            return jspb.Message.bytesAsB64(this.getCpproto());
          };
          proto.stream.KickPlayer.prototype.getCpproto_asU8 = function() {
            return jspb.Message.bytesAsU8(this.getCpproto());
          };
          proto.stream.KickPlayer.prototype.setCpproto = function(value) {
            jspb.Message.setProto3BytesField(this, 4, value);
          };
          proto.stream.KickPlayerRsp = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.KickPlayerRsp, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.KickPlayerRsp.displayName = "proto.stream.KickPlayerRsp");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.KickPlayerRsp.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.KickPlayerRsp.toObject(opt_includeInstance, this);
            };
            proto.stream.KickPlayerRsp.toObject = function(includeInstance, msg) {
              var f, obj = {
                status: jspb.Message.getFieldWithDefault(msg, 1, 0),
                userid: jspb.Message.getFieldWithDefault(msg, 2, 0),
                roomid: jspb.Message.getFieldWithDefault(msg, 3, "0"),
                owner: jspb.Message.getFieldWithDefault(msg, 4, 0)
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.KickPlayerRsp.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.KickPlayerRsp();
            return proto.stream.KickPlayerRsp.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.KickPlayerRsp.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readEnum();
                msg.setStatus(value);
                break;

               case 2:
                var value = reader.readUint32();
                msg.setUserid(value);
                break;

               case 3:
                var value = reader.readUint64String();
                msg.setRoomid(value);
                break;

               case 4:
                var value = reader.readUint32();
                msg.setOwner(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.KickPlayerRsp.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.KickPlayerRsp.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.KickPlayerRsp.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getStatus();
            0 !== f && writer.writeEnum(1, f);
            f = message.getUserid();
            0 !== f && writer.writeUint32(2, f);
            f = message.getRoomid();
            0 !== parseInt(f, 10) && writer.writeUint64String(3, f);
            f = message.getOwner();
            0 !== f && writer.writeUint32(4, f);
          };
          proto.stream.KickPlayerRsp.prototype.getStatus = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.KickPlayerRsp.prototype.setStatus = function(value) {
            jspb.Message.setProto3EnumField(this, 1, value);
          };
          proto.stream.KickPlayerRsp.prototype.getUserid = function() {
            return jspb.Message.getFieldWithDefault(this, 2, 0);
          };
          proto.stream.KickPlayerRsp.prototype.setUserid = function(value) {
            jspb.Message.setProto3IntField(this, 2, value);
          };
          proto.stream.KickPlayerRsp.prototype.getRoomid = function() {
            return jspb.Message.getFieldWithDefault(this, 3, "0");
          };
          proto.stream.KickPlayerRsp.prototype.setRoomid = function(value) {
            jspb.Message.setProto3StringIntField(this, 3, value);
          };
          proto.stream.KickPlayerRsp.prototype.getOwner = function() {
            return jspb.Message.getFieldWithDefault(this, 4, 0);
          };
          proto.stream.KickPlayerRsp.prototype.setOwner = function(value) {
            jspb.Message.setProto3IntField(this, 4, value);
          };
          proto.stream.KickPlayerNotify = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.KickPlayerNotify, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.KickPlayerNotify.displayName = "proto.stream.KickPlayerNotify");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.KickPlayerNotify.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.KickPlayerNotify.toObject(opt_includeInstance, this);
            };
            proto.stream.KickPlayerNotify.toObject = function(includeInstance, msg) {
              var f, obj = {
                srcuserid: jspb.Message.getFieldWithDefault(msg, 1, 0),
                userid: jspb.Message.getFieldWithDefault(msg, 2, 0),
                cpproto: msg.getCpproto_asB64(),
                owner: jspb.Message.getFieldWithDefault(msg, 4, 0)
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.KickPlayerNotify.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.KickPlayerNotify();
            return proto.stream.KickPlayerNotify.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.KickPlayerNotify.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint32();
                msg.setSrcuserid(value);
                break;

               case 2:
                var value = reader.readUint32();
                msg.setUserid(value);
                break;

               case 3:
                var value = reader.readBytes();
                msg.setCpproto(value);
                break;

               case 4:
                var value = reader.readUint32();
                msg.setOwner(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.KickPlayerNotify.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.KickPlayerNotify.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.KickPlayerNotify.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getSrcuserid();
            0 !== f && writer.writeUint32(1, f);
            f = message.getUserid();
            0 !== f && writer.writeUint32(2, f);
            f = message.getCpproto_asU8();
            f.length > 0 && writer.writeBytes(3, f);
            f = message.getOwner();
            0 !== f && writer.writeUint32(4, f);
          };
          proto.stream.KickPlayerNotify.prototype.getSrcuserid = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.KickPlayerNotify.prototype.setSrcuserid = function(value) {
            jspb.Message.setProto3IntField(this, 1, value);
          };
          proto.stream.KickPlayerNotify.prototype.getUserid = function() {
            return jspb.Message.getFieldWithDefault(this, 2, 0);
          };
          proto.stream.KickPlayerNotify.prototype.setUserid = function(value) {
            jspb.Message.setProto3IntField(this, 2, value);
          };
          proto.stream.KickPlayerNotify.prototype.getCpproto = function() {
            return jspb.Message.getFieldWithDefault(this, 3, "");
          };
          proto.stream.KickPlayerNotify.prototype.getCpproto_asB64 = function() {
            return jspb.Message.bytesAsB64(this.getCpproto());
          };
          proto.stream.KickPlayerNotify.prototype.getCpproto_asU8 = function() {
            return jspb.Message.bytesAsU8(this.getCpproto());
          };
          proto.stream.KickPlayerNotify.prototype.setCpproto = function(value) {
            jspb.Message.setProto3BytesField(this, 3, value);
          };
          proto.stream.KickPlayerNotify.prototype.getOwner = function() {
            return jspb.Message.getFieldWithDefault(this, 4, 0);
          };
          proto.stream.KickPlayerNotify.prototype.setOwner = function(value) {
            jspb.Message.setProto3IntField(this, 4, value);
          };
          proto.stream.SetRoomPropertyReq = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.SetRoomPropertyReq, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.SetRoomPropertyReq.displayName = "proto.stream.SetRoomPropertyReq");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.SetRoomPropertyReq.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.SetRoomPropertyReq.toObject(opt_includeInstance, this);
            };
            proto.stream.SetRoomPropertyReq.toObject = function(includeInstance, msg) {
              var f, obj = {
                gameid: jspb.Message.getFieldWithDefault(msg, 1, 0),
                roomid: jspb.Message.getFieldWithDefault(msg, 2, "0"),
                userid: jspb.Message.getFieldWithDefault(msg, 3, 0),
                roomproperty: msg.getRoomproperty_asB64()
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.SetRoomPropertyReq.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.SetRoomPropertyReq();
            return proto.stream.SetRoomPropertyReq.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.SetRoomPropertyReq.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint32();
                msg.setGameid(value);
                break;

               case 2:
                var value = reader.readUint64String();
                msg.setRoomid(value);
                break;

               case 3:
                var value = reader.readUint32();
                msg.setUserid(value);
                break;

               case 4:
                var value = reader.readBytes();
                msg.setRoomproperty(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.SetRoomPropertyReq.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.SetRoomPropertyReq.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.SetRoomPropertyReq.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getGameid();
            0 !== f && writer.writeUint32(1, f);
            f = message.getRoomid();
            0 !== parseInt(f, 10) && writer.writeUint64String(2, f);
            f = message.getUserid();
            0 !== f && writer.writeUint32(3, f);
            f = message.getRoomproperty_asU8();
            f.length > 0 && writer.writeBytes(4, f);
          };
          proto.stream.SetRoomPropertyReq.prototype.getGameid = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.SetRoomPropertyReq.prototype.setGameid = function(value) {
            jspb.Message.setProto3IntField(this, 1, value);
          };
          proto.stream.SetRoomPropertyReq.prototype.getRoomid = function() {
            return jspb.Message.getFieldWithDefault(this, 2, "0");
          };
          proto.stream.SetRoomPropertyReq.prototype.setRoomid = function(value) {
            jspb.Message.setProto3StringIntField(this, 2, value);
          };
          proto.stream.SetRoomPropertyReq.prototype.getUserid = function() {
            return jspb.Message.getFieldWithDefault(this, 3, 0);
          };
          proto.stream.SetRoomPropertyReq.prototype.setUserid = function(value) {
            jspb.Message.setProto3IntField(this, 3, value);
          };
          proto.stream.SetRoomPropertyReq.prototype.getRoomproperty = function() {
            return jspb.Message.getFieldWithDefault(this, 4, "");
          };
          proto.stream.SetRoomPropertyReq.prototype.getRoomproperty_asB64 = function() {
            return jspb.Message.bytesAsB64(this.getRoomproperty());
          };
          proto.stream.SetRoomPropertyReq.prototype.getRoomproperty_asU8 = function() {
            return jspb.Message.bytesAsU8(this.getRoomproperty());
          };
          proto.stream.SetRoomPropertyReq.prototype.setRoomproperty = function(value) {
            jspb.Message.setProto3BytesField(this, 4, value);
          };
          proto.stream.SetRoomPropertyRsp = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.SetRoomPropertyRsp, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.SetRoomPropertyRsp.displayName = "proto.stream.SetRoomPropertyRsp");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.SetRoomPropertyRsp.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.SetRoomPropertyRsp.toObject(opt_includeInstance, this);
            };
            proto.stream.SetRoomPropertyRsp.toObject = function(includeInstance, msg) {
              var f, obj = {
                status: jspb.Message.getFieldWithDefault(msg, 1, 0),
                roomid: jspb.Message.getFieldWithDefault(msg, 2, "0"),
                userid: jspb.Message.getFieldWithDefault(msg, 3, 0),
                roomproperty: msg.getRoomproperty_asB64()
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.SetRoomPropertyRsp.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.SetRoomPropertyRsp();
            return proto.stream.SetRoomPropertyRsp.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.SetRoomPropertyRsp.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readEnum();
                msg.setStatus(value);
                break;

               case 2:
                var value = reader.readUint64String();
                msg.setRoomid(value);
                break;

               case 3:
                var value = reader.readUint32();
                msg.setUserid(value);
                break;

               case 4:
                var value = reader.readBytes();
                msg.setRoomproperty(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.SetRoomPropertyRsp.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.SetRoomPropertyRsp.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.SetRoomPropertyRsp.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getStatus();
            0 !== f && writer.writeEnum(1, f);
            f = message.getRoomid();
            0 !== parseInt(f, 10) && writer.writeUint64String(2, f);
            f = message.getUserid();
            0 !== f && writer.writeUint32(3, f);
            f = message.getRoomproperty_asU8();
            f.length > 0 && writer.writeBytes(4, f);
          };
          proto.stream.SetRoomPropertyRsp.prototype.getStatus = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.SetRoomPropertyRsp.prototype.setStatus = function(value) {
            jspb.Message.setProto3EnumField(this, 1, value);
          };
          proto.stream.SetRoomPropertyRsp.prototype.getRoomid = function() {
            return jspb.Message.getFieldWithDefault(this, 2, "0");
          };
          proto.stream.SetRoomPropertyRsp.prototype.setRoomid = function(value) {
            jspb.Message.setProto3StringIntField(this, 2, value);
          };
          proto.stream.SetRoomPropertyRsp.prototype.getUserid = function() {
            return jspb.Message.getFieldWithDefault(this, 3, 0);
          };
          proto.stream.SetRoomPropertyRsp.prototype.setUserid = function(value) {
            jspb.Message.setProto3IntField(this, 3, value);
          };
          proto.stream.SetRoomPropertyRsp.prototype.getRoomproperty = function() {
            return jspb.Message.getFieldWithDefault(this, 4, "");
          };
          proto.stream.SetRoomPropertyRsp.prototype.getRoomproperty_asB64 = function() {
            return jspb.Message.bytesAsB64(this.getRoomproperty());
          };
          proto.stream.SetRoomPropertyRsp.prototype.getRoomproperty_asU8 = function() {
            return jspb.Message.bytesAsU8(this.getRoomproperty());
          };
          proto.stream.SetRoomPropertyRsp.prototype.setRoomproperty = function(value) {
            jspb.Message.setProto3BytesField(this, 4, value);
          };
          proto.stream.NoticeRoomProperty = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.NoticeRoomProperty, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.NoticeRoomProperty.displayName = "proto.stream.NoticeRoomProperty");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.NoticeRoomProperty.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.NoticeRoomProperty.toObject(opt_includeInstance, this);
            };
            proto.stream.NoticeRoomProperty.toObject = function(includeInstance, msg) {
              var f, obj = {
                roomid: jspb.Message.getFieldWithDefault(msg, 1, "0"),
                userid: jspb.Message.getFieldWithDefault(msg, 2, 0),
                roomproperty: msg.getRoomproperty_asB64()
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.NoticeRoomProperty.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.NoticeRoomProperty();
            return proto.stream.NoticeRoomProperty.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.NoticeRoomProperty.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint64String();
                msg.setRoomid(value);
                break;

               case 2:
                var value = reader.readUint32();
                msg.setUserid(value);
                break;

               case 3:
                var value = reader.readBytes();
                msg.setRoomproperty(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.NoticeRoomProperty.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.NoticeRoomProperty.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.NoticeRoomProperty.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getRoomid();
            0 !== parseInt(f, 10) && writer.writeUint64String(1, f);
            f = message.getUserid();
            0 !== f && writer.writeUint32(2, f);
            f = message.getRoomproperty_asU8();
            f.length > 0 && writer.writeBytes(3, f);
          };
          proto.stream.NoticeRoomProperty.prototype.getRoomid = function() {
            return jspb.Message.getFieldWithDefault(this, 1, "0");
          };
          proto.stream.NoticeRoomProperty.prototype.setRoomid = function(value) {
            jspb.Message.setProto3StringIntField(this, 1, value);
          };
          proto.stream.NoticeRoomProperty.prototype.getUserid = function() {
            return jspb.Message.getFieldWithDefault(this, 2, 0);
          };
          proto.stream.NoticeRoomProperty.prototype.setUserid = function(value) {
            jspb.Message.setProto3IntField(this, 2, value);
          };
          proto.stream.NoticeRoomProperty.prototype.getRoomproperty = function() {
            return jspb.Message.getFieldWithDefault(this, 3, "");
          };
          proto.stream.NoticeRoomProperty.prototype.getRoomproperty_asB64 = function() {
            return jspb.Message.bytesAsB64(this.getRoomproperty());
          };
          proto.stream.NoticeRoomProperty.prototype.getRoomproperty_asU8 = function() {
            return jspb.Message.bytesAsU8(this.getRoomproperty());
          };
          proto.stream.NoticeRoomProperty.prototype.setRoomproperty = function(value) {
            jspb.Message.setProto3BytesField(this, 3, value);
          };
          proto.stream.CmdId = {
            NOCMD: 0,
            LOGINREQ: 1101,
            LOGINRSP: 1102,
            LOGOUTREQ: 1105,
            LOGOUTRSP: 1106,
            HEARTBEATREQ: 1103,
            NETWORKSTATEREQ: 1120,
            NETWORKSTATERSP: 1121,
            NOTICENETWORKSTATEREQ: 1122,
            CREATEROOMREQ: 1203,
            CREATEROOMRSP: 1204,
            GETROOMLISTREQ: 1207,
            GETROOMLISTRSP: 1208,
            ROOMLISTEXREQ: 1215,
            ROOMLISTEXRSP: 1216,
            SETROOMPROPERTYREQ: 1219,
            SETROOMPROPERTYRSP: 1220,
            NOTICEROOMPROPERTY: 1307,
            GETROOMDETAILREQ: 1209,
            GETROOMDETAILRSP: 1210,
            JOINROOMREQ: 1201,
            JOINROOMRSP: 1202,
            NOTICEUSERJOINREQ: 1301,
            LEAVEROOMREQ: 1205,
            LEAVEROOMRSP: 1206,
            NOTICEUSERLEAVEREQ: 1302,
            JOINOVERREQ: 1213,
            JOINOVERRSP: 1214,
            JOINOVERNOTIFY: 1306,
            JOINOPENREQ: 1221,
            JOINOPENRSP: 1222,
            JOINOPENNOTIFY: 1308,
            DISCONNECTREQ: 1107,
            DISCONNECTRSP: 1108,
            KICKPLAYERREQ: 1303,
            KICKPLAYERRSP: 1304,
            KICKPLAYERNOTIFY: 1305
          };
          proto.stream.JoinRoomType = {
            NOJOIN: 0,
            JOINSPECIALROOM: 1,
            JOINROOMWITHPROPERTY: 2,
            JOINRANDOMROOM: 3
          };
          proto.stream.RoomState = {
            ROOMSTATENIL: 0,
            ROOMSTATEOPEN: 1,
            ROOMSTATECLOSED: 2
          };
          proto.stream.RoomListSort = {
            ROOMSORTNIL: 0,
            ROOMSORTCREATETIME: 1,
            ROOMSORTPLAYERNUM: 2,
            ROOMSORTSTATE: 3
          };
          proto.stream.SortOrder = {
            SORTASC: 0,
            SORTDESC: 1
          };
          goog.object.extend(exports, proto.stream);
        }, {
          "./errorcode_pb.js": 2,
          "google-protobuf": 1
        } ],
        5: [ function(_require, module, exports) {
          var jspb = _require("google-protobuf");
          var goog = jspb;
          var global = window;
          goog.exportSymbol("proto.stream.Broadcast", null, global);
          goog.exportSymbol("proto.stream.BroadcastAck", null, global);
          goog.exportSymbol("proto.stream.CheckIn", null, global);
          goog.exportSymbol("proto.stream.CheckInAck", null, global);
          goog.exportSymbol("proto.stream.CheckInNotify", null, global);
          goog.exportSymbol("proto.stream.FrameBroadcast", null, global);
          goog.exportSymbol("proto.stream.FrameBroadcastAck", null, global);
          goog.exportSymbol("proto.stream.FrameDataNotify", null, global);
          goog.exportSymbol("proto.stream.FrameSyncNotify", null, global);
          goog.exportSymbol("proto.stream.Heartbeat", null, global);
          goog.exportSymbol("proto.stream.HeartbeatAck", null, global);
          goog.exportSymbol("proto.stream.Notify", null, global);
          goog.exportSymbol("proto.stream.Publish", null, global);
          goog.exportSymbol("proto.stream.PublishAck", null, global);
          goog.exportSymbol("proto.stream.PublishNotify", null, global);
          goog.exportSymbol("proto.stream.SDKHotelCmdID", null, global);
          goog.exportSymbol("proto.stream.SetFrameSyncRate", null, global);
          goog.exportSymbol("proto.stream.SetFrameSyncRateAck", null, global);
          goog.exportSymbol("proto.stream.SetFrameSyncRateNotify", null, global);
          goog.exportSymbol("proto.stream.SetUseTimeStamp", null, global);
          goog.exportSymbol("proto.stream.SetUseTimeStampAck", null, global);
          goog.exportSymbol("proto.stream.Subscribe", null, global);
          goog.exportSymbol("proto.stream.SubscribeAck", null, global);
          proto.stream.CheckIn = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.CheckIn, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.CheckIn.displayName = "proto.stream.CheckIn");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.CheckIn.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.CheckIn.toObject(opt_includeInstance, this);
            };
            proto.stream.CheckIn.toObject = function(includeInstance, msg) {
              var f, obj = {
                gameid: jspb.Message.getFieldWithDefault(msg, 1, 0),
                roomid: jspb.Message.getFieldWithDefault(msg, 2, "0"),
                userid: jspb.Message.getFieldWithDefault(msg, 3, 0),
                bookid: jspb.Message.getFieldWithDefault(msg, 4, ""),
                key: jspb.Message.getFieldWithDefault(msg, 5, "")
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.CheckIn.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.CheckIn();
            return proto.stream.CheckIn.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.CheckIn.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint32();
                msg.setGameid(value);
                break;

               case 2:
                var value = reader.readUint64String();
                msg.setRoomid(value);
                break;

               case 3:
                var value = reader.readUint32();
                msg.setUserid(value);
                break;

               case 4:
                var value = reader.readString();
                msg.setBookid(value);
                break;

               case 5:
                var value = reader.readString();
                msg.setKey(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.CheckIn.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.CheckIn.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.CheckIn.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getGameid();
            0 !== f && writer.writeUint32(1, f);
            f = message.getRoomid();
            0 !== parseInt(f, 10) && writer.writeUint64String(2, f);
            f = message.getUserid();
            0 !== f && writer.writeUint32(3, f);
            f = message.getBookid();
            f.length > 0 && writer.writeString(4, f);
            f = message.getKey();
            f.length > 0 && writer.writeString(5, f);
          };
          proto.stream.CheckIn.prototype.getGameid = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.CheckIn.prototype.setGameid = function(value) {
            jspb.Message.setProto3IntField(this, 1, value);
          };
          proto.stream.CheckIn.prototype.getRoomid = function() {
            return jspb.Message.getFieldWithDefault(this, 2, "0");
          };
          proto.stream.CheckIn.prototype.setRoomid = function(value) {
            jspb.Message.setProto3StringIntField(this, 2, value);
          };
          proto.stream.CheckIn.prototype.getUserid = function() {
            return jspb.Message.getFieldWithDefault(this, 3, 0);
          };
          proto.stream.CheckIn.prototype.setUserid = function(value) {
            jspb.Message.setProto3IntField(this, 3, value);
          };
          proto.stream.CheckIn.prototype.getBookid = function() {
            return jspb.Message.getFieldWithDefault(this, 4, "");
          };
          proto.stream.CheckIn.prototype.setBookid = function(value) {
            jspb.Message.setProto3StringField(this, 4, value);
          };
          proto.stream.CheckIn.prototype.getKey = function() {
            return jspb.Message.getFieldWithDefault(this, 5, "");
          };
          proto.stream.CheckIn.prototype.setKey = function(value) {
            jspb.Message.setProto3StringField(this, 5, value);
          };
          proto.stream.CheckInAck = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, proto.stream.CheckInAck.repeatedFields_, null);
          };
          goog.inherits(proto.stream.CheckInAck, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.CheckInAck.displayName = "proto.stream.CheckInAck");
          proto.stream.CheckInAck.repeatedFields_ = [ 3, 4 ];
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.CheckInAck.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.CheckInAck.toObject(opt_includeInstance, this);
            };
            proto.stream.CheckInAck.toObject = function(includeInstance, msg) {
              var f, obj = {
                status: jspb.Message.getFieldWithDefault(msg, 1, 0),
                bookid: jspb.Message.getFieldWithDefault(msg, 2, ""),
                checkinsList: jspb.Message.getRepeatedField(msg, 3),
                playersList: jspb.Message.getRepeatedField(msg, 4),
                maxplayers: jspb.Message.getFieldWithDefault(msg, 5, 0)
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.CheckInAck.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.CheckInAck();
            return proto.stream.CheckInAck.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.CheckInAck.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint32();
                msg.setStatus(value);
                break;

               case 2:
                var value = reader.readString();
                msg.setBookid(value);
                break;

               case 3:
                var value = reader.readPackedUint32();
                msg.setCheckinsList(value);
                break;

               case 4:
                var value = reader.readPackedUint32();
                msg.setPlayersList(value);
                break;

               case 5:
                var value = reader.readUint32();
                msg.setMaxplayers(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.CheckInAck.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.CheckInAck.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.CheckInAck.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getStatus();
            0 !== f && writer.writeUint32(1, f);
            f = message.getBookid();
            f.length > 0 && writer.writeString(2, f);
            f = message.getCheckinsList();
            f.length > 0 && writer.writePackedUint32(3, f);
            f = message.getPlayersList();
            f.length > 0 && writer.writePackedUint32(4, f);
            f = message.getMaxplayers();
            0 !== f && writer.writeUint32(5, f);
          };
          proto.stream.CheckInAck.prototype.getStatus = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.CheckInAck.prototype.setStatus = function(value) {
            jspb.Message.setProto3IntField(this, 1, value);
          };
          proto.stream.CheckInAck.prototype.getBookid = function() {
            return jspb.Message.getFieldWithDefault(this, 2, "");
          };
          proto.stream.CheckInAck.prototype.setBookid = function(value) {
            jspb.Message.setProto3StringField(this, 2, value);
          };
          proto.stream.CheckInAck.prototype.getCheckinsList = function() {
            return jspb.Message.getRepeatedField(this, 3);
          };
          proto.stream.CheckInAck.prototype.setCheckinsList = function(value) {
            jspb.Message.setField(this, 3, value || []);
          };
          proto.stream.CheckInAck.prototype.addCheckins = function(value, opt_index) {
            jspb.Message.addToRepeatedField(this, 3, value, opt_index);
          };
          proto.stream.CheckInAck.prototype.clearCheckinsList = function() {
            this.setCheckinsList([]);
          };
          proto.stream.CheckInAck.prototype.getPlayersList = function() {
            return jspb.Message.getRepeatedField(this, 4);
          };
          proto.stream.CheckInAck.prototype.setPlayersList = function(value) {
            jspb.Message.setField(this, 4, value || []);
          };
          proto.stream.CheckInAck.prototype.addPlayers = function(value, opt_index) {
            jspb.Message.addToRepeatedField(this, 4, value, opt_index);
          };
          proto.stream.CheckInAck.prototype.clearPlayersList = function() {
            this.setPlayersList([]);
          };
          proto.stream.CheckInAck.prototype.getMaxplayers = function() {
            return jspb.Message.getFieldWithDefault(this, 5, 0);
          };
          proto.stream.CheckInAck.prototype.setMaxplayers = function(value) {
            jspb.Message.setProto3IntField(this, 5, value);
          };
          proto.stream.Heartbeat = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.Heartbeat, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.Heartbeat.displayName = "proto.stream.Heartbeat");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.Heartbeat.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.Heartbeat.toObject(opt_includeInstance, this);
            };
            proto.stream.Heartbeat.toObject = function(includeInstance, msg) {
              var f, obj = {
                gameid: jspb.Message.getFieldWithDefault(msg, 1, 0),
                roomid: jspb.Message.getFieldWithDefault(msg, 2, "0"),
                userid: jspb.Message.getFieldWithDefault(msg, 3, 0)
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.Heartbeat.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.Heartbeat();
            return proto.stream.Heartbeat.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.Heartbeat.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint32();
                msg.setGameid(value);
                break;

               case 2:
                var value = reader.readUint64String();
                msg.setRoomid(value);
                break;

               case 3:
                var value = reader.readUint32();
                msg.setUserid(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.Heartbeat.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.Heartbeat.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.Heartbeat.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getGameid();
            0 !== f && writer.writeUint32(1, f);
            f = message.getRoomid();
            0 !== parseInt(f, 10) && writer.writeUint64String(2, f);
            f = message.getUserid();
            0 !== f && writer.writeUint32(3, f);
          };
          proto.stream.Heartbeat.prototype.getGameid = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.Heartbeat.prototype.setGameid = function(value) {
            jspb.Message.setProto3IntField(this, 1, value);
          };
          proto.stream.Heartbeat.prototype.getRoomid = function() {
            return jspb.Message.getFieldWithDefault(this, 2, "0");
          };
          proto.stream.Heartbeat.prototype.setRoomid = function(value) {
            jspb.Message.setProto3StringIntField(this, 2, value);
          };
          proto.stream.Heartbeat.prototype.getUserid = function() {
            return jspb.Message.getFieldWithDefault(this, 3, 0);
          };
          proto.stream.Heartbeat.prototype.setUserid = function(value) {
            jspb.Message.setProto3IntField(this, 3, value);
          };
          proto.stream.HeartbeatAck = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.HeartbeatAck, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.HeartbeatAck.displayName = "proto.stream.HeartbeatAck");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.HeartbeatAck.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.HeartbeatAck.toObject(opt_includeInstance, this);
            };
            proto.stream.HeartbeatAck.toObject = function(includeInstance, msg) {
              var f, obj = {
                status: jspb.Message.getFieldWithDefault(msg, 1, 0)
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.HeartbeatAck.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.HeartbeatAck();
            return proto.stream.HeartbeatAck.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.HeartbeatAck.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint32();
                msg.setStatus(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.HeartbeatAck.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.HeartbeatAck.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.HeartbeatAck.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getStatus();
            0 !== f && writer.writeUint32(1, f);
          };
          proto.stream.HeartbeatAck.prototype.getStatus = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.HeartbeatAck.prototype.setStatus = function(value) {
            jspb.Message.setProto3IntField(this, 1, value);
          };
          proto.stream.Broadcast = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, proto.stream.Broadcast.repeatedFields_, null);
          };
          goog.inherits(proto.stream.Broadcast, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.Broadcast.displayName = "proto.stream.Broadcast");
          proto.stream.Broadcast.repeatedFields_ = [ 3 ];
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.Broadcast.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.Broadcast.toObject(opt_includeInstance, this);
            };
            proto.stream.Broadcast.toObject = function(includeInstance, msg) {
              var f, obj = {
                roomid: jspb.Message.getFieldWithDefault(msg, 1, "0"),
                flag: jspb.Message.getFieldWithDefault(msg, 2, 0),
                dstuidsList: jspb.Message.getRepeatedField(msg, 3),
                cpproto: msg.getCpproto_asB64()
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.Broadcast.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.Broadcast();
            return proto.stream.Broadcast.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.Broadcast.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint64String();
                msg.setRoomid(value);
                break;

               case 2:
                var value = reader.readUint32();
                msg.setFlag(value);
                break;

               case 3:
                var value = reader.readPackedUint32();
                msg.setDstuidsList(value);
                break;

               case 4:
                var value = reader.readBytes();
                msg.setCpproto(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.Broadcast.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.Broadcast.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.Broadcast.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getRoomid();
            0 !== parseInt(f, 10) && writer.writeUint64String(1, f);
            f = message.getFlag();
            0 !== f && writer.writeUint32(2, f);
            f = message.getDstuidsList();
            f.length > 0 && writer.writePackedUint32(3, f);
            f = message.getCpproto_asU8();
            f.length > 0 && writer.writeBytes(4, f);
          };
          proto.stream.Broadcast.prototype.getRoomid = function() {
            return jspb.Message.getFieldWithDefault(this, 1, "0");
          };
          proto.stream.Broadcast.prototype.setRoomid = function(value) {
            jspb.Message.setProto3StringIntField(this, 1, value);
          };
          proto.stream.Broadcast.prototype.getFlag = function() {
            return jspb.Message.getFieldWithDefault(this, 2, 0);
          };
          proto.stream.Broadcast.prototype.setFlag = function(value) {
            jspb.Message.setProto3IntField(this, 2, value);
          };
          proto.stream.Broadcast.prototype.getDstuidsList = function() {
            return jspb.Message.getRepeatedField(this, 3);
          };
          proto.stream.Broadcast.prototype.setDstuidsList = function(value) {
            jspb.Message.setField(this, 3, value || []);
          };
          proto.stream.Broadcast.prototype.addDstuids = function(value, opt_index) {
            jspb.Message.addToRepeatedField(this, 3, value, opt_index);
          };
          proto.stream.Broadcast.prototype.clearDstuidsList = function() {
            this.setDstuidsList([]);
          };
          proto.stream.Broadcast.prototype.getCpproto = function() {
            return jspb.Message.getFieldWithDefault(this, 4, "");
          };
          proto.stream.Broadcast.prototype.getCpproto_asB64 = function() {
            return jspb.Message.bytesAsB64(this.getCpproto());
          };
          proto.stream.Broadcast.prototype.getCpproto_asU8 = function() {
            return jspb.Message.bytesAsU8(this.getCpproto());
          };
          proto.stream.Broadcast.prototype.setCpproto = function(value) {
            jspb.Message.setProto3BytesField(this, 4, value);
          };
          proto.stream.BroadcastAck = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.BroadcastAck, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.BroadcastAck.displayName = "proto.stream.BroadcastAck");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.BroadcastAck.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.BroadcastAck.toObject(opt_includeInstance, this);
            };
            proto.stream.BroadcastAck.toObject = function(includeInstance, msg) {
              var f, obj = {
                status: jspb.Message.getFieldWithDefault(msg, 1, 0)
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.BroadcastAck.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.BroadcastAck();
            return proto.stream.BroadcastAck.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.BroadcastAck.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint32();
                msg.setStatus(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.BroadcastAck.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.BroadcastAck.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.BroadcastAck.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getStatus();
            0 !== f && writer.writeUint32(1, f);
          };
          proto.stream.BroadcastAck.prototype.getStatus = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.BroadcastAck.prototype.setStatus = function(value) {
            jspb.Message.setProto3IntField(this, 1, value);
          };
          proto.stream.CheckInNotify = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, proto.stream.CheckInNotify.repeatedFields_, null);
          };
          goog.inherits(proto.stream.CheckInNotify, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.CheckInNotify.displayName = "proto.stream.CheckInNotify");
          proto.stream.CheckInNotify.repeatedFields_ = [ 3, 4 ];
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.CheckInNotify.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.CheckInNotify.toObject(opt_includeInstance, this);
            };
            proto.stream.CheckInNotify.toObject = function(includeInstance, msg) {
              var f, obj = {
                userid: jspb.Message.getFieldWithDefault(msg, 1, 0),
                bookid: jspb.Message.getFieldWithDefault(msg, 2, ""),
                checkinsList: jspb.Message.getRepeatedField(msg, 3),
                playersList: jspb.Message.getRepeatedField(msg, 4),
                maxplayers: jspb.Message.getFieldWithDefault(msg, 5, 0)
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.CheckInNotify.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.CheckInNotify();
            return proto.stream.CheckInNotify.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.CheckInNotify.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint32();
                msg.setUserid(value);
                break;

               case 2:
                var value = reader.readString();
                msg.setBookid(value);
                break;

               case 3:
                var value = reader.readPackedUint32();
                msg.setCheckinsList(value);
                break;

               case 4:
                var value = reader.readPackedUint32();
                msg.setPlayersList(value);
                break;

               case 5:
                var value = reader.readUint32();
                msg.setMaxplayers(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.CheckInNotify.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.CheckInNotify.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.CheckInNotify.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getUserid();
            0 !== f && writer.writeUint32(1, f);
            f = message.getBookid();
            f.length > 0 && writer.writeString(2, f);
            f = message.getCheckinsList();
            f.length > 0 && writer.writePackedUint32(3, f);
            f = message.getPlayersList();
            f.length > 0 && writer.writePackedUint32(4, f);
            f = message.getMaxplayers();
            0 !== f && writer.writeUint32(5, f);
          };
          proto.stream.CheckInNotify.prototype.getUserid = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.CheckInNotify.prototype.setUserid = function(value) {
            jspb.Message.setProto3IntField(this, 1, value);
          };
          proto.stream.CheckInNotify.prototype.getBookid = function() {
            return jspb.Message.getFieldWithDefault(this, 2, "");
          };
          proto.stream.CheckInNotify.prototype.setBookid = function(value) {
            jspb.Message.setProto3StringField(this, 2, value);
          };
          proto.stream.CheckInNotify.prototype.getCheckinsList = function() {
            return jspb.Message.getRepeatedField(this, 3);
          };
          proto.stream.CheckInNotify.prototype.setCheckinsList = function(value) {
            jspb.Message.setField(this, 3, value || []);
          };
          proto.stream.CheckInNotify.prototype.addCheckins = function(value, opt_index) {
            jspb.Message.addToRepeatedField(this, 3, value, opt_index);
          };
          proto.stream.CheckInNotify.prototype.clearCheckinsList = function() {
            this.setCheckinsList([]);
          };
          proto.stream.CheckInNotify.prototype.getPlayersList = function() {
            return jspb.Message.getRepeatedField(this, 4);
          };
          proto.stream.CheckInNotify.prototype.setPlayersList = function(value) {
            jspb.Message.setField(this, 4, value || []);
          };
          proto.stream.CheckInNotify.prototype.addPlayers = function(value, opt_index) {
            jspb.Message.addToRepeatedField(this, 4, value, opt_index);
          };
          proto.stream.CheckInNotify.prototype.clearPlayersList = function() {
            this.setPlayersList([]);
          };
          proto.stream.CheckInNotify.prototype.getMaxplayers = function() {
            return jspb.Message.getFieldWithDefault(this, 5, 0);
          };
          proto.stream.CheckInNotify.prototype.setMaxplayers = function(value) {
            jspb.Message.setProto3IntField(this, 5, value);
          };
          proto.stream.Notify = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.Notify, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.Notify.displayName = "proto.stream.Notify");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.Notify.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.Notify.toObject(opt_includeInstance, this);
            };
            proto.stream.Notify.toObject = function(includeInstance, msg) {
              var f, obj = {
                srcuid: jspb.Message.getFieldWithDefault(msg, 1, 0),
                priority: jspb.Message.getFieldWithDefault(msg, 2, 0),
                cpproto: msg.getCpproto_asB64()
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.Notify.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.Notify();
            return proto.stream.Notify.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.Notify.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint32();
                msg.setSrcuid(value);
                break;

               case 2:
                var value = reader.readUint32();
                msg.setPriority(value);
                break;

               case 3:
                var value = reader.readBytes();
                msg.setCpproto(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.Notify.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.Notify.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.Notify.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getSrcuid();
            0 !== f && writer.writeUint32(1, f);
            f = message.getPriority();
            0 !== f && writer.writeUint32(2, f);
            f = message.getCpproto_asU8();
            f.length > 0 && writer.writeBytes(3, f);
          };
          proto.stream.Notify.prototype.getSrcuid = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.Notify.prototype.setSrcuid = function(value) {
            jspb.Message.setProto3IntField(this, 1, value);
          };
          proto.stream.Notify.prototype.getPriority = function() {
            return jspb.Message.getFieldWithDefault(this, 2, 0);
          };
          proto.stream.Notify.prototype.setPriority = function(value) {
            jspb.Message.setProto3IntField(this, 2, value);
          };
          proto.stream.Notify.prototype.getCpproto = function() {
            return jspb.Message.getFieldWithDefault(this, 3, "");
          };
          proto.stream.Notify.prototype.getCpproto_asB64 = function() {
            return jspb.Message.bytesAsB64(this.getCpproto());
          };
          proto.stream.Notify.prototype.getCpproto_asU8 = function() {
            return jspb.Message.bytesAsU8(this.getCpproto());
          };
          proto.stream.Notify.prototype.setCpproto = function(value) {
            jspb.Message.setProto3BytesField(this, 3, value);
          };
          proto.stream.Subscribe = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, proto.stream.Subscribe.repeatedFields_, null);
          };
          goog.inherits(proto.stream.Subscribe, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.Subscribe.displayName = "proto.stream.Subscribe");
          proto.stream.Subscribe.repeatedFields_ = [ 3, 4 ];
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.Subscribe.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.Subscribe.toObject(opt_includeInstance, this);
            };
            proto.stream.Subscribe.toObject = function(includeInstance, msg) {
              var f, obj = {
                gameid: jspb.Message.getFieldWithDefault(msg, 1, 0),
                roomid: jspb.Message.getFieldWithDefault(msg, 2, "0"),
                confirmsList: jspb.Message.getRepeatedField(msg, 3),
                cancelsList: jspb.Message.getRepeatedField(msg, 4)
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.Subscribe.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.Subscribe();
            return proto.stream.Subscribe.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.Subscribe.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint32();
                msg.setGameid(value);
                break;

               case 2:
                var value = reader.readUint64String();
                msg.setRoomid(value);
                break;

               case 3:
                var value = reader.readString();
                msg.addConfirms(value);
                break;

               case 4:
                var value = reader.readString();
                msg.addCancels(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.Subscribe.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.Subscribe.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.Subscribe.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getGameid();
            0 !== f && writer.writeUint32(1, f);
            f = message.getRoomid();
            0 !== parseInt(f, 10) && writer.writeUint64String(2, f);
            f = message.getConfirmsList();
            f.length > 0 && writer.writeRepeatedString(3, f);
            f = message.getCancelsList();
            f.length > 0 && writer.writeRepeatedString(4, f);
          };
          proto.stream.Subscribe.prototype.getGameid = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.Subscribe.prototype.setGameid = function(value) {
            jspb.Message.setProto3IntField(this, 1, value);
          };
          proto.stream.Subscribe.prototype.getRoomid = function() {
            return jspb.Message.getFieldWithDefault(this, 2, "0");
          };
          proto.stream.Subscribe.prototype.setRoomid = function(value) {
            jspb.Message.setProto3StringIntField(this, 2, value);
          };
          proto.stream.Subscribe.prototype.getConfirmsList = function() {
            return jspb.Message.getRepeatedField(this, 3);
          };
          proto.stream.Subscribe.prototype.setConfirmsList = function(value) {
            jspb.Message.setField(this, 3, value || []);
          };
          proto.stream.Subscribe.prototype.addConfirms = function(value, opt_index) {
            jspb.Message.addToRepeatedField(this, 3, value, opt_index);
          };
          proto.stream.Subscribe.prototype.clearConfirmsList = function() {
            this.setConfirmsList([]);
          };
          proto.stream.Subscribe.prototype.getCancelsList = function() {
            return jspb.Message.getRepeatedField(this, 4);
          };
          proto.stream.Subscribe.prototype.setCancelsList = function(value) {
            jspb.Message.setField(this, 4, value || []);
          };
          proto.stream.Subscribe.prototype.addCancels = function(value, opt_index) {
            jspb.Message.addToRepeatedField(this, 4, value, opt_index);
          };
          proto.stream.Subscribe.prototype.clearCancelsList = function() {
            this.setCancelsList([]);
          };
          proto.stream.SubscribeAck = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, proto.stream.SubscribeAck.repeatedFields_, null);
          };
          goog.inherits(proto.stream.SubscribeAck, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.SubscribeAck.displayName = "proto.stream.SubscribeAck");
          proto.stream.SubscribeAck.repeatedFields_ = [ 2 ];
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.SubscribeAck.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.SubscribeAck.toObject(opt_includeInstance, this);
            };
            proto.stream.SubscribeAck.toObject = function(includeInstance, msg) {
              var f, obj = {
                status: jspb.Message.getFieldWithDefault(msg, 1, 0),
                groupsList: jspb.Message.getRepeatedField(msg, 2)
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.SubscribeAck.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.SubscribeAck();
            return proto.stream.SubscribeAck.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.SubscribeAck.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint32();
                msg.setStatus(value);
                break;

               case 2:
                var value = reader.readString();
                msg.addGroups(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.SubscribeAck.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.SubscribeAck.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.SubscribeAck.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getStatus();
            0 !== f && writer.writeUint32(1, f);
            f = message.getGroupsList();
            f.length > 0 && writer.writeRepeatedString(2, f);
          };
          proto.stream.SubscribeAck.prototype.getStatus = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.SubscribeAck.prototype.setStatus = function(value) {
            jspb.Message.setProto3IntField(this, 1, value);
          };
          proto.stream.SubscribeAck.prototype.getGroupsList = function() {
            return jspb.Message.getRepeatedField(this, 2);
          };
          proto.stream.SubscribeAck.prototype.setGroupsList = function(value) {
            jspb.Message.setField(this, 2, value || []);
          };
          proto.stream.SubscribeAck.prototype.addGroups = function(value, opt_index) {
            jspb.Message.addToRepeatedField(this, 2, value, opt_index);
          };
          proto.stream.SubscribeAck.prototype.clearGroupsList = function() {
            this.setGroupsList([]);
          };
          proto.stream.Publish = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, proto.stream.Publish.repeatedFields_, null);
          };
          goog.inherits(proto.stream.Publish, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.Publish.displayName = "proto.stream.Publish");
          proto.stream.Publish.repeatedFields_ = [ 3 ];
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.Publish.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.Publish.toObject(opt_includeInstance, this);
            };
            proto.stream.Publish.toObject = function(includeInstance, msg) {
              var f, obj = {
                roomid: jspb.Message.getFieldWithDefault(msg, 1, "0"),
                priority: jspb.Message.getFieldWithDefault(msg, 2, 0),
                groupsList: jspb.Message.getRepeatedField(msg, 3),
                cpproto: msg.getCpproto_asB64()
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.Publish.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.Publish();
            return proto.stream.Publish.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.Publish.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint64String();
                msg.setRoomid(value);
                break;

               case 2:
                var value = reader.readUint32();
                msg.setPriority(value);
                break;

               case 3:
                var value = reader.readString();
                msg.addGroups(value);
                break;

               case 4:
                var value = reader.readBytes();
                msg.setCpproto(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.Publish.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.Publish.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.Publish.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getRoomid();
            0 !== parseInt(f, 10) && writer.writeUint64String(1, f);
            f = message.getPriority();
            0 !== f && writer.writeUint32(2, f);
            f = message.getGroupsList();
            f.length > 0 && writer.writeRepeatedString(3, f);
            f = message.getCpproto_asU8();
            f.length > 0 && writer.writeBytes(4, f);
          };
          proto.stream.Publish.prototype.getRoomid = function() {
            return jspb.Message.getFieldWithDefault(this, 1, "0");
          };
          proto.stream.Publish.prototype.setRoomid = function(value) {
            jspb.Message.setProto3StringIntField(this, 1, value);
          };
          proto.stream.Publish.prototype.getPriority = function() {
            return jspb.Message.getFieldWithDefault(this, 2, 0);
          };
          proto.stream.Publish.prototype.setPriority = function(value) {
            jspb.Message.setProto3IntField(this, 2, value);
          };
          proto.stream.Publish.prototype.getGroupsList = function() {
            return jspb.Message.getRepeatedField(this, 3);
          };
          proto.stream.Publish.prototype.setGroupsList = function(value) {
            jspb.Message.setField(this, 3, value || []);
          };
          proto.stream.Publish.prototype.addGroups = function(value, opt_index) {
            jspb.Message.addToRepeatedField(this, 3, value, opt_index);
          };
          proto.stream.Publish.prototype.clearGroupsList = function() {
            this.setGroupsList([]);
          };
          proto.stream.Publish.prototype.getCpproto = function() {
            return jspb.Message.getFieldWithDefault(this, 4, "");
          };
          proto.stream.Publish.prototype.getCpproto_asB64 = function() {
            return jspb.Message.bytesAsB64(this.getCpproto());
          };
          proto.stream.Publish.prototype.getCpproto_asU8 = function() {
            return jspb.Message.bytesAsU8(this.getCpproto());
          };
          proto.stream.Publish.prototype.setCpproto = function(value) {
            jspb.Message.setProto3BytesField(this, 4, value);
          };
          proto.stream.PublishAck = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.PublishAck, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.PublishAck.displayName = "proto.stream.PublishAck");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.PublishAck.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.PublishAck.toObject(opt_includeInstance, this);
            };
            proto.stream.PublishAck.toObject = function(includeInstance, msg) {
              var f, obj = {
                status: jspb.Message.getFieldWithDefault(msg, 1, 0),
                dstnum: jspb.Message.getFieldWithDefault(msg, 2, 0)
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.PublishAck.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.PublishAck();
            return proto.stream.PublishAck.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.PublishAck.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint32();
                msg.setStatus(value);
                break;

               case 2:
                var value = reader.readUint32();
                msg.setDstnum(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.PublishAck.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.PublishAck.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.PublishAck.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getStatus();
            0 !== f && writer.writeUint32(1, f);
            f = message.getDstnum();
            0 !== f && writer.writeUint32(2, f);
          };
          proto.stream.PublishAck.prototype.getStatus = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.PublishAck.prototype.setStatus = function(value) {
            jspb.Message.setProto3IntField(this, 1, value);
          };
          proto.stream.PublishAck.prototype.getDstnum = function() {
            return jspb.Message.getFieldWithDefault(this, 2, 0);
          };
          proto.stream.PublishAck.prototype.setDstnum = function(value) {
            jspb.Message.setProto3IntField(this, 2, value);
          };
          proto.stream.PublishNotify = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, proto.stream.PublishNotify.repeatedFields_, null);
          };
          goog.inherits(proto.stream.PublishNotify, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.PublishNotify.displayName = "proto.stream.PublishNotify");
          proto.stream.PublishNotify.repeatedFields_ = [ 3 ];
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.PublishNotify.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.PublishNotify.toObject(opt_includeInstance, this);
            };
            proto.stream.PublishNotify.toObject = function(includeInstance, msg) {
              var f, obj = {
                srcuid: jspb.Message.getFieldWithDefault(msg, 1, 0),
                priority: jspb.Message.getFieldWithDefault(msg, 2, 0),
                groupsList: jspb.Message.getRepeatedField(msg, 3),
                cpproto: msg.getCpproto_asB64()
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.PublishNotify.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.PublishNotify();
            return proto.stream.PublishNotify.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.PublishNotify.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint32();
                msg.setSrcuid(value);
                break;

               case 2:
                var value = reader.readUint32();
                msg.setPriority(value);
                break;

               case 3:
                var value = reader.readString();
                msg.addGroups(value);
                break;

               case 4:
                var value = reader.readBytes();
                msg.setCpproto(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.PublishNotify.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.PublishNotify.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.PublishNotify.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getSrcuid();
            0 !== f && writer.writeUint32(1, f);
            f = message.getPriority();
            0 !== f && writer.writeUint32(2, f);
            f = message.getGroupsList();
            f.length > 0 && writer.writeRepeatedString(3, f);
            f = message.getCpproto_asU8();
            f.length > 0 && writer.writeBytes(4, f);
          };
          proto.stream.PublishNotify.prototype.getSrcuid = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.PublishNotify.prototype.setSrcuid = function(value) {
            jspb.Message.setProto3IntField(this, 1, value);
          };
          proto.stream.PublishNotify.prototype.getPriority = function() {
            return jspb.Message.getFieldWithDefault(this, 2, 0);
          };
          proto.stream.PublishNotify.prototype.setPriority = function(value) {
            jspb.Message.setProto3IntField(this, 2, value);
          };
          proto.stream.PublishNotify.prototype.getGroupsList = function() {
            return jspb.Message.getRepeatedField(this, 3);
          };
          proto.stream.PublishNotify.prototype.setGroupsList = function(value) {
            jspb.Message.setField(this, 3, value || []);
          };
          proto.stream.PublishNotify.prototype.addGroups = function(value, opt_index) {
            jspb.Message.addToRepeatedField(this, 3, value, opt_index);
          };
          proto.stream.PublishNotify.prototype.clearGroupsList = function() {
            this.setGroupsList([]);
          };
          proto.stream.PublishNotify.prototype.getCpproto = function() {
            return jspb.Message.getFieldWithDefault(this, 4, "");
          };
          proto.stream.PublishNotify.prototype.getCpproto_asB64 = function() {
            return jspb.Message.bytesAsB64(this.getCpproto());
          };
          proto.stream.PublishNotify.prototype.getCpproto_asU8 = function() {
            return jspb.Message.bytesAsU8(this.getCpproto());
          };
          proto.stream.PublishNotify.prototype.setCpproto = function(value) {
            jspb.Message.setProto3BytesField(this, 4, value);
          };
          proto.stream.SetUseTimeStamp = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.SetUseTimeStamp, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.SetUseTimeStamp.displayName = "proto.stream.SetUseTimeStamp");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.SetUseTimeStamp.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.SetUseTimeStamp.toObject(opt_includeInstance, this);
            };
            proto.stream.SetUseTimeStamp.toObject = function(includeInstance, msg) {
              var f, obj = {
                gameid: jspb.Message.getFieldWithDefault(msg, 1, 0),
                roomid: jspb.Message.getFieldWithDefault(msg, 2, "0"),
                priority: jspb.Message.getFieldWithDefault(msg, 3, 0),
                usetimestamp: jspb.Message.getFieldWithDefault(msg, 4, false)
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.SetUseTimeStamp.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.SetUseTimeStamp();
            return proto.stream.SetUseTimeStamp.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.SetUseTimeStamp.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint32();
                msg.setGameid(value);
                break;

               case 2:
                var value = reader.readUint64String();
                msg.setRoomid(value);
                break;

               case 3:
                var value = reader.readUint32();
                msg.setPriority(value);
                break;

               case 4:
                var value = reader.readBool();
                msg.setUsetimestamp(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.SetUseTimeStamp.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.SetUseTimeStamp.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.SetUseTimeStamp.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getGameid();
            0 !== f && writer.writeUint32(1, f);
            f = message.getRoomid();
            0 !== parseInt(f, 10) && writer.writeUint64String(2, f);
            f = message.getPriority();
            0 !== f && writer.writeUint32(3, f);
            f = message.getUsetimestamp();
            f && writer.writeBool(4, f);
          };
          proto.stream.SetUseTimeStamp.prototype.getGameid = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.SetUseTimeStamp.prototype.setGameid = function(value) {
            jspb.Message.setProto3IntField(this, 1, value);
          };
          proto.stream.SetUseTimeStamp.prototype.getRoomid = function() {
            return jspb.Message.getFieldWithDefault(this, 2, "0");
          };
          proto.stream.SetUseTimeStamp.prototype.setRoomid = function(value) {
            jspb.Message.setProto3StringIntField(this, 2, value);
          };
          proto.stream.SetUseTimeStamp.prototype.getPriority = function() {
            return jspb.Message.getFieldWithDefault(this, 3, 0);
          };
          proto.stream.SetUseTimeStamp.prototype.setPriority = function(value) {
            jspb.Message.setProto3IntField(this, 3, value);
          };
          proto.stream.SetUseTimeStamp.prototype.getUsetimestamp = function() {
            return jspb.Message.getFieldWithDefault(this, 4, false);
          };
          proto.stream.SetUseTimeStamp.prototype.setUsetimestamp = function(value) {
            jspb.Message.setProto3BooleanField(this, 4, value);
          };
          proto.stream.SetUseTimeStampAck = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.SetUseTimeStampAck, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.SetUseTimeStampAck.displayName = "proto.stream.SetUseTimeStampAck");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.SetUseTimeStampAck.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.SetUseTimeStampAck.toObject(opt_includeInstance, this);
            };
            proto.stream.SetUseTimeStampAck.toObject = function(includeInstance, msg) {
              var f, obj = {
                status: jspb.Message.getFieldWithDefault(msg, 1, 0),
                timestamp: jspb.Message.getFieldWithDefault(msg, 2, 0)
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.SetUseTimeStampAck.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.SetUseTimeStampAck();
            return proto.stream.SetUseTimeStampAck.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.SetUseTimeStampAck.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint32();
                msg.setStatus(value);
                break;

               case 2:
                var value = reader.readUint64();
                msg.setTimestamp(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.SetUseTimeStampAck.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.SetUseTimeStampAck.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.SetUseTimeStampAck.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getStatus();
            0 !== f && writer.writeUint32(1, f);
            f = message.getTimestamp();
            0 !== f && writer.writeUint64(2, f);
          };
          proto.stream.SetUseTimeStampAck.prototype.getStatus = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.SetUseTimeStampAck.prototype.setStatus = function(value) {
            jspb.Message.setProto3IntField(this, 1, value);
          };
          proto.stream.SetUseTimeStampAck.prototype.getTimestamp = function() {
            return jspb.Message.getFieldWithDefault(this, 2, 0);
          };
          proto.stream.SetUseTimeStampAck.prototype.setTimestamp = function(value) {
            jspb.Message.setProto3IntField(this, 2, value);
          };
          proto.stream.SetFrameSyncRate = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.SetFrameSyncRate, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.SetFrameSyncRate.displayName = "proto.stream.SetFrameSyncRate");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.SetFrameSyncRate.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.SetFrameSyncRate.toObject(opt_includeInstance, this);
            };
            proto.stream.SetFrameSyncRate.toObject = function(includeInstance, msg) {
              var f, obj = {
                gameid: jspb.Message.getFieldWithDefault(msg, 1, 0),
                roomid: jspb.Message.getFieldWithDefault(msg, 2, "0"),
                priority: jspb.Message.getFieldWithDefault(msg, 3, 0),
                framerate: jspb.Message.getFieldWithDefault(msg, 4, 0),
                frameidx: jspb.Message.getFieldWithDefault(msg, 5, 0)
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.SetFrameSyncRate.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.SetFrameSyncRate();
            return proto.stream.SetFrameSyncRate.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.SetFrameSyncRate.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint32();
                msg.setGameid(value);
                break;

               case 2:
                var value = reader.readUint64String();
                msg.setRoomid(value);
                break;

               case 3:
                var value = reader.readUint32();
                msg.setPriority(value);
                break;

               case 4:
                var value = reader.readUint32();
                msg.setFramerate(value);
                break;

               case 5:
                var value = reader.readUint32();
                msg.setFrameidx(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.SetFrameSyncRate.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.SetFrameSyncRate.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.SetFrameSyncRate.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getGameid();
            0 !== f && writer.writeUint32(1, f);
            f = message.getRoomid();
            0 !== parseInt(f, 10) && writer.writeUint64String(2, f);
            f = message.getPriority();
            0 !== f && writer.writeUint32(3, f);
            f = message.getFramerate();
            0 !== f && writer.writeUint32(4, f);
            f = message.getFrameidx();
            0 !== f && writer.writeUint32(5, f);
          };
          proto.stream.SetFrameSyncRate.prototype.getGameid = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.SetFrameSyncRate.prototype.setGameid = function(value) {
            jspb.Message.setProto3IntField(this, 1, value);
          };
          proto.stream.SetFrameSyncRate.prototype.getRoomid = function() {
            return jspb.Message.getFieldWithDefault(this, 2, "0");
          };
          proto.stream.SetFrameSyncRate.prototype.setRoomid = function(value) {
            jspb.Message.setProto3StringIntField(this, 2, value);
          };
          proto.stream.SetFrameSyncRate.prototype.getPriority = function() {
            return jspb.Message.getFieldWithDefault(this, 3, 0);
          };
          proto.stream.SetFrameSyncRate.prototype.setPriority = function(value) {
            jspb.Message.setProto3IntField(this, 3, value);
          };
          proto.stream.SetFrameSyncRate.prototype.getFramerate = function() {
            return jspb.Message.getFieldWithDefault(this, 4, 0);
          };
          proto.stream.SetFrameSyncRate.prototype.setFramerate = function(value) {
            jspb.Message.setProto3IntField(this, 4, value);
          };
          proto.stream.SetFrameSyncRate.prototype.getFrameidx = function() {
            return jspb.Message.getFieldWithDefault(this, 5, 0);
          };
          proto.stream.SetFrameSyncRate.prototype.setFrameidx = function(value) {
            jspb.Message.setProto3IntField(this, 5, value);
          };
          proto.stream.SetFrameSyncRateAck = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.SetFrameSyncRateAck, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.SetFrameSyncRateAck.displayName = "proto.stream.SetFrameSyncRateAck");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.SetFrameSyncRateAck.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.SetFrameSyncRateAck.toObject(opt_includeInstance, this);
            };
            proto.stream.SetFrameSyncRateAck.toObject = function(includeInstance, msg) {
              var f, obj = {
                status: jspb.Message.getFieldWithDefault(msg, 1, 0)
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.SetFrameSyncRateAck.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.SetFrameSyncRateAck();
            return proto.stream.SetFrameSyncRateAck.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.SetFrameSyncRateAck.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint32();
                msg.setStatus(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.SetFrameSyncRateAck.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.SetFrameSyncRateAck.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.SetFrameSyncRateAck.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getStatus();
            0 !== f && writer.writeUint32(1, f);
          };
          proto.stream.SetFrameSyncRateAck.prototype.getStatus = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.SetFrameSyncRateAck.prototype.setStatus = function(value) {
            jspb.Message.setProto3IntField(this, 1, value);
          };
          proto.stream.SetFrameSyncRateNotify = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.SetFrameSyncRateNotify, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.SetFrameSyncRateNotify.displayName = "proto.stream.SetFrameSyncRateNotify");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.SetFrameSyncRateNotify.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.SetFrameSyncRateNotify.toObject(opt_includeInstance, this);
            };
            proto.stream.SetFrameSyncRateNotify.toObject = function(includeInstance, msg) {
              var f, obj = {
                priority: jspb.Message.getFieldWithDefault(msg, 1, 0),
                framerate: jspb.Message.getFieldWithDefault(msg, 2, 0),
                frameidx: jspb.Message.getFieldWithDefault(msg, 3, 0),
                timestamp: jspb.Message.getFieldWithDefault(msg, 4, "0")
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.SetFrameSyncRateNotify.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.SetFrameSyncRateNotify();
            return proto.stream.SetFrameSyncRateNotify.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.SetFrameSyncRateNotify.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint32();
                msg.setPriority(value);
                break;

               case 2:
                var value = reader.readUint32();
                msg.setFramerate(value);
                break;

               case 3:
                var value = reader.readUint32();
                msg.setFrameidx(value);
                break;

               case 4:
                var value = reader.readUint64String();
                msg.setTimestamp(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.SetFrameSyncRateNotify.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.SetFrameSyncRateNotify.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.SetFrameSyncRateNotify.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getPriority();
            0 !== f && writer.writeUint32(1, f);
            f = message.getFramerate();
            0 !== f && writer.writeUint32(2, f);
            f = message.getFrameidx();
            0 !== f && writer.writeUint32(3, f);
            f = message.getTimestamp();
            0 !== parseInt(f, 10) && writer.writeUint64String(4, f);
          };
          proto.stream.SetFrameSyncRateNotify.prototype.getPriority = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.SetFrameSyncRateNotify.prototype.setPriority = function(value) {
            jspb.Message.setProto3IntField(this, 1, value);
          };
          proto.stream.SetFrameSyncRateNotify.prototype.getFramerate = function() {
            return jspb.Message.getFieldWithDefault(this, 2, 0);
          };
          proto.stream.SetFrameSyncRateNotify.prototype.setFramerate = function(value) {
            jspb.Message.setProto3IntField(this, 2, value);
          };
          proto.stream.SetFrameSyncRateNotify.prototype.getFrameidx = function() {
            return jspb.Message.getFieldWithDefault(this, 3, 0);
          };
          proto.stream.SetFrameSyncRateNotify.prototype.setFrameidx = function(value) {
            jspb.Message.setProto3IntField(this, 3, value);
          };
          proto.stream.SetFrameSyncRateNotify.prototype.getTimestamp = function() {
            return jspb.Message.getFieldWithDefault(this, 4, "0");
          };
          proto.stream.SetFrameSyncRateNotify.prototype.setTimestamp = function(value) {
            jspb.Message.setProto3StringIntField(this, 4, value);
          };
          proto.stream.FrameBroadcast = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.FrameBroadcast, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.FrameBroadcast.displayName = "proto.stream.FrameBroadcast");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.FrameBroadcast.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.FrameBroadcast.toObject(opt_includeInstance, this);
            };
            proto.stream.FrameBroadcast.toObject = function(includeInstance, msg) {
              var f, obj = {
                roomid: jspb.Message.getFieldWithDefault(msg, 1, "0"),
                priority: jspb.Message.getFieldWithDefault(msg, 2, 0),
                cpproto: msg.getCpproto_asB64()
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.FrameBroadcast.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.FrameBroadcast();
            return proto.stream.FrameBroadcast.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.FrameBroadcast.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint64String();
                msg.setRoomid(value);
                break;

               case 2:
                var value = reader.readUint32();
                msg.setPriority(value);
                break;

               case 3:
                var value = reader.readBytes();
                msg.setCpproto(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.FrameBroadcast.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.FrameBroadcast.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.FrameBroadcast.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getRoomid();
            0 !== parseInt(f, 10) && writer.writeUint64String(1, f);
            f = message.getPriority();
            0 !== f && writer.writeUint32(2, f);
            f = message.getCpproto_asU8();
            f.length > 0 && writer.writeBytes(3, f);
          };
          proto.stream.FrameBroadcast.prototype.getRoomid = function() {
            return jspb.Message.getFieldWithDefault(this, 1, "0");
          };
          proto.stream.FrameBroadcast.prototype.setRoomid = function(value) {
            jspb.Message.setProto3StringIntField(this, 1, value);
          };
          proto.stream.FrameBroadcast.prototype.getPriority = function() {
            return jspb.Message.getFieldWithDefault(this, 2, 0);
          };
          proto.stream.FrameBroadcast.prototype.setPriority = function(value) {
            jspb.Message.setProto3IntField(this, 2, value);
          };
          proto.stream.FrameBroadcast.prototype.getCpproto = function() {
            return jspb.Message.getFieldWithDefault(this, 3, "");
          };
          proto.stream.FrameBroadcast.prototype.getCpproto_asB64 = function() {
            return jspb.Message.bytesAsB64(this.getCpproto());
          };
          proto.stream.FrameBroadcast.prototype.getCpproto_asU8 = function() {
            return jspb.Message.bytesAsU8(this.getCpproto());
          };
          proto.stream.FrameBroadcast.prototype.setCpproto = function(value) {
            jspb.Message.setProto3BytesField(this, 3, value);
          };
          proto.stream.FrameBroadcastAck = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.FrameBroadcastAck, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.FrameBroadcastAck.displayName = "proto.stream.FrameBroadcastAck");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.FrameBroadcastAck.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.FrameBroadcastAck.toObject(opt_includeInstance, this);
            };
            proto.stream.FrameBroadcastAck.toObject = function(includeInstance, msg) {
              var f, obj = {
                status: jspb.Message.getFieldWithDefault(msg, 1, 0)
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.FrameBroadcastAck.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.FrameBroadcastAck();
            return proto.stream.FrameBroadcastAck.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.FrameBroadcastAck.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint32();
                msg.setStatus(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.FrameBroadcastAck.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.FrameBroadcastAck.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.FrameBroadcastAck.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getStatus();
            0 !== f && writer.writeUint32(1, f);
          };
          proto.stream.FrameBroadcastAck.prototype.getStatus = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.FrameBroadcastAck.prototype.setStatus = function(value) {
            jspb.Message.setProto3IntField(this, 1, value);
          };
          proto.stream.FrameDataNotify = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.FrameDataNotify, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.FrameDataNotify.displayName = "proto.stream.FrameDataNotify");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.FrameDataNotify.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.FrameDataNotify.toObject(opt_includeInstance, this);
            };
            proto.stream.FrameDataNotify.toObject = function(includeInstance, msg) {
              var f, obj = {
                srcuid: jspb.Message.getFieldWithDefault(msg, 1, 0),
                priority: jspb.Message.getFieldWithDefault(msg, 2, 0),
                cpproto: msg.getCpproto_asB64(),
                timestamp: jspb.Message.getFieldWithDefault(msg, 4, "0"),
                frameidx: jspb.Message.getFieldWithDefault(msg, 5, 0)
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.FrameDataNotify.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.FrameDataNotify();
            return proto.stream.FrameDataNotify.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.FrameDataNotify.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint32();
                msg.setSrcuid(value);
                break;

               case 2:
                var value = reader.readUint32();
                msg.setPriority(value);
                break;

               case 3:
                var value = reader.readBytes();
                msg.setCpproto(value);
                break;

               case 4:
                var value = reader.readUint64String();
                msg.setTimestamp(value);
                break;

               case 5:
                var value = reader.readUint32();
                msg.setFrameidx(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.FrameDataNotify.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.FrameDataNotify.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.FrameDataNotify.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getSrcuid();
            0 !== f && writer.writeUint32(1, f);
            f = message.getPriority();
            0 !== f && writer.writeUint32(2, f);
            f = message.getCpproto_asU8();
            f.length > 0 && writer.writeBytes(3, f);
            f = message.getTimestamp();
            0 !== parseInt(f, 10) && writer.writeUint64String(4, f);
            f = message.getFrameidx();
            0 !== f && writer.writeUint32(5, f);
          };
          proto.stream.FrameDataNotify.prototype.getSrcuid = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.FrameDataNotify.prototype.setSrcuid = function(value) {
            jspb.Message.setProto3IntField(this, 1, value);
          };
          proto.stream.FrameDataNotify.prototype.getPriority = function() {
            return jspb.Message.getFieldWithDefault(this, 2, 0);
          };
          proto.stream.FrameDataNotify.prototype.setPriority = function(value) {
            jspb.Message.setProto3IntField(this, 2, value);
          };
          proto.stream.FrameDataNotify.prototype.getCpproto = function() {
            return jspb.Message.getFieldWithDefault(this, 3, "");
          };
          proto.stream.FrameDataNotify.prototype.getCpproto_asB64 = function() {
            return jspb.Message.bytesAsB64(this.getCpproto());
          };
          proto.stream.FrameDataNotify.prototype.getCpproto_asU8 = function() {
            return jspb.Message.bytesAsU8(this.getCpproto());
          };
          proto.stream.FrameDataNotify.prototype.setCpproto = function(value) {
            jspb.Message.setProto3BytesField(this, 3, value);
          };
          proto.stream.FrameDataNotify.prototype.getTimestamp = function() {
            return jspb.Message.getFieldWithDefault(this, 4, "0");
          };
          proto.stream.FrameDataNotify.prototype.setTimestamp = function(value) {
            jspb.Message.setProto3StringIntField(this, 4, value);
          };
          proto.stream.FrameDataNotify.prototype.getFrameidx = function() {
            return jspb.Message.getFieldWithDefault(this, 5, 0);
          };
          proto.stream.FrameDataNotify.prototype.setFrameidx = function(value) {
            jspb.Message.setProto3IntField(this, 5, value);
          };
          proto.stream.FrameSyncNotify = function(opt_data) {
            jspb.Message.initialize(this, opt_data, 0, -1, null, null);
          };
          goog.inherits(proto.stream.FrameSyncNotify, jspb.Message);
          goog.DEBUG && !COMPILED && (proto.stream.FrameSyncNotify.displayName = "proto.stream.FrameSyncNotify");
          if (jspb.Message.GENERATE_TO_OBJECT) {
            proto.stream.FrameSyncNotify.prototype.toObject = function(opt_includeInstance) {
              return proto.stream.FrameSyncNotify.toObject(opt_includeInstance, this);
            };
            proto.stream.FrameSyncNotify.toObject = function(includeInstance, msg) {
              var f, obj = {
                priority: jspb.Message.getFieldWithDefault(msg, 1, 0),
                lastidx: jspb.Message.getFieldWithDefault(msg, 2, 0),
                nextidx: jspb.Message.getFieldWithDefault(msg, 3, 0),
                startts: jspb.Message.getFieldWithDefault(msg, 4, "0"),
                endts: jspb.Message.getFieldWithDefault(msg, 5, "0"),
                timestamp: jspb.Message.getFieldWithDefault(msg, 6, "0")
              };
              includeInstance && (obj.$jspbMessageInstance = msg);
              return obj;
            };
          }
          proto.stream.FrameSyncNotify.deserializeBinary = function(bytes) {
            var reader = new jspb.BinaryReader(bytes);
            var msg = new proto.stream.FrameSyncNotify();
            return proto.stream.FrameSyncNotify.deserializeBinaryFromReader(msg, reader);
          };
          proto.stream.FrameSyncNotify.deserializeBinaryFromReader = function(msg, reader) {
            while (reader.nextField()) {
              if (reader.isEndGroup()) break;
              var field = reader.getFieldNumber();
              switch (field) {
               case 1:
                var value = reader.readUint32();
                msg.setPriority(value);
                break;

               case 2:
                var value = reader.readUint32();
                msg.setLastidx(value);
                break;

               case 3:
                var value = reader.readUint32();
                msg.setNextidx(value);
                break;

               case 4:
                var value = reader.readUint64String();
                msg.setStartts(value);
                break;

               case 5:
                var value = reader.readUint64String();
                msg.setEndts(value);
                break;

               case 6:
                var value = reader.readUint64String();
                msg.setTimestamp(value);
                break;

               default:
                reader.skipField();
              }
            }
            return msg;
          };
          proto.stream.FrameSyncNotify.prototype.serializeBinary = function() {
            var writer = new jspb.BinaryWriter();
            proto.stream.FrameSyncNotify.serializeBinaryToWriter(this, writer);
            return writer.getResultBuffer();
          };
          proto.stream.FrameSyncNotify.serializeBinaryToWriter = function(message, writer) {
            var f = void 0;
            f = message.getPriority();
            0 !== f && writer.writeUint32(1, f);
            f = message.getLastidx();
            0 !== f && writer.writeUint32(2, f);
            f = message.getNextidx();
            0 !== f && writer.writeUint32(3, f);
            f = message.getStartts();
            0 !== parseInt(f, 10) && writer.writeUint64String(4, f);
            f = message.getEndts();
            0 !== parseInt(f, 10) && writer.writeUint64String(5, f);
            f = message.getTimestamp();
            0 !== parseInt(f, 10) && writer.writeUint64String(6, f);
          };
          proto.stream.FrameSyncNotify.prototype.getPriority = function() {
            return jspb.Message.getFieldWithDefault(this, 1, 0);
          };
          proto.stream.FrameSyncNotify.prototype.setPriority = function(value) {
            jspb.Message.setProto3IntField(this, 1, value);
          };
          proto.stream.FrameSyncNotify.prototype.getLastidx = function() {
            return jspb.Message.getFieldWithDefault(this, 2, 0);
          };
          proto.stream.FrameSyncNotify.prototype.setLastidx = function(value) {
            jspb.Message.setProto3IntField(this, 2, value);
          };
          proto.stream.FrameSyncNotify.prototype.getNextidx = function() {
            return jspb.Message.getFieldWithDefault(this, 3, 0);
          };
          proto.stream.FrameSyncNotify.prototype.setNextidx = function(value) {
            jspb.Message.setProto3IntField(this, 3, value);
          };
          proto.stream.FrameSyncNotify.prototype.getStartts = function() {
            return jspb.Message.getFieldWithDefault(this, 4, "0");
          };
          proto.stream.FrameSyncNotify.prototype.setStartts = function(value) {
            jspb.Message.setProto3StringIntField(this, 4, value);
          };
          proto.stream.FrameSyncNotify.prototype.getEndts = function() {
            return jspb.Message.getFieldWithDefault(this, 5, "0");
          };
          proto.stream.FrameSyncNotify.prototype.setEndts = function(value) {
            jspb.Message.setProto3StringIntField(this, 5, value);
          };
          proto.stream.FrameSyncNotify.prototype.getTimestamp = function() {
            return jspb.Message.getFieldWithDefault(this, 6, "0");
          };
          proto.stream.FrameSyncNotify.prototype.setTimestamp = function(value) {
            jspb.Message.setProto3StringIntField(this, 6, value);
          };
          proto.stream.SDKHotelCmdID = {
            INVALIDSDKCMD: 0,
            CHECKINCMDID: 1401,
            CHECKINACKCMDID: 1402,
            HEARTBEATCMDID: 1403,
            HEARTBEATACKCMDID: 1404,
            BROADCASTCMDID: 1405,
            BROADCASTACKCMDID: 1406,
            NOTIFYCMDID: 1408,
            CHECKINNOTIFYCMDID: 1410,
            SUBSCRIBECMDID: 1411,
            SUBSCRIBEACKCMDID: 1412,
            PUBLISHCMDID: 1413,
            PUBLISHACKCMDID: 1414,
            PUBLISHNOTIFYCMDID: 1416
          };
          goog.object.extend(exports, proto.stream);
        }, {
          "google-protobuf": 1
        } ]
      }, {}, [ 3 ]);
      var MvsCode = {
        NoLogin: -2,
        CODE_201: 201,
        CODE_400: 400,
        CODE_401: 401,
        CODE_402: 402,
        CODE_403: 403,
        CODE_404: 404,
        CODE_405: 405,
        CODE_406: 406,
        CODE_500: 500,
        CODE_502: 502,
        CODE_503: 503,
        CODE_504: 504,
        CODE_507: 507,
        CODE_521: 521,
        CODE_522: 522,
        CODE_527: 527,
        CODE_1000: 1e3,
        NetWorkErr: 1001,
        CODE_1005: 1005,
        DataParseErr: 1606
      };
      var MvsErrMsg = new function() {
        this[MvsCode.NoLogin] = "you are not logined, please reference [http://www.matchvs.com/service?page=js]";
        this[MvsCode.NetWorkErr] = "network error, please reference [http://www.matchvs.com/service?page=egretGuide]";
        this[MvsCode.CODE_1000] = "netwrk closed normal ";
        this[MvsCode.CODE_1005] = "netwrk closed no status ";
        this[MvsCode.DataParseErr] = "you data parse error ";
        this[MvsCode.CODE_400] = "bad request ";
        this[MvsCode.CODE_401] = "invaild appkey ";
        this[MvsCode.CODE_402] = "invaild sign [http://www.matchvs.com/service?page=js]";
        this[MvsCode.CODE_403] = "forbidden";
        this[MvsCode.CODE_404] = "not found anything, please reference [ http://www.matchvs.com/service?page=js ]";
        this[MvsCode.CODE_405] = "room have full, please reference [ http://www.matchvs.com/service?page=js ]";
        this[MvsCode.CODE_406] = "room had joinOver, please reference [ http://www.matchvs.com/service?page=js ]";
        this[MvsCode.CODE_500] = "server error, please reference [ http://www.matchvs.com/service?page=egretGuide ]";
        this[MvsCode.CODE_502] = "service stoped,the license expires or the account is in arrears. please reference [ http://www.matchvs.com/price ]";
        this[MvsCode.CODE_503] = "the ccu exceed the limit. please reference [ http://www.matchvs.com/price ]";
        this[MvsCode.CODE_504] = "your traffic is running out today,please recharge [ http://www.matchvs.com/price ]";
        this[MvsCode.CODE_507] = "room does not exist";
        this[MvsCode.CODE_521] = "gameServer not exist, please check your gameserver is ok http://www.matchvs.com/service?page=gameServer";
        this[MvsCode.CODE_522] = "frame sync is close, please call the api 'setFrameSync' [http://www.matchvs.com/service?page=js]";
        this[MvsCode.CODE_527] = "sending message too often ,  can't exceed 500 times per second";
        this[MvsCode.CODE_201] = "reconnect not in room http://www.matchvs.com/service?page=js";
      }();
      function MsCreateRoomInfo(roomName, maxPlayer, mode, canWatch, visibility, roomProperty) {
        this.roomName = roomName;
        this.maxPlayer = maxPlayer;
        this.mode = mode;
        this.canWatch = canWatch;
        this.visibility = visibility;
        this.roomProperty = roomProperty;
        this.toString = function() {
          return "roomName:" + this.roomName + " maxPlayer:" + this.maxPlayer + " mode:" + this.mode + " canWatch:" + this.canWatch + " visibility:" + this.visibility + " roomProperty:" + this.roomProperty;
        };
        MatchvsLog.logI(this + " MsCreateRoomInfo:" + JSON.stringify(this));
      }
      function MsEnum() {}
      MsEnum.JoinRoomType = {
        NoJoin: 0,
        joinSpecialRoom: 1,
        joinRoomWithProperty: 2,
        joinRandomRoom: 3,
        reconnect: 4
      };
      function MsRoomJoin(joinType, userID, roomID, gameID, maxPlayer, mode, canWatch, userProfile, tags) {
        this.joinType = joinType;
        this.userID = userID;
        this.roomID = roomID;
        this.gameID = gameID;
        this.maxPlayer = maxPlayer;
        this.mode = mode;
        this.canWatch = canWatch;
        this.tags = tags;
        this.userProfile = userProfile;
        MatchvsLog.logI(this + " MsRoomJoin:" + JSON.stringify(this));
      }
      function MsJoinOverRsp(status, cpProto) {
        this.status = status;
        this.cpProto = cpProto;
        MatchvsLog.logI(this + " MsJoinOverRsp:" + JSON.stringify(this));
      }
      function MsJoinOverNotifyInfo(roomID, srcUserID, cpProto) {
        this.roomID = roomID;
        this.srcUserID = srcUserID;
        this.cpProto = cpProto;
        MatchvsLog.logI(this + " MsJoinOverNotifyInfo:" + JSON.stringify(this));
      }
      function MsCreateRoomRsp(status, roomID, owner) {
        this.status = status;
        this.roomID = roomID;
        this.owner = owner;
        MatchvsLog.logI(this + " MsCreateRoomRsp:" + JSON.stringify(this));
      }
      function MsCheckIn(gameID, roomID, userID, bookID, book_key, hotelInfo) {
        this.gameID = gameID;
        this.roomID = roomID;
        this.userID = userID;
        this.bookID = bookID;
        this.bookKey = book_key;
        this.hotelInfo = hotelInfo;
      }
      function MsMatchInfo(maxplayer, mode, canWatch, tags) {
        this.maxPlayer = maxplayer;
        this.mode = mode;
        this.canWatch = canWatch;
        this.tags = {};
        this.tags = tags;
        MatchvsLog.logI(this + " MsMatchInfo:" + JSON.stringify(this));
      }
      function MsRoomInfo(roomID, roomProperty, ownerID, state) {
        this.roomID = roomID;
        this.roomProperty = roomProperty;
        this.ownerId = ownerID;
        this.owner = ownerID;
        this.state = state;
        MatchvsLog.logI(this + " MsRoomInfo:" + JSON.stringify(this));
      }
      function MsRoomUserInfo(userID, userProfile) {
        this.userId = userID;
        this.userID = userID;
        this.userProfile = userProfile;
        MatchvsLog.logI(this + " MsRoomUserInfo:" + JSON.stringify(this));
      }
      function MsLeaveRoomRsp(status, roomID, userID, cpProto) {
        this.status = status;
        this.roomID = roomID;
        this.userId = userID;
        this.userID = userID;
        this.cpProto = cpProto;
        MatchvsLog.logI(this + " MsLeaveRoomRsp:" + JSON.stringify(this));
      }
      function MsLeaveRoomNotify(roomID, userID, owner, cpProto) {
        this.userId = userID;
        this.userID = userID;
        this.roomID = roomID;
        this.owner = owner;
        this.cpProto = cpProto;
        MatchvsLog.logI(this + " MsLeaveRoomNotify:" + JSON.stringify(this));
      }
      function MsSubscribeEventGroupRsp(status, groups) {
        this.status = status;
        this.groups = groups;
      }
      function MsSendEventGroupNotify(srcUserID, groups, cpProto) {
        this.srcUid = srcUserID;
        this.srcUserID = srcUserID;
        this.groups = groups;
        this.cpProto = cpProto;
      }
      function MsRegistRsp(status, userID, token, name, avatar) {
        this.status = status;
        this.id = userID;
        this.userID = userID;
        this.token = token;
        this.name = name;
        this.avatar = avatar;
        MatchvsLog.logI("MsRegistRsp:" + JSON.stringify(this));
      }
      function MsLoginRsp(status, roomID) {
        this.status = status;
        this.roomID = roomID;
        MatchvsLog.logI("MsLoginRsp::" + JSON.stringify(this));
      }
      function MsPublicMemberArgs(channle, platform, userID, token, gameID, gameVersion, appkey, secretKey, deviceID, gatewayID) {
        this.userID = userID;
        this.token = token;
        this.gameID = gameID;
        this.gameVersion = gameVersion;
        this.appKey = appkey;
        this.secretKey = secretKey;
        this.deviceID = deviceID;
        this.gatewayID = gatewayID;
        this.channel = channle;
        this.platform = platform;
        MatchvsLog.logI(this + ":" + JSON.stringify(this));
      }
      function MsCheckInNotify(userID, checkins, players, maxPlayer) {
        this.userID = userID;
        this.checkins = checkins;
        this.players = players;
        this.maxPlayers = maxPlayer;
        this.maxPlayer = maxPlayer;
        MatchvsLog.logI(this + ":" + JSON.stringify(this));
      }
      function MsSendEventNotify(srcUserID, cpProto) {
        this.srcUserId = srcUserID;
        this.srcUserID = srcUserID;
        this.cpProto = cpProto;
      }
      function MsGameServerNotifyInfo(srcUserID, cpProto) {
        this.srcUserId = srcUserID;
        this.srcUserID = srcUserID;
        this.cpProto = cpProto;
      }
      function MsSendEventRsp(status, sequence) {
        this.status = status;
        this.sequence = sequence;
      }
      function MsRoomInfoEx(roomID, roomName, maxplayer, mode, canWatch, roomProperty) {
        this.roomID = roomID;
        this.roomName = roomName;
        this.maxPlayer = maxplayer;
        this.mode = mode;
        this.canWatch = canWatch;
        this.roomProperty = roomProperty;
        MatchvsLog.logI(" MsRoomInfoEx:" + JSON.stringify(this));
      }
      function MsRoomListRsp(status, roomInfos) {
        this.status = status;
        this.roomInfos = roomInfos;
        MatchvsLog.logI(this + " MsRoomListRsp:" + JSON.stringify(this));
      }
      function MsKickPlayerNotify(userID, srcUserID, data, owner) {
        this.userId = userID;
        this.userID = userID;
        this.srcUserId = srcUserID;
        this.srcUserID = srcUserID;
        this.cpProto = data;
        this.owner = owner;
        MatchvsLog.logI(this + " MsKickPlayerNotify:" + JSON.stringify(this));
      }
      function MsKickPlayerRsp(status, owner, userID) {
        this.status = status;
        this.owner = owner;
        this.userID = userID;
        MatchvsLog.logI(this + " MsKickPlayerRsp:" + JSON.stringify(this));
      }
      function MsSetChannelFrameSyncRsp(status) {
        this.status = status;
      }
      function MsSendFrameEventRsp(status) {
        this.status = status;
      }
      function MsRoomFilter(maxPlayer, mode, canWatch, roomProperty) {
        this.maxPlayer = maxPlayer;
        this.mode = mode;
        this.canWatch = canWatch;
        this.roomProperty = roomProperty;
        MatchvsLog.logI(this + " MsRoomFilter:" + JSON.stringify(this));
      }
      function MsRoomFilterEx(maxPlayer, mode, canWatch, roomProperty, full, state, sort, order, pageNo, pageSize) {
        this.maxPlayer = maxPlayer;
        this.mode = mode;
        this.canWatch = canWatch;
        this.roomProperty = roomProperty;
        this.full = full;
        this.state = state;
        this.sort = sort;
        this.order = order;
        this.pageNo = pageNo;
        this.pageSize = pageSize || 10;
        MatchvsLog.logI(this + " MsRoomFilterEx:" + JSON.stringify(this));
      }
      function MsGetRoomDetailRsp(status, state, maxPlayer, mode, canWatch, roomProperty, owner, createFlag, userInfos) {
        this.status = status;
        this.state = state;
        this.maxPlayer = maxPlayer;
        this.mode = mode;
        this.canWatch = canWatch;
        this.roomProperty = roomProperty;
        this.owner = owner;
        this.createFlag = createFlag;
        this.userInfos = [];
        this.userInfos = userInfos;
        MatchvsLog.logI(this + " MsGetRoomDetailRsp:" + JSON.stringify(this));
      }
      function MsRoomAttribute(roomID, roomName, maxPlayer, gamePlayer, watchPlaer, mode, canWatch, roomProperty, owner, state, createTime) {
        this.roomID = roomID;
        this.roomName = roomName;
        this.maxPlayer = maxPlayer;
        this.gamePlayer = gamePlayer;
        this.watchPlayer = watchPlaer;
        this.mode = mode;
        this.canWatch = canWatch;
        this.roomProperty = roomProperty;
        this.owner = owner;
        this.state = state;
        this.createTime = createTime;
        MatchvsLog.logI(this + " MsRoomAttribute:" + JSON.stringify(this));
      }
      function MsGetRoomListExRsp(status, total, roomAttrs) {
        this.status = status;
        this.total = total;
        this.roomAttrs = [];
        this.roomAttrs = roomAttrs;
        MatchvsLog.logI(this + " MsGetRoomListExRsp:" + JSON.stringify(this));
      }
      function MsFrameItem(srcUserID, cpProto, timestamp) {
        this.srcUserID = srcUserID;
        this.cpProto = cpProto;
        this.timestamp = timestamp;
      }
      function MsFrameData(frameIndex, frameItems, frameWaitCount) {
        this.frameIndex = frameIndex;
        this.frameItems = frameItems;
        this.frameWaitCount = frameWaitCount;
      }
      function MsNetworkStateNotify(roomID, userID, state, owner) {
        this.roomID = roomID;
        this.userID = userID;
        this.state = state;
        this.owner = owner;
      }
      function MsSetRoomPropertyRspInfo(status, roomID, userID, roomProperty) {
        this.status = status;
        this.roomID = roomID;
        this.userID = userID;
        this.roomProperty = roomProperty;
        MatchvsLog.logI(this + " MsSetRoomPropertyRspInfo:" + JSON.stringify(this));
      }
      function MsRoomPropertyNotifyInfo(roomID, userID, roomProperty) {
        this.roomID = roomID;
        this.userID = userID;
        this.roomProperty = roomProperty;
        MatchvsLog.logI(this + " MsRoomPropertyNotifyInfo:" + JSON.stringify(this));
      }
      function MsHeartBeatResponse(gameID, gsExist) {
        this.gameID = gameID;
        this.gsExist = gsExist;
      }
      function MsGatewaySpeedResponse(Status, Seq) {
        this.status = Status;
        this.seq = Seq;
      }
      function MsReopenRoomResponse(Status, cpProto) {
        this.status = Status;
        this.cpProto = cpProto;
        MatchvsLog.logI(this + " MsReopenRoomResponse:" + JSON.stringify(this));
      }
      function MsReopenRoomNotify(roomID, userID, cpProto) {
        this.roomID = roomID;
        this.userID = userID;
        this.cpProto = cpProto;
        MatchvsLog.logI(this + " MsReopenRoomNotify:" + JSON.stringify(this));
      }
      function MatchvsNetWorkCallBack() {
        this.onMsg = function(buf) {};
        this.onErr = function(errCode, errMsg) {};
      }
      var MatchvsNetWork;
      var MatchvsHttp;
      try {
        if ("undefined" !== typeof wx) {
          console.log("network api->WX");
          MatchvsNetWork = function MatchvsNetWork(host, callback) {
            this.socket = wx.connectSocket({
              url: host,
              header: {
                engine: "WeiXinGame"
              }
            });
            this.socketOpen = false;
            var socketMsgQueue = [];
            var mCallBack = callback;
            var mHost = host;
            var that = this;
            this.close = function() {
              this.socket && this.socket.close({
                code: 1e3,
                reason: "normal"
              });
            };
            this.send = function(msg) {
              this.socketOpen ? this.socket.send({
                data: msg.buffer
              }) : socketMsgQueue.length < 100 && socketMsgQueue.push(msg);
            };
            this.socket.onOpen(function(res) {
              MatchvsLog.logI("[wx.WebSocket][connect]:" + res);
              that.socketOpen = true;
              while (socketMsgQueue.length > 0) that.send(socketMsgQueue.pop());
              mCallBack.onConnect && mCallBack.onConnect(mHost);
            });
            this.socket.onClose(function(e) {
              that.socketOpen = false;
              mCallBack.onDisConnect && mCallBack.onDisConnect(mHost, e);
              MatchvsLog.logI("[wx.WebSocket] [onClose] case:" + JSON.stringify(e));
            });
            this.socket.onMessage(function(res) {
              var dataView = new DataView(res.data);
              mCallBack.onMsg(dataView);
            });
            this.socket.onError(function(event) {
              mCallBack.onDisConnect && mCallBack.onDisConnect(mHost, event);
              MatchvsLog.logI("[wx.WebSocket] [onError] case:" + JSON.stringify(event));
            });
          };
          MatchvsHttp = function MatchvsHttp(callback) {
            this.mCallback = callback;
            function send(url, callback, isPost, params) {
              var contentType = isPost ? "application/json" : "application/x-www-form-urlencoded";
              wx.request({
                url: url,
                data: params,
                header: {
                  "content-type": contentType
                },
                success: function success(res) {
                  var rsp = JSON.stringify(res.data);
                  MatchvsLog.logI("http success:" + rsp);
                  callback.onMsg(rsp);
                },
                fail: function fail(res) {
                  MatchvsLog.logI("http fail:" + res.errMsg);
                  callback.onErr(0, res.errMsg);
                }
              });
            }
            this.get = function(url) {
              send(url, this.mCallback, false, null);
            };
            this.post = function(url, params) {
              send(url, this.mCallback, true, params);
            };
          };
        } else if ("undefined" !== typeof BK) {
          console.log("network api->BK");
          MatchvsNetWork = function MatchvsNetWork(host, callback) {
            var mCallBack = callback;
            var mHost = host;
            var socketMsgQueue = [];
            var socketOpen = false;
            var socket = new BK.WebSocket(host);
            var that = this;
            this.send = function(msg) {
              socketOpen ? socket.send(msg.buffer) : socketMsgQueue.length < 100 && socketMsgQueue.push(msg);
            };
            this.close = function() {
              socket && socket.close();
            };
            socket.onOpen = function(res) {
              socketOpen = true;
              MatchvsLog.logI("[BK.WebSocket][connect]:" + res);
              while (socketMsgQueue.length > 0) that.send(socketMsgQueue.pop());
              mCallBack.onConnect && mCallBack.onConnect(mHost);
            };
            socket.onClose = function(res) {
              socketOpen = false;
              var e = {
                code: 1e3,
                message: " close normal"
              };
              mCallBack.onDisConnect && mCallBack.onDisConnect(mHost, e);
              MatchvsLog.logI("[BK.WebSocket] [onClose] case:" + JSON.stringify(res));
            };
            socket.onError = function(err) {
              if (socket && socketOpen) {
                socketOpen = false;
                socket.close();
              }
              var e = {
                code: err.getErrorCode(),
                message: err.getErrorString()
              };
              mCallBack.onDisConnect && mCallBack.onDisConnect(mHost, e);
              MatchvsLog.logI("[BK.WebSocket] [onError] case:" + JSON.stringify(err));
            };
            socket.onMessage = function(res, data) {
              var buf = data.data;
              buf.rewind();
              var ab = new ArrayBuffer(buf.length);
              var dataView = new DataView(ab);
              while (!buf.eof) dataView.setUint8(buf.pointer, buf.readUint8Buffer());
              mCallBack.onMsg && mCallBack.onMsg(dataView);
            };
            socket && socket.connect();
          };
          MatchvsHttp = function MatchvsHttp(callback) {
            this.mCallback = callback;
            function send(url, call, isPost, params) {
              var http = new BK.HttpUtil(url);
              http.setHttpMethod(isPost ? "post" : "get");
              http.setHttpHeader("Content-type", "application/x-www-form-urlencoded");
              http.requestAsync(function(res, code) {
                if (200 === code) {
                  var dt = res.readAsString(true);
                  call.onMsg(dt);
                  MatchvsLog.logI("[HTTP:](" + url + ")+" + dt);
                } else call.onErr(code, res.readAsString(true));
              });
              isPost ? http.setHttpPostData(params) : http.setHttpUrl(url);
            }
            this.get = function(url) {
              send(url, this.mCallback, false, null);
            };
            this.post = function(url, params) {
              send(url, this.mCallback, true, params);
            };
          };
        } else {
          console.log("network api->browser");
          MatchvsNetWork = function MatchvsNetWork(host, callback) {
            this.socket = null;
            this.mCallBack = callback;
            this.mHost = host;
            var bufQueue = [];
            this.send = function(message) {
              if (!window.WebSocket) return;
              if (isIE()) {
                var uint8A = new Uint8Array(message.buffer.byteLength);
                for (var i = 0; i < uint8A.length; i++) uint8A[i] = message.getUint8(i);
                message = uint8A;
              }
              this.socket.readyState === WebSocket.OPEN ? this.socket.send(message.buffer) : bufQueue.push(message);
            };
            this.close = function() {
              this.socket && ("undefined" !== typeof cc && "undefined" !== typeof cc.Component ? this.socket.close() : this.socket.close(1e3, ""));
            };
            window.WebSocket || (window.WebSocket = window.MozWebSocket);
            if (window.WebSocket) {
              this.socket = new WebSocket(host);
              this.socket.hashcode = new Date().getMilliseconds();
              MatchvsLog.logI("try to create a socket:" + this.mHost + " socket is " + this.socket.hashcode);
              this.socket.onmessage = function(event) {
                if ("undefined" !== typeof FileReader && event.data instanceof Blob) {
                  var reader = new FileReader();
                  reader.readAsArrayBuffer(event.data);
                  reader.onload = function(evt) {
                    if (evt.target.readyState === FileReader.DONE) {
                      var dataView = new DataView(reader.result);
                      this.mCallBack.onMsg(dataView);
                    } else this.mCallBack.onErr(MvsCode.DataParseErr, "[err]parse fail");
                  }.bind(this);
                } else if (event.data instanceof ArrayBuffer) {
                  var dataView = new DataView(event.data);
                  this.mCallBack.onMsg(dataView);
                } else {
                  console.log("[error] unknown event :" + event + " => " + JSON.stringify(event));
                  this.mCallBack.onErr(MvsCode.DataParseErr, "[err]parse fail");
                }
              }.bind(this);
              this.socket.onopen = function(event) {
                MatchvsLog.logI("Create the socket is success :" + this.mHost + " socket is " + this.socket.hashcode);
                while (bufQueue.length > 0) this.send(bufQueue.pop());
                this.mCallBack.onConnect && this.mCallBack.onConnect(this.mHost);
              }.bind(this);
              this.socket.onclose = function(e) {
                "undefined" !== typeof cc && "undefined" !== typeof cc.Component && (e = {
                  code: 1e3,
                  reason: "jsb friend close "
                });
                MatchvsLog.logI("socket on closed ,code:" + e.code + "(1000:NORMAL,1005:CLOSE_NO_STATUS,1006:RESET,1009:CLOSE_TOO_LARGE) err:" + JSON.stringify(e));
                this.mCallBack.onDisConnect && this.mCallBack.onDisConnect(this.mHost, e);
              }.bind(this);
              this.socket.onerror = function(event) {
                MatchvsLog.logI("socket on error ,event:" + JSON.stringify(event));
                this.mCallBack.onDisConnect && this.mCallBack.onDisConnect(this.mHost, event);
              }.bind(this);
            } else alert("Not Support the WebSocket\uff01");
          };
          MatchvsHttp = function MatchvsHttp(callback) {
            this.mCallback = callback;
            function send(url, callback, isPost, params) {
              var http = new XMLHttpRequest();
              http.open(isPost ? "POST" : "GET", url, true);
              http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
              http.onreadystatechange = function() {
                if (4 === http.readyState) if (200 === http.status) {
                  callback.onMsg(http.responseText);
                  MatchvsLog.logI("[HTTP:](" + url + ")+" + http.responseText);
                } else callback.onErr(http.status, http.statusText);
              };
              isPost ? http.send(params) : http.send(null);
            }
            this.get = function(url) {
              send(url, this.mCallback, false, null);
            };
            this.post = function(url, params) {
              send(url, this.mCallback, true, params);
            };
          };
        }
      } catch (e) {
        console.warn("network adapter warning:" + e.message);
      }
      var MATCHVS_USER_GATEWAY_SPEED_REQ = 1001;
      var MATCHVS_USER_GATEWAY_SPEED_RSP = 1002;
      var MATCHVS_USER_LOGIN_REQ = 1101;
      var MATCHVS_USER_LOGIN_RSP = 1102;
      var MATCHVS_USER_HEARTBEAT_REQ = 1103;
      var MATCHVS_USER_HEARTBEAT_RSP = 1103;
      var MATCHVS_NOTICE_USER_RELOGIN = 1104;
      var MATCHVS_USER_LOGOUT_REQ = 1105;
      var MATCHVS_USER_LOGOUT_RSP = 1106;
      var MATCHVS_NETWORK_STATE_NOTIFY = 1122;
      var MATCHVS_ROOM_CREATE_REQ = 1203;
      var MATCHVS_ROOM_CREATE_RSP = 1204;
      var MATCHVS_ROOM_JOIN_REQ = 1201;
      var MATCHVS_ROOM_JOIN_RSP = 1202;
      var MATCHVS_ROOM_JOIN_OVER_REQ = 1213;
      var MATCHVS_ROOM_JOIN_OVER_RSP = 1214;
      var MATCHVS_ROOM_JOIN_OVER_NOTIFY = 1306;
      var MATCHVS_ROOM_LEAVE_REQ = 1205;
      var MATCHVS_ROOM_LEAVE_RSP = 1206;
      var MATCHVS_ROOM_NOTICE_USER_JOIN = 1301;
      var MATCHVS_ROOM_NOTICE_USER_LEAVE = 1302;
      var MATCHVS_ROOM_CHECK_IN_REQ = 1401;
      var MATCHVS_ROOM_CHECK_IN_RSP = 1402;
      var MATCHVS_HEARTBEAT_HOTEL_REQ = 1403;
      var MATCHVS_HEARTBEAT_HOTEL_RSP = 1404;
      var MATCHVS_BROADCAST_HOTEL_REQ = 1405;
      var MATCHVS_BROADCAST_HOTEL_RSP = 1406;
      var MATCHVS_HOTEL_NOTIFY = 1408;
      var MATCHVS_ROOM_CHECKIN_NOTIFY = 1410;
      var CMD_GET_ROOM_LIST_REQ = 1207;
      var CMD_GET_ROOM_LIST_RSP = 1208;
      var CMD_GET_ROOM_DETAIL_REQ = 1209;
      var CMD_GET_ROOM_DETAIL_RSP = 1210;
      var CMD_GET_ROOM_LIST_EX_REQ = 1215;
      var CMD_GET_ROOM_LIST_EX_RSP = 1216;
      var CMD_SET_ROOM_PROPERTY_REQ = 1219;
      var CMD_SET_ROOM_PROPERTY_RSP = 1220;
      var CMD_SET_ROOM_PROPERTY_NOTIFY = 1307;
      var CMD_DISCONNECT_REQ = 1107;
      var CMD_DISCONNECT_RSP = 1108;
      var CMD_KICK_PLAYER_REQ = 1303;
      var CMD_KICK_PLAYER_RSP = 1304;
      var CMD_KICK_PLAYER_NOTIFY = 1305;
      var CMD_SUBSCRIBE_CMDID = 1411;
      var CMD_SUBSCRIBE_ACK_CMDID = 1412;
      var CMD_PUBLISH_CMDID = 1413;
      var CMD_PUBLISH_ACKCMDID = 1414;
      var CMD_PUBLISH_NOTIFYCMDID = 1416;
      var CMD_SET_USE_TIMESTAMP_CMDID = 1417;
      var CMD_SET_USE_TIMESTAMPACK_CMDID = 1418;
      var CMD_SET_FRAME_SYNCRATE_CMDID = 1419;
      var CMD_SET_FRAME_SYNCRATEACK_CMDID = 1420;
      var CMD_SET_FRAME_SYNCRATENOTIFY_CMDID = 1422;
      var CMD_FRAME_BROADCAST_CMDID = 1423;
      var CMD_FRAME_BROADCASTACK_CMDID = 1424;
      var CMD_FRAME_DATANOTIFY_CMDID = 1426;
      var CMD_FRAME_SYNCNOTIFY_CMDID = 1428;
      var CMD_ROOM_JOIN_OPEN_REQ = 1221;
      var CMD_ROOM_JOIN_OPEN_RSP = 1222;
      var CMD_ROOM_JOIN_OPEN_NOT = 1308;
      var FIXED_HEAD_SIZE = 16;
      var VERSION = 2;
      function Packet() {
        var header;
        var payload;
        var buf;
      }
      function MatchvsHeader() {
        this.size = 0;
        this.seq = 0;
        this.cmd = 0;
        this.version = 0;
        this.userID = 0;
        this.toString = function() {
          return " this.size   " + this.size + " this.seq    " + this.seq + " this.cmd    " + this.cmd + " this.version" + this.version + " this.userID " + this.userID;
        };
      }
      function MatchvsProtoMap() {
        return MatchvsProtoMap.prototype;
      }
      var MsProtoMapDesc = new MatchvsProtoMap();
      MsProtoMapDesc[MATCHVS_USER_LOGIN_RSP] = proto.stream.LoginRsp;
      MsProtoMapDesc[MATCHVS_USER_LOGIN_RSP] = proto.stream.LoginRsp;
      MsProtoMapDesc[MATCHVS_ROOM_JOIN_RSP] = proto.stream.JoinRoomRsp;
      MsProtoMapDesc[MATCHVS_ROOM_CHECK_IN_RSP] = proto.stream.CheckInAck;
      MsProtoMapDesc[MATCHVS_ROOM_CREATE_RSP] = proto.stream.CreateRoomRsp;
      MsProtoMapDesc[MATCHVS_ROOM_CHECKIN_NOTIFY] = proto.stream.CheckInNotify;
      MsProtoMapDesc[MATCHVS_ROOM_JOIN_OVER_RSP] = proto.stream.JoinOverRsp;
      MsProtoMapDesc[MATCHVS_ROOM_LEAVE_RSP] = proto.stream.LeaveRoomRsp;
      MsProtoMapDesc[MATCHVS_ROOM_NOTICE_USER_JOIN] = proto.stream.NoticeJoin;
      MsProtoMapDesc[MATCHVS_HEARTBEAT_HOTEL_RSP] = proto.stream.HeartbeatAck;
      MsProtoMapDesc[MATCHVS_ROOM_NOTICE_USER_LEAVE] = proto.stream.NoticeLeave;
      MsProtoMapDesc[MATCHVS_BROADCAST_HOTEL_RSP] = proto.stream.BroadcastAck;
      MsProtoMapDesc[CMD_SUBSCRIBE_ACK_CMDID] = proto.stream.SubscribeAck;
      MsProtoMapDesc[MATCHVS_HOTEL_NOTIFY] = proto.stream.Notify;
      MsProtoMapDesc[CMD_PUBLISH_ACKCMDID] = proto.stream.PublishAck;
      MsProtoMapDesc[CMD_PUBLISH_NOTIFYCMDID] = proto.stream.PublishNotify;
      MsProtoMapDesc[MATCHVS_USER_HEARTBEAT_RSP] = proto.stream.HeartbeatRsp;
      MsProtoMapDesc[CMD_GET_ROOM_LIST_RSP] = proto.stream.GetRoomListRsp;
      MsProtoMapDesc[MATCHVS_USER_LOGOUT_RSP] = proto.stream.LogoutRsp;
      MsProtoMapDesc[CMD_DISCONNECT_RSP] = proto.stream.DisconnectRsp;
      MsProtoMapDesc[CMD_KICK_PLAYER_NOTIFY] = proto.stream.KickPlayerNotify;
      MsProtoMapDesc[CMD_KICK_PLAYER_RSP] = proto.stream.KickPlayerRsp;
      MsProtoMapDesc[CMD_SET_FRAME_SYNCRATEACK_CMDID] = proto.stream.SetFrameSyncRateAck;
      MsProtoMapDesc[CMD_FRAME_BROADCASTACK_CMDID] = proto.stream.FrameBroadcastAck;
      MsProtoMapDesc[CMD_SET_FRAME_SYNCRATENOTIFY_CMDID] = proto.stream.SetFrameSyncRateNotify;
      MsProtoMapDesc[CMD_FRAME_DATANOTIFY_CMDID] = proto.stream.FrameDataNotify;
      MsProtoMapDesc[MATCHVS_NETWORK_STATE_NOTIFY] = proto.stream.NetworkStateNotify;
      MsProtoMapDesc[CMD_FRAME_SYNCNOTIFY_CMDID] = proto.stream.FrameSyncNotify;
      MsProtoMapDesc[CMD_GET_ROOM_LIST_EX_RSP] = proto.stream.GetRoomListExRsp;
      MsProtoMapDesc[MATCHVS_ROOM_JOIN_OVER_NOTIFY] = proto.stream.JoinOverNotify;
      MsProtoMapDesc[CMD_GET_ROOM_DETAIL_RSP] = proto.stream.GetRoomDetailRsp;
      MsProtoMapDesc[CMD_SET_ROOM_PROPERTY_RSP] = proto.stream.SetRoomPropertyRsp;
      MsProtoMapDesc[CMD_ROOM_JOIN_OPEN_RSP] = proto.stream.JoinOpenRsp;
      MsProtoMapDesc[CMD_SET_ROOM_PROPERTY_NOTIFY] = proto.stream.NoticeRoomProperty;
      MsProtoMapDesc[CMD_ROOM_JOIN_OPEN_NOT] = proto.stream.JoinOpenNotify;
      function MatchvsProtocol() {
        this.seq = 1;
        var mUserID = 0;
        this.msProtoMap = new MatchvsProtoMap();
        this.fillHeader = function(dataArray, cmd) {
          var buffer = new ArrayBuffer(FIXED_HEAD_SIZE + dataArray.length);
          var dataView = new DataView(buffer);
          dataView.setInt32(0, buffer.byteLength, true);
          dataView.setInt32(4, this.seq++, true);
          dataView.setInt16(8, cmd, true);
          dataView.setInt16(10, VERSION, true);
          dataView.setInt32(12, Number(mUserID), true);
          var length = dataArray.length;
          for (var i = 0; i < length; i++) dataView.setUint8(i + FIXED_HEAD_SIZE, dataArray[i]);
          return dataView;
        };
        this.parseHeader = function(msg) {
          var dataView = msg;
          var head = new MatchvsHeader();
          head.size = dataView.getInt32(0, true);
          head.seq = dataView.getInt32(4, true);
          head.cmd = dataView.getInt16(8, true);
          head.version = dataView.getInt16(10, true);
          head.userID = dataView.getInt32(12, true);
          return head;
        };
        this.handleMsg = function(msg) {
          var dataView = msg;
          var header = this.parseHeader(msg);
          var ext = new Uint8Array(header.size - FIXED_HEAD_SIZE);
          for (var i = 0; i < ext.length; i++) ext[i] = msg.getUint8(FIXED_HEAD_SIZE + i);
          var protoMap = MsProtoMapDesc[header.cmd];
          var packet = new Packet();
          packet.header = header;
          packet.buf = dataView;
          protoMap ? packet.payload = protoMap.deserializeBinary && protoMap.deserializeBinary(msg.buffer.slice(FIXED_HEAD_SIZE, msg.buffer.byteLength)) : MatchvsLog.logI("[WARN]unknown msg,Head:" + header);
          return packet;
        };
        this.init = function() {};
        this.login = function(userID, userToken, gameID, gameVersion, app_key, app_secret, deviceID, gateway_id) {
          var toMd5 = format("%s&UserID=%s&GameID=%s&VersionSdk=%d&%s", app_key, userID, gameID, VERSION, app_secret);
          mUserID = userID;
          var md5 = hex_md5(toMd5);
          MatchvsLog.logI("[Sign]" + toMd5 + "->" + md5);
          var message = new proto.stream.LoginReq();
          message.setGameid(Number(gameID));
          message.setAppkey(app_key);
          message.setDeviceid(deviceID);
          message.setSign(md5);
          var dataArray = message.serializeBinary();
          MatchvsLog.logI("[REQ]login...userID:" + userID);
          return this.fillHeader(dataArray, MATCHVS_USER_LOGIN_REQ);
        };
        this.speed = function(userID, gameID, userToken, versionSDK, gameVersion) {
          var buffer = new ArrayBuffer(49);
          var dataView = new DataView(buffer);
          var _user = Number(userID);
          var _gameID = Number(gameID);
          dataView.setUint32(0, _user, true);
          dataView.setUint32(4, _gameID, true);
          for (var i = 0; i < 32; i++) dataView.setUint8(8 + i, userToken.charCodeAt(i));
          dataView.setUint16(40, versionSDK, true);
          dataView.setUint16(42, gameVersion, true);
          dataView.setUint32(44, 1, true);
          dataView.setUint8(48, 1);
          var array = new Uint8Array(dataView.byteLength);
          for (var j = 0; j < dataView.byteLength; j++) array[j] = dataView.getUint8(j);
          return this.fillHeader(array, MATCHVS_USER_GATEWAY_SPEED_REQ);
        };
        this.roomCreate = function(maxUser, flag, gameID, pRoomInfo, pPlayInfo) {
          var message = new proto.stream.CreateRoom();
          message.setGameid(Number(gameID));
          var pi = new proto.stream.PlayerInfo();
          pi.setUserid(pPlayInfo.userID);
          pi.setUserprofile(stringToUtf8ByteArray(pPlayInfo.userProfile));
          message.setPlayerinfo(pi);
          var roomInfo = new proto.stream.RoomInfo();
          roomInfo.setMaxplayer(Number(pRoomInfo.maxPlayer));
          roomInfo.setCanwatch(pRoomInfo.canWatch);
          roomInfo.setMode(pRoomInfo.mode);
          roomInfo.setVisibility(pRoomInfo.visibility);
          roomInfo.setRoomname(pRoomInfo.roomName);
          roomInfo.setRoomproperty(stringToUtf8ByteArray(pRoomInfo.roomProperty));
          message.setRoominfo(roomInfo);
          var bytes = message.serializeBinary();
          return this.fillHeader(bytes, MATCHVS_ROOM_CREATE_REQ);
        };
        this.joinRandomRoom = function(roomJoin) {
          var message = new proto.stream.JoinRoomReq();
          message.setGameid(Number(roomJoin.gameID));
          message.setJointype(proto.stream.JoinRoomType.JOINRANDOMROOM);
          message.setCpproto(stringToUtf8ByteArray(roomJoin.userProfile));
          var playInfo = new proto.stream.PlayerInfo();
          playInfo.setUserid(roomJoin.userID);
          playInfo.setUserprofile(stringToUtf8ByteArray(roomJoin.userProfile));
          message.setPlayerinfo(playInfo);
          var roomInfo = new proto.stream.RoomInfo();
          roomInfo.setMaxplayer(roomJoin.maxPlayer);
          roomInfo.setCanwatch(roomJoin.canWatch);
          roomInfo.setMode(roomJoin.mode);
          roomInfo.setVisibility(0);
          message.setRoominfo(roomInfo);
          var bytes = message.serializeBinary();
          return this.fillHeader(bytes, MATCHVS_ROOM_JOIN_REQ);
        };
        this.joinRoomSpecial = function(roomJoin) {
          var message = new proto.stream.JoinRoomReq();
          message.setGameid(Number(roomJoin.gameID));
          message.setJointype(roomJoin.joinType);
          message.setCpproto(stringToUtf8ByteArray(roomJoin.userProfile));
          var playInfo = new proto.stream.PlayerInfo();
          playInfo.setUserid(roomJoin.userID);
          playInfo.setUserprofile(stringToUtf8ByteArray(roomJoin.userProfile));
          message.setPlayerinfo(playInfo);
          var roomInfo = new proto.stream.RoomInfo();
          roomInfo.setMaxplayer(roomJoin.maxPlayer);
          roomInfo.setCanwatch(roomJoin.canWatch);
          roomInfo.setMode(roomJoin.mode);
          roomInfo.setVisibility(0);
          roomInfo.setRoomid(roomJoin.roomID);
          message.setRoominfo(roomInfo);
          var bytes = message.serializeBinary();
          return this.fillHeader(bytes, MATCHVS_ROOM_JOIN_REQ);
        };
        this.joinRoomWithProperties = function(roomJoin) {
          var message = new proto.stream.JoinRoomReq();
          var kvtags = [];
          var temp = roomJoin.tags;
          var num = 0;
          for (var k in temp) {
            var tag = new proto.stream.keyValue();
            tag.setKey(k);
            tag.setValue(temp[k]);
            kvtags[num++] = tag;
          }
          message.setTagsList(kvtags);
          message.setGameid(roomJoin.gameID);
          message.setJointype(proto.stream.JoinRoomType.JOINROOMWITHPROPERTY);
          message.setCpproto(stringToUtf8ByteArray(roomJoin.userProfile));
          var playInfo = new proto.stream.PlayerInfo();
          playInfo.setUserid(roomJoin.userID);
          playInfo.setUserprofile(stringToUtf8ByteArray(roomJoin.userProfile));
          message.setPlayerinfo(playInfo);
          var roomInfo = new proto.stream.RoomInfo();
          roomInfo.setMaxplayer(roomJoin.maxPlayer);
          roomInfo.setCanwatch(roomJoin.canWatch);
          roomInfo.setMode(roomJoin.mode);
          roomInfo.setVisibility(0);
          roomInfo.setRoomid(roomJoin.roomID);
          message.setRoominfo(roomInfo);
          var bytes = message.serializeBinary();
          return this.fillHeader(bytes, MATCHVS_ROOM_JOIN_REQ);
        };
        this.roomCheckIn = function(bookInfo, roomInfo, userID, gameID) {
          var pkg = new proto.stream.CheckIn();
          pkg.setGameid(Number(gameID));
          pkg.setRoomid(roomInfo.getRoomid());
          pkg.setUserid(Number(userID));
          pkg.setBookid(bookInfo.getBookid());
          pkg.setKey(bookInfo.getBookkey());
          var bytes = pkg.serializeBinary();
          return this.fillHeader(bytes, MATCHVS_ROOM_CHECK_IN_REQ);
        };
        this.getRoomList = function(gameID, filter) {
          var pkg = new proto.stream.GetRoomList();
          var roomFilter = new proto.stream.RoomFilter();
          roomFilter.setCanwatch(filter.canWatch);
          roomFilter.setMaxplayer(filter.maxPlayer);
          roomFilter.setMode(Number(filter.mode));
          roomFilter.setRoomproperty(stringToUtf8ByteArray(filter.roomProperty));
          pkg.setGameid(gameID);
          pkg.setRoomfilter(roomFilter);
          var bytes = pkg.serializeBinary();
          return this.fillHeader(bytes, CMD_GET_ROOM_LIST_REQ);
        };
        this.getRoomListEx = function(gameID, filter) {
          var pkg = new proto.stream.GetRoomListExReq();
          var roomFilter = new proto.stream.RoomFilter();
          roomFilter.setMaxplayer(filter.maxPlayer);
          roomFilter.setMode(Number(filter.mode));
          roomFilter.setFull(filter.full);
          roomFilter.setCanwatch(filter.canWatch);
          roomFilter.setRoomproperty(stringToUtf8ByteArray(filter.roomProperty));
          roomFilter.setState(filter.state);
          pkg.setGameid(gameID);
          pkg.setRoomfilter(roomFilter);
          pkg.setSort(filter.sort);
          pkg.setOrder(filter.order);
          pkg.setPageno(filter.pageNo);
          pkg.setPagesize(filter.pageSize);
          var bytes = pkg.serializeBinary();
          return this.fillHeader(bytes, CMD_GET_ROOM_LIST_EX_REQ);
        };
        this.getRoomDetail = function(gameID, roomID) {
          var pkg = new proto.stream.GetRoomDetailReq();
          pkg.setGameid(gameID);
          pkg.setRoomid(roomID);
          var bytes = pkg.serializeBinary();
          return this.fillHeader(bytes, CMD_GET_ROOM_DETAIL_REQ);
        };
        this.joinOver = function(gameID, roomID, cpproto, userID) {
          var pkg = new proto.stream.JoinOverReq();
          pkg.setGameid(gameID);
          pkg.setRoomid(roomID);
          pkg.setCpproto(cpproto);
          pkg.setUserid(userID);
          var bytes = pkg.serializeBinary();
          return this.fillHeader(bytes, MATCHVS_ROOM_JOIN_OVER_REQ);
        };
        this.leaveRoom = function(gameID, userID, roomID, cpproto) {
          var pkg = new proto.stream.LeaveRoomReq();
          pkg.setGameid(gameID);
          pkg.setUserid(userID);
          pkg.setRoomid(roomID);
          pkg.setCpproto(stringToUtf8ByteArray(cpproto));
          var bytes = pkg.serializeBinary();
          return this.fillHeader(bytes, MATCHVS_ROOM_LEAVE_REQ);
        };
      }
      function PlayerInfo(userID, userProfile) {
        this.userID = userID;
        this.userProfile = userProfile;
      }
      function RoomInfo(roomID, roomName, maxPlayer, mode, canWatch, visibility, roomProperty, owner) {
        this.roomID = roomID;
        this.roomName = roomName;
        this.maxPlayer = maxPlayer;
        this.mode = mode;
        this.canWatch = canWatch;
        this.visibility = visibility;
        this.roomProperty = roomProperty;
        this.owner = owner;
      }
      MatchvsProtocol.prototype.heartBeat = function(gameID, roomID) {
        var pkg = new proto.stream.HeartbeatReq();
        pkg.setGameid(gameID);
        pkg.setRoomid(roomID);
        var dataArray = pkg.serializeBinary();
        return this.fillHeader(dataArray, MATCHVS_USER_HEARTBEAT_REQ);
      };
      MatchvsProtocol.prototype.logout = function(cpProto) {
        var buf = stringToUtf8ByteArray(cpProto);
        return this.fillHeader(buf, MATCHVS_USER_LOGOUT_REQ);
      };
      MatchvsProtocol.prototype.broadCast = function(roomID, destUids, destType, msgType, data) {
        var broadcast = new proto.stream.Broadcast();
        broadcast.setRoomid(roomID);
        broadcast.setDstuidsList(destUids);
        broadcast.setCpproto(data);
        var priority = 2;
        var flag = ((15 & priority) << 4) + ((3 & destType) << 2) + (3 & msgType);
        broadcast.setFlag(flag);
        var bytes = broadcast.serializeBinary();
        return this.fillHeader(bytes, MATCHVS_BROADCAST_HOTEL_REQ);
      };
      MatchvsProtocol.prototype.subscribeEventGroup = function(gameID, roomID, confirms, cancels) {
        var subscribe = new proto.stream.Subscribe();
        subscribe.setRoomid(roomID);
        subscribe.setGameid(gameID);
        subscribe.setCancelsList(cancels);
        subscribe.setConfirmsList(confirms);
        var bytes = subscribe.serializeBinary();
        return this.fillHeader(bytes, CMD_SUBSCRIBE_CMDID);
      };
      MatchvsProtocol.prototype.sendEventGroup = function(userID, roomID, priority, groups, cpproto) {
        var sendevnt = new proto.stream.Publish();
        sendevnt.setRoomid(roomID);
        sendevnt.setPriority(priority);
        sendevnt.setCpproto(stringToUtf8ByteArray(cpproto));
        sendevnt.setGroupsList(groups);
        var bytes = sendevnt.serializeBinary();
        return this.fillHeader(bytes, CMD_PUBLISH_CMDID);
      };
      MatchvsProtocol.prototype.hotelHeartBeat = function(gameID, roomID, userID) {
        var heartbeat = new proto.stream.Heartbeat();
        heartbeat.setGameid(gameID);
        heartbeat.setRoomid(roomID);
        heartbeat.setUserid(userID);
        var bytes = heartbeat.serializeBinary();
        return this.fillHeader(bytes, MATCHVS_HEARTBEAT_HOTEL_REQ);
      };
      MatchvsProtocol.prototype.disConnect = function(userID, gameID, roomId) {
        var paker = new proto.stream.DisconnectReq();
        paker.setGameid(gameID);
        paker.setRoomid(roomId);
        paker.setUserid(userID);
        var bytes = paker.serializeBinary();
        return this.fillHeader(bytes, CMD_DISCONNECT_REQ);
      };
      MatchvsProtocol.prototype.kickPlayer = function(userid, srcUserId, roomid, data) {
        var kick = new proto.stream.KickPlayer();
        kick.setRoomid(roomid);
        kick.setSrcuserid(srcUserId);
        kick.setUserid(userid);
        kick.setCpproto(stringToUtf8ByteArray(data));
        var bytes = kick.serializeBinary();
        return this.fillHeader(bytes, CMD_KICK_PLAYER_REQ);
      };
      MatchvsProtocol.prototype.setFrameSync = function(frameRate, roomID, gameID, priority, frameidx) {
        var reqEx = new proto.stream.SetFrameSyncRate();
        reqEx.setGameid(gameID);
        reqEx.setRoomid(roomID);
        reqEx.setPriority(priority);
        reqEx.setFramerate(frameRate);
        reqEx.setFrameidx(frameidx);
        var bytes = reqEx.serializeBinary();
        return this.fillHeader(bytes, CMD_SET_FRAME_SYNCRATE_CMDID);
      };
      MatchvsProtocol.prototype.sendFrameEvent = function(roomID, priority, cpProto) {
        var reqEx = new proto.stream.FrameBroadcast();
        reqEx.setRoomid(roomID);
        reqEx.setPriority(priority);
        reqEx.setCpproto(stringToUtf8ByteArray(cpProto));
        var bytes = reqEx.serializeBinary();
        return this.fillHeader(bytes, CMD_FRAME_BROADCAST_CMDID);
      };
      MatchvsProtocol.prototype.setRoomProperty = function(gameID, userID, roomID, roomProperty) {
        var reqEx = new proto.stream.SetRoomPropertyReq();
        reqEx.setGameid(gameID);
        reqEx.setRoomid(roomID);
        reqEx.setUserid(userID);
        reqEx.setRoomproperty(stringToUtf8ByteArray(roomProperty));
        var bytes = reqEx.serializeBinary();
        return this.fillHeader(bytes, CMD_SET_ROOM_PROPERTY_REQ);
      };
      MatchvsProtocol.prototype.joinOpen = function(gameID, userID, roomID, cpProto) {
        var reqEx = new proto.stream.JoinOpenReq();
        reqEx.setRoomid(roomID);
        reqEx.setGameid(gameID);
        reqEx.setUserid(userID);
        reqEx.setCpproto(stringToUtf8ByteArray(cpProto));
        var bytes = reqEx.serializeBinary();
        return this.fillHeader(bytes, CMD_ROOM_JOIN_OPEN_REQ);
      };
      function EngineNetworkMap() {
        this[MATCHVS_USER_LOGIN_RSP] = new LoginRspWork();
        this[MATCHVS_ROOM_JOIN_RSP] = new JoinRoomRspWork();
        this[MATCHVS_ROOM_NOTICE_USER_JOIN] = new JoinRoomNotifyWork();
        this[MATCHVS_ROOM_CHECK_IN_RSP] = new CheckInRoomRspWork();
        this[MATCHVS_ROOM_CREATE_RSP] = new CreateRoomRspWork();
        this[MATCHVS_ROOM_CHECKIN_NOTIFY] = new CheckInRoomNtfyWork();
        this[MATCHVS_ROOM_JOIN_OVER_RSP] = new JoinOverRspWork();
        this[MATCHVS_ROOM_JOIN_OVER_NOTIFY] = new JoinOverNotifyWork();
        this[MATCHVS_ROOM_LEAVE_RSP] = new LeaveRoomRspWork();
        this[MATCHVS_ROOM_NOTICE_USER_LEAVE] = new LeaveRoomNotifyWork();
        this[MATCHVS_USER_HEARTBEAT_RSP] = new HeartBeatGatewayRspWork();
        this[MATCHVS_HEARTBEAT_HOTEL_RSP] = new HeartBeatHotelRspWork();
        this[MATCHVS_BROADCAST_HOTEL_RSP] = new SendEventRspWork();
        this[MATCHVS_HOTEL_NOTIFY] = new SendEventNotifyWork();
        this[CMD_SUBSCRIBE_ACK_CMDID] = new SubscribeEventGroupRspWork();
        this[CMD_PUBLISH_ACKCMDID] = new SendEventGroupRspWork();
        this[CMD_PUBLISH_NOTIFYCMDID] = new SendEventGroupNotifyWork();
        this[MATCHVS_USER_GATEWAY_SPEED_RSP] = new GatewaySpeedRspWork();
        this[CMD_GET_ROOM_LIST_RSP] = new GetRoomListRspWork();
        this[MATCHVS_USER_LOGOUT_RSP] = new LoginOutRspWork();
        this[CMD_DISCONNECT_RSP] = new DisConnectRspWork();
        this[CMD_KICK_PLAYER_NOTIFY] = new KickPlayerNotifyWork();
        this[CMD_KICK_PLAYER_RSP] = new KickPlayerRspWork();
        this[CMD_SET_FRAME_SYNCRATEACK_CMDID] = new SetFrameSyncRspWork();
        this[CMD_FRAME_BROADCASTACK_CMDID] = new SendFrameEventRspWork();
        this[CMD_SET_FRAME_SYNCRATENOTIFY_CMDID] = new SetFrameSyncNotifyWork();
        this[CMD_FRAME_DATANOTIFY_CMDID] = new FrameDataNotifyWork();
        this[CMD_FRAME_SYNCNOTIFY_CMDID] = new FrameSyncNotifyWork();
        this[MATCHVS_NETWORK_STATE_NOTIFY] = new NetworkStateNotifyWork();
        this[CMD_GET_ROOM_LIST_EX_RSP] = new GetRoomListRspWork_Ex();
        this[CMD_GET_ROOM_DETAIL_RSP] = new GetRoomDetailRspWork();
        this[CMD_SET_ROOM_PROPERTY_RSP] = new SetRoomPropertyRspWokr();
        this[CMD_SET_ROOM_PROPERTY_NOTIFY] = new SetRoomPropertyNotifyWork();
        this[CMD_ROOM_JOIN_OPEN_RSP] = new JoinOpenRspWork();
        this[CMD_ROOM_JOIN_OPEN_NOT] = new JoinOpenNotifyWork();
      }
      var ErrorRspWork = function ErrorRspWork(ErrCall, code, message) {
        var tempmsg = "";
        tempmsg = void 0 !== MvsErrMsg[code] ? message + ". " + MvsErrMsg[code] : message;
        MatchvsLog.logI("[error code:" + code + "] " + tempmsg);
        ErrCall && ErrCall(code, tempmsg);
      };
      var NetWorkCallBackImp = function NetWorkCallBackImp(engine) {
        MSExtend(this, MatchvsNetWork);
        this.engineWorkMap = new EngineNetworkMap();
        this.gtwTimer = 0;
        this.mHotelTimer = 0;
        this.frameCache = [];
        this.hbTimers = [];
        this.clearAllBeatTimer = function() {
          while (this.hbTimers.length > 0) MVS.ticker.clearInterval(this.hbTimers.pop());
        };
        this.onMsg = function(dataView) {
          var packet = engine.mProtocol.handleMsg(dataView);
          var roomInfo = new proto.stream.RoomInfo();
          var event = {
            hotelTimer: this.mHotelTimer,
            payload: packet.payload,
            seq: packet.header.seq,
            roomInfo: roomInfo,
            frameCache: this.frameCache
          };
          var dohandle = this.engineWorkMap[packet.header.cmd];
          dohandle ? dohandle.doSubHandle(event, engine) : MatchvsLog.logE("no the cmd: ", packet.header.cmd);
        };
        this.onErr = function(errCode, errMsg) {
          ErrorRspWork(engine.mRsp.errorResponse, errCode, errMsg);
        };
        this.onConnect = function(host) {
          if ("" !== HttpConf.HOST_HOTEL_ADDR && host.indexOf(HttpConf.HOST_HOTEL_ADDR) >= 0) {
            this.mHotelTimer = MVS.ticker.setInterval(engine.hotelHeartBeat, HEART_BEAT_INTERVAL);
            this.hbTimers.push(this.mHotelTimer);
          } else if ("" !== HttpConf.HOST_GATWAY_ADDR && host.indexOf(HttpConf.HOST_GATWAY_ADDR) >= 0) {
            this.gtwTimer = MVS.ticker.setInterval(engine.heartBeat, HEART_BEAT_INTERVAL);
            this.hbTimers.push(this.gtwTimer);
          }
          engine.mRsp.onConnect && engine.mRsp.onConnect(host);
        };
        this.onDisConnect = function(host, event) {
          engine.mRsp.onDisConnect && engine.mRsp.onDisConnect(host);
          if (host.endsWith(HttpConf.HOST_GATWAY_ADDR)) {
            engine.mEngineState = ENGE_STATE.HAVE_INIT;
            if (event && event.code && (event.code === MvsCode.CODE_1000 || event.code === MvsCode.CODE_1005)) MatchvsLog.logI("gateway close is friend"); else {
              this.clearAllBeatTimer();
              engine.mHotelNetWork && engine.mHotelNetWork.close();
              ErrorRspWork(engine.mRsp.errorResponse, MvsCode.NetWorkErr, "(" + event.code + ") gateway network error");
            }
            MVS.ticker.clearInterval(this.gtwTimer);
          } else if (host.endsWith(HttpConf.HOST_HOTEL_ADDR)) {
            MatchvsLog.logI("hotel disconnect");
            if (event && event.code && (event.code === MvsCode.CODE_1000 || event.code === MvsCode.CODE_1005)) MatchvsLog.logI("hotel close is friend"); else {
              engine.mEngineState = ENGE_STATE.HAVE_INIT;
              this.clearAllBeatTimer();
              engine.mNetWork && engine.mNetWork.close();
              ErrorRspWork(engine.mRsp.errorResponse, MvsCode.NetWorkErr, "(" + event.code + ") hotel network error");
            }
            MVS.ticker.clearInterval(this.mHotelTimer);
            engine.mEngineState &= ~ENGE_STATE.JOIN_ROOMING;
            engine.mEngineState &= ~ENGE_STATE.LEAVE_ROOMING;
            engine.mEngineState &= ~ENGE_STATE.IN_ROOM;
            engine.mEngineState &= ~ENGE_STATE.CREATEROOM;
          }
          MatchvsLog.logI("EngineState", engine.mEngineState);
        };
      };
      function LoginRspWork() {
        this.doSubHandle = function(event, engine) {
          var status = event.payload.getStatus();
          if (200 === status) engine.mEngineState |= ENGE_STATE.HAVE_LOGIN; else {
            engine.mEngineState &= ~ENGE_STATE.LOGINING;
            engine.mEngineState &= ~ENGE_STATE.RECONNECTING;
            ErrorRspWork(engine.mRsp.errorResponse, status, "login is fail");
          }
          engine.mEngineState &= ~ENGE_STATE.LOGINING;
          engine.mRecntRoomID = event.payload.getRoomid();
          if ((engine.mEngineState & ENGE_STATE.RECONNECTING) === ENGE_STATE.RECONNECTING) if ("0" !== engine.mRecntRoomID) {
            var roomJoin = new MsRoomJoin(MsEnum.JoinRoomType.reconnect, engine.mMsPubArgs.userID, engine.mRecntRoomID, engine.mMsPubArgs.gameID, 0, 0, 0, "reconnect", [ {
              name: "MatchVS"
            } ]);
            var reconbuf = engine.mProtocol && engine.mProtocol.joinRoomSpecial(roomJoin);
            engine.mNetWork && engine.mNetWork.send(reconbuf);
          } else {
            engine.mEngineState &= ~ENGE_STATE.RECONNECTING;
            engine.mRsp.reconnectResponse && engine.mRsp.reconnectResponse(MvsCode.CODE_201, null, null);
          } else engine.mRsp.loginResponse(new MsLoginRsp(status, engine.mRecntRoomID));
        };
      }
      function JoinRoomRspWork() {
        this.doSubHandle = function(event, engine) {
          var status = event.payload.getStatus();
          if (200 === status) {
            var mBookInfo = event.payload.getBookinfo();
            engine.mRoomInfo = event.payload.getRoominfo();
            engine.mUserListForJoinRoomRsp = event.payload.getUsersList();
            HttpConf.HOST_HOTEL_ADDR = getHotelUrl(mBookInfo);
            engine.roomCheckIn(event.payload.getBookinfo(), event.payload.getRoominfo());
          } else {
            engine.mEngineState &= ~ENGE_STATE.JOIN_ROOMING;
            engine.mEngineState &= ~ENGE_STATE.RECONNECTING;
            ErrorRspWork(engine.mRsp.errorResponse, status, "join room failed ");
            engine.mRsp.joinRoomResponse && engine.mRsp.joinRoomResponse(status, null, null);
          }
        };
      }
      function CreateRoomRspWork() {
        this.doSubHandle = function(event, engine) {
          if (200 === event.payload.getStatus()) {
            var mBookInfo = event.payload.getBookinfo();
            event.roomInfo.setRoomid(event.payload.getRoomid());
            event.roomInfo.setOwner(event.payload.getOwner());
            engine.mRoomInfo = event.roomInfo;
            HttpConf.HOST_HOTEL_ADDR = getHotelUrl(mBookInfo);
            engine.roomCheckIn(event.payload.getBookinfo(), event.roomInfo);
          } else {
            engine.mEngineState &= ~ENGE_STATE.CREATEROOM;
            ErrorRspWork(engine.mRsp.errorResponse, event.payload.getStatus(), "");
            engine.mRsp.createRoomResponse && engine.mRsp.createRoomResponse(new MsCreateRoomRsp(event.payload.getStatus(), "", 0));
          }
        };
      }
      function CheckInRoomRspWork() {
        this.doSubHandle = function(event, engine) {
          var status = event.payload.getStatus();
          if (200 !== status) {
            engine.mEngineState = ENGE_STATE.HAVE_INIT;
            engine.mEngineState |= ENGE_STATE.HAVE_LOGIN;
            ErrorRspWork(engine.mRsp.errorResponse, status, "check in error");
            engine.mHotelNetWork && engine.mHotelNetWork.close();
          } else {
            engine.mAllPlayers = event.payload.getCheckinsList();
            var roomUserList = [];
            engine.mUserListForJoinRoomRsp.forEach(function(user) {
              var roomuser = new MsRoomUserInfo(user.getUserid(), utf8ByteArrayToString(user.getUserprofile()));
              roomUserList.push(roomuser);
            });
            var roominfo = new MsRoomInfo(engine.mRoomInfo.getRoomid(), utf8ByteArrayToString(engine.mRoomInfo.getRoomproperty()), engine.mRoomInfo.getOwner(), engine.mRoomInfo.getState());
            engine.mEngineState |= ENGE_STATE.IN_ROOM;
            if ((engine.mEngineState & ENGE_STATE.CREATEROOM) === ENGE_STATE.CREATEROOM) {
              engine.mEngineState &= ~ENGE_STATE.CREATEROOM;
              engine.mRsp.createRoomResponse && engine.mRsp.createRoomResponse(new MsCreateRoomRsp(status, engine.mRoomInfo.getRoomid(), engine.mRoomInfo.getOwner()));
            } else if ((engine.mEngineState & ENGE_STATE.JOIN_ROOMING) === ENGE_STATE.JOIN_ROOMING) {
              engine.mEngineState &= ~ENGE_STATE.JOIN_ROOMING;
              engine.mRsp.joinRoomResponse && engine.mRsp.joinRoomResponse(status, roomUserList, roominfo);
            } else if ((engine.mEngineState & ENGE_STATE.RECONNECTING) === ENGE_STATE.RECONNECTING) {
              engine.mEngineState &= ~ENGE_STATE.RECONNECTING;
              engine.mRsp.reconnectResponse && engine.mRsp.reconnectResponse(status, roomUserList, roominfo);
            }
          }
        };
      }
      function CheckInRoomNtfyWork() {
        this.doSubHandle = function(event, engine) {
          engine.joinRoomNotifyInfo && engine.mRsp.joinRoomNotify && engine.mRsp.joinRoomNotify(engine.joinRoomNotifyInfo);
          engine.mAllPlayers = event.payload.getCheckinsList();
          engine.mRsp.roomCheckInNotify && engine.mRsp.roomCheckInNotify(new MsCheckInNotify(event.payload.getUserid(), event.payload.getCheckinsList(), event.payload.getPlayersList(), event.payload.getMaxplayers()));
          engine.joinRoomNotifyInfo = null;
        };
      }
      function LeaveRoomRspWork() {
        this.doSubHandle = function(event, engine) {
          engine.mEngineState &= ~ENGE_STATE.LEAVE_ROOMING;
          200 !== event.payload.getStatus() && ErrorRspWork(engine.mRsp.errorResponse, event.payload.getStatus(), "leave room fail");
          event.roomInfo.setRoomid("0");
          engine.mRoomInfo = event.roomInfo;
          var leaveRoomRsp = new MsLeaveRoomRsp(event.payload.getStatus(), event.payload.getRoomid(), event.payload.getUserid(), event.payload.getCpproto());
          engine.mRsp.leaveRoomResponse && engine.mRsp.leaveRoomResponse(leaveRoomRsp);
          engine.mEngineState &= ~ENGE_STATE.IN_ROOM;
        };
      }
      function JoinOverRspWork() {
        this.doSubHandle = function(event, engine) {
          200 !== event.payload.getStatus() && ErrorRspWork(engine.mRsp.errorResponse, event.payload.getStatus(), "join over fail");
          engine.mRsp.joinOverResponse && engine.mRsp.joinOverResponse(new MsJoinOverRsp(event.payload.getStatus(), utf8ByteArrayToString(event.payload.getCpproto())));
        };
      }
      function JoinOverNotifyWork() {
        this.doSubHandle = function(event, engine) {
          var joinoverNotifyInfo = new MsJoinOverNotifyInfo(event.payload.getRoomid(), event.payload.getSrcuserid(), utf8ByteArrayToString(event.payload.getCpproto()));
          engine.mRsp.joinOverNotify && engine.mRsp.joinOverNotify(joinoverNotifyInfo);
        };
      }
      function JoinRoomNotifyWork() {
        this.doSubHandle = function(event, engine) {
          engine.joinRoomNotifyInfo = new MsRoomUserInfo(event.payload.getUser().getUserid(), utf8ByteArrayToString(event.payload.getUser().getUserprofile()));
        };
      }
      function LeaveRoomNotifyWork() {
        this.doSubHandle = function(event, engine) {
          var leaveRoomInfo = new MsLeaveRoomNotify(event.payload.getRoomid(), event.payload.getUserid(), event.payload.getOwner(), utf8ByteArrayToString(event.payload.getCpproto()));
          engine.mRsp.leaveRoomNotify && engine.mRsp.leaveRoomNotify(leaveRoomInfo);
        };
      }
      function HeartBeatHotelRspWork() {
        this.doSubHandle = function(event, engine) {
          engine.mRsp.hotelHeartBeatRsp && engine.mRsp.hotelHeartBeatRsp(event.payload.getStatus());
          MatchvsLog.logI("hotelHeartBeatRsp");
        };
      }
      function SendEventRspWork() {
        this.doSubHandle = function(event, engine) {
          200 !== event.payload.getStatus() && ErrorRspWork(engine.mRsp.errorResponse, event.payload.getStatus(), "send event fail");
          engine.mRsp.sendEventResponse && engine.mRsp.sendEventResponse(new MsSendEventRsp(event.payload.getStatus(), event.seq));
        };
      }
      function SendEventNotifyWork() {
        this.doSubHandle = function(event, engine) {
          var srcUserID = event.payload.getSrcuid();
          0 === srcUserID ? engine.mRsp.gameServerNotify && engine.mRsp.gameServerNotify(new MsGameServerNotifyInfo(event.payload.getSrcuid(), utf8ByteArrayToString(event.payload.getCpproto()))) : engine.mRsp.sendEventNotify && engine.mRsp.sendEventNotify(new MsSendEventNotify(event.payload.getSrcuid(), utf8ByteArrayToString(event.payload.getCpproto())));
        };
      }
      function SubscribeEventGroupRspWork() {
        this.doSubHandle = function(event, engine) {
          engine.mRsp.subscribeEventGroupResponse && engine.mRsp.subscribeEventGroupResponse(event.payload.getStatus(), event.payload.getGroupsList());
        };
      }
      function SendEventGroupRspWork() {
        this.doSubHandle = function(event, engine) {
          engine.mRsp.sendEventGroupResponse && engine.mRsp.sendEventGroupResponse(event.payload.getStatus(), event.payload.getDstnum());
        };
      }
      function SendEventGroupNotifyWork() {
        this.doSubHandle = function(event, engine) {
          engine.mRsp.sendEventGroupNotify && engine.mRsp.sendEventGroupNotify(event.payload.getSrcuid(), event.payload.getGroupsList(), utf8ByteArrayToString(event.payload.getCpproto()));
        };
      }
      function GatewaySpeedRspWork() {
        this.doSubHandle = function(event, engine) {
          var status = event.payload.getStatus();
          var seq = event.payload.getSeq();
          engine.mRsp.gatewaySpeedResponse && engine.mRsp.gatewaySpeedResponse(new MsGatewaySpeedResponse(status, seq));
        };
      }
      function HeartBeatGatewayRspWork() {
        this.doSubHandle = function(event, engine) {
          var gameid = event.payload.getGameid();
          var gsExist = event.payload.getGsexist();
          engine.mEngineState |= ENGE_STATE.HAVE_LOGIN;
          engine.mRsp.heartBeatResponse && engine.mRsp.heartBeatResponse(new MsHeartBeatResponse(gameid, gsExist));
          MatchvsLog.logI("gatewayHeartBeatResponse");
        };
      }
      function LoginOutRspWork() {
        this.doSubHandle = function(event, engine) {
          engine.mNetWork.close();
          engine.mRsp.logoutResponse && engine.mRsp.logoutResponse(event.payload.getStatus());
        };
      }
      function GetRoomListRspWork() {
        this.doSubHandle = function(event, engine) {
          var status = event.payload.getStatus();
          if (200 !== status) {
            engine.mRsp.getRoomListResponse && engine.mRsp.getRoomListResponse(event.payload.getStatus(), null);
            ErrorRspWork(engine.mRsp.errorResponse, event.payload.getStatus(), "get room list error ");
          }
          var roominfolist = event.payload.getRoominfoList();
          var roomList = [];
          for (var i = 0; i < roominfolist.length; i++) roomList[i] = new MsRoomInfoEx(roominfolist[i].getRoomid(), roominfolist[i].getRoomname(), roominfolist[i].getMaxplayer(), roominfolist[i].getMode(), roominfolist[i].getCanwatch(), utf8ByteArrayToString(roominfolist[i].getRoomproperty()));
          engine.mRsp.getRoomListResponse && engine.mRsp.getRoomListResponse(status, roomList);
        };
      }
      function DisConnectRspWork() {
        this.doSubHandle = function(event, engine) {
          engine.mRsp.disConnectResponse && engine.mRsp.disConnectResponse(event.payload.getStatus());
        };
      }
      function KickPlayerRspWork() {
        this.doSubHandle = function(event, engine) {
          var status = event.payload.getStatus();
          200 != status && ErrorRspWork(engine.mRsp.errorResponse, event.payload.getStatus(), "kick player error ");
          engine.mRsp.kickPlayerResponse && engine.mRsp.kickPlayerResponse(new MsKickPlayerRsp(event.payload.getStatus(), event.payload.getOwner(), event.payload.getUserid()));
        };
      }
      function KickPlayerNotifyWork() {
        this.doSubHandle = function(event, engine) {
          if (event.payload.getUserid().toString() === "" + engine.mUserID && null != event.hotelTimer) {
            MVS.ticker.clearInterval(event.hotelTimer);
            engine.mEngineState &= ~ENGE_STATE.IN_ROOM;
            engine.mEngineState |= ENGE_STATE.HAVE_LOGIN;
            engine.mHotelNetWork.close();
          }
          engine.mRsp.kickPlayerNotify && engine.mRsp.kickPlayerNotify(new MsKickPlayerNotify(event.payload.getUserid(), event.payload.getSrcuserid(), utf8ByteArrayToString(event.payload.getCpproto()), event.payload.getOwner()));
        };
      }
      function SetFrameSyncRspWork() {
        this.doSubHandle = function(event, engine) {
          MatchvsLog.logI("SetFrameSyncRateAck:" + event.payload);
          engine.mRsp.setFrameSyncResponse && engine.mRsp.setFrameSyncResponse(new MsSetChannelFrameSyncRsp(event.payload.getStatus()));
        };
      }
      function SetFrameSyncNotifyWork() {
        this.doSubHandle = function(event, engine) {};
      }
      function SendFrameEventRspWork() {
        this.doSubHandle = function(event, engine) {
          engine.mRsp.sendFrameEventResponse && engine.mRsp.sendFrameEventResponse(new MsSendFrameEventRsp(event.payload.getStatus()));
        };
      }
      function FrameDataNotifyWork() {
        this.doSubHandle = function(event, engine) {
          event.frameCache.push(new MsFrameItem(event.payload.getSrcuid(), utf8ByteArrayToString(event.payload.getCpproto()), event.payload.getTimestamp()));
        };
      }
      function FrameSyncNotifyWork() {
        this.doSubHandle = function(event, engine) {
          var frameData = [];
          while (event.frameCache.length > 0) frameData.push(event.frameCache.pop());
          var msFrameData = new MsFrameData(event.payload.getLastidx(), frameData, frameData.length);
          engine.mRsp.frameUpdate && engine.mRsp.frameUpdate(msFrameData);
        };
      }
      function NetworkStateNotifyWork() {
        this.doSubHandle = function(event, engine) {
          engine.mRsp.networkStateNotify && engine.mRsp.networkStateNotify(new MsNetworkStateNotify(event.payload.getRoomid(), event.payload.getUserid(), event.payload.getState(), event.payload.getOwner()));
        };
      }
      function GetRoomListRspWork_Ex() {
        this.doSubHandle = function(event, engine) {
          var roomInfoList = event.payload.getRoominfoexList();
          var roomAttrs = [];
          roomInfoList.forEach(function(roominfo) {
            var roomAttr = new MsRoomAttribute(roominfo.getRoomid(), roominfo.getRoomname(), roominfo.getMaxplayer(), roominfo.getGameplayer(), roominfo.getWatchplayer(), roominfo.getMode(), roominfo.getCanwatch(), utf8ByteArrayToString(roominfo.getRoomproperty()), roominfo.getOwner(), roominfo.getState(), roominfo.getCreatetime().toString());
            roomAttrs.push(roomAttr);
          });
          var roomListExInfo = new MsGetRoomListExRsp(event.payload.getStatus(), event.payload.getTotal(), roomAttrs);
          engine.mRsp.getRoomListExResponse && engine.mRsp.getRoomListExResponse(roomListExInfo);
        };
      }
      function GetRoomDetailRspWork() {
        this.doSubHandle = function(event, engine) {
          if (200 !== event.payload.getStatus()) {
            engine.mRsp.getRoomDetailResponse && engine.mRsp.getRoomDetailResponse(new MsGetRoomDetailRsp(event.payload.getStatus()));
            ErrorRspWork(engine.mRsp.errorResponse, event.payload.getStatus(), "");
          }
          var roomDetail = event.payload.getRoomdetail();
          var userInfos = [];
          var playerlist = roomDetail.getPlayerinfosList();
          playerlist.forEach(function(player) {
            var userinfo = new MsRoomUserInfo(player.getUserid(), utf8ByteArrayToString(player.getUserprofile()));
            userInfos.push(userinfo);
          });
          var roomDetailRsp = new MsGetRoomDetailRsp(event.payload.getStatus(), roomDetail.getState(), roomDetail.getMaxplayer(), roomDetail.getMode(), roomDetail.getCanwatch(), utf8ByteArrayToString(roomDetail.getRoomproperty()), roomDetail.getOwner(), roomDetail.getCreateflag(), userInfos);
          engine.mRsp.getRoomDetailResponse && engine.mRsp.getRoomDetailResponse(roomDetailRsp);
        };
      }
      function SetRoomPropertyRspWokr() {
        this.doSubHandle = function(event, engine) {
          200 !== event.payload.getStatus() && ErrorRspWork(engine.errorResponse, event.payload.getStatus(), "set room property fail");
          engine.mRsp.setRoomPropertyResponse && engine.mRsp.setRoomPropertyResponse(new MsSetRoomPropertyRspInfo(event.payload.getStatus(), event.payload.getRoomid(), event.payload.getUserid(), utf8ByteArrayToString(event.payload.getRoomproperty())));
        };
      }
      function SetRoomPropertyNotifyWork() {
        this.doSubHandle = function(event, engine) {
          engine.mRsp.setRoomPropertyNotify && engine.mRsp.setRoomPropertyNotify(new MsRoomPropertyNotifyInfo(event.payload.getRoomid(), event.payload.getUserid(), utf8ByteArrayToString(event.payload.getRoomproperty())));
        };
      }
      function JoinOpenRspWork() {
        this.doSubHandle = function(event, engine) {
          engine.mRsp.joinOpenResponse && engine.mRsp.joinOpenResponse(new MsReopenRoomResponse(event.payload.getStatus(), utf8ByteArrayToString(event.payload.getCpproto())));
        };
      }
      function JoinOpenNotifyWork() {
        this.doSubHandle = function(event, engine) {
          engine.mRsp.joinOpenNotify && engine.mRsp.joinOpenNotify(new MsReopenRoomNotify(event.payload.getRoomid(), event.payload.getUserid(), utf8ByteArrayToString(event.payload.getCpproto())));
        };
      }
      var M_ENGINE;
      function MatchvsEngine() {
        M_ENGINE = this;
        this.mChannel = "MatchVS";
        this.mPlatform = "release";
        this.mMsPubArgs = new MsPublicMemberArgs();
        this.mEngineState = ENGE_STATE.NONE;
        this.mAllPlayers = [];
        this.mRecntRoomID = 0;
        this.mUserListForJoinRoomRsp = [];
        this.joinRoomNotifyInfo = null;
        this.mNetWork = null;
        this.mHotelNetWork = null;
        this.mProtocol = new MatchvsProtocol();
        this.init = function(response, channel, platform, gameID) {
          this.mRsp = response;
          this.mChannel = channel;
          this.mPlatform = platform;
          this.mGameID = gameID;
          this.mMsPubArgs.channel = channel;
          this.mMsPubArgs.platform = platform;
          this.mEngineState = ENGE_STATE.INITING;
          this.mProtocol.init();
          this.getHostList();
          return 0;
        };
        this.premiseInit = function(response, endPoint, gameID) {
          if (void 0 === endPoint || "" === endPoint) return -1;
          this.mRsp = response;
          this.mGameID = gameID;
          HttpConf.HOST_GATWAY_ADDR = "wss://" + endPoint;
          this.mEngineState = ENGE_STATE.HAVE_INIT;
          this.mRsp.initResponse(200);
          return 0;
        };
        this.reconnect = function() {
          if ((this.mEngineState & ENGE_STATE.HAVE_INIT) !== ENGE_STATE.HAVE_INIT) return -2;
          if ((this.mEngineState & ENGE_STATE.RECONNECTING) === ENGE_STATE.RECONNECTING) return -9;
          if ("0" !== this.mRecntRoomID && (this.mEngineState & ENGE_STATE.HAVE_LOGIN) === ENGE_STATE.HAVE_LOGIN) {
            this.mEngineState |= ENGE_STATE.RECONNECTING;
            var roomJoin = new MsRoomJoin(MsEnum.JoinRoomType.reconnect, this.mMsPubArgs.userID, this.mRecntRoomID, this.mMsPubArgs.gameID, 0, 0, 0, "reconnect", [ {
              name: "MatchVS"
            } ]);
            var buf = this.mProtocol.joinRoomSpecial(roomJoin);
            this.mNetWork.send(buf);
            this.mRecntRoomID = "0";
            return 0;
          }
          if (void 0 === this.mMsPubArgs.gameID || void 0 === this.mMsPubArgs.secretKey || void 0 === this.mMsPubArgs.appKey) return -1;
          if ((this.mEngineState & ENGE_STATE.HAVE_LOGIN) === ENGE_STATE.HAVE_LOGIN) return -6;
          void 0 === this.mNetWork || null === this.mNetWork || this.mNetWork.close();
          this.mEngineState |= ENGE_STATE.LOGINING;
          this.mEngineState |= ENGE_STATE.RECONNECTING;
          this.mNetWorkCallBackImp = new NetWorkCallBackImp(this);
          this.mNetWork = new MatchvsNetWork(HttpConf.HOST_GATWAY_ADDR, this.mNetWorkCallBackImp);
          var loginbuf = this.mProtocol.login(this.mMsPubArgs.userID, this.mMsPubArgs.token, this.mMsPubArgs.gameID, this.mMsPubArgs.gameVersion, this.mMsPubArgs.appKey, this.mMsPubArgs.secretKey, this.mMsPubArgs.deviceID, this.mMsPubArgs.gatewayID);
          this.mNetWork.send(loginbuf);
          return 0;
        };
        this.login = function(userID, token, pGameID, pGameVersion, pAppKey, pSecretKey, deviceID, gatewayID) {
          if ((this.mEngineState & ENGE_STATE.HAVE_INIT) !== ENGE_STATE.HAVE_INIT) return -2;
          if ((this.mEngineState & ENGE_STATE.INITING) === ENGE_STATE.INITING) return -3;
          if ((this.mEngineState & ENGE_STATE.LOGINING) === ENGE_STATE.LOGINING) return -5;
          if ((this.mEngineState & ENGE_STATE.HAVE_LOGIN) === ENGE_STATE.HAVE_LOGIN) return -6;
          if ((this.mEngineState & ENGE_STATE.LOGOUTING) === ENGE_STATE.LOGOUTING) return -11;
          var ak = new MVS.AppKeyCheck();
          if (!ak.isInvailed(pAppKey)) return -26;
          void 0 === this.mNetWork || null === this.mNetWork || this.mNetWork.close();
          this.mNetWorkCallBackImp = new NetWorkCallBackImp(this);
          this.mNetWork = new MatchvsNetWork(HttpConf.HOST_GATWAY_ADDR, this.mNetWorkCallBackImp);
          this.mUserID = userID;
          this.mToken = token;
          this.mGameID = pGameID;
          this.mGameVersion = pGameVersion;
          this.mAppKey = pAppKey;
          this.mMsPubArgs.userID = userID;
          this.mMsPubArgs.token = token;
          this.mMsPubArgs.gameID = pGameID;
          this.mMsPubArgs.gameVersion = pGameVersion;
          this.mMsPubArgs.appKey = pAppKey;
          this.mMsPubArgs.deviceID = deviceID;
          this.mMsPubArgs.gatewayID = gatewayID;
          this.mMsPubArgs.secretKey = pSecretKey;
          var buf = this.mProtocol.login(userID, token, pGameID, pGameVersion, pAppKey, pSecretKey, deviceID, gatewayID);
          this.mEngineState |= ENGE_STATE.LOGINING;
          this.mNetWork.send(buf);
          MatchvsLog.logI("login,userID" + userID + ", token:" + token);
          return 0;
        };
        this.speed = function() {
          if ((this.mEngineState & ENGE_STATE.HAVE_LOGIN) !== ENGE_STATE.HAVE_LOGIN) return -4;
          var buf = this.mProtocol.speed(this.mUserID, this.mGameID, this.mToken, VERSION, this.mGameVersion);
          this.mNetWork.send(buf);
          return 0;
        };
        this.createRoom = function(cinfo, userProfile) {
          var ret = commEngineStateCheck(this.mEngineState, this.mEngineState, 2);
          if (0 !== ret) return ret;
          if (userProfile.length > 512) return -21;
          if (cinfo.maxPlayer > MVSCONFIG.MAXPLAYER_LIMIT || cinfo.maxPlayer < MVSCONFIG.MINPLAYER_LIMIT) return -20;
          var roomInfo = new RoomInfo(0, cinfo.roomName, cinfo.maxPlayer, cinfo.mode, cinfo.canWatch, cinfo.visibility, cinfo.roomProperty, 0);
          var playInfo = new PlayerInfo(this.mUserID, userProfile);
          var buf = this.mProtocol.roomCreate(cinfo.maxPlayer, 0, this.mGameID, roomInfo, playInfo);
          if (buf.byteLength > 1024 || userProfile.length > 512) return -21;
          this.mEngineState |= ENGE_STATE.CREATEROOM;
          this.mNetWork.send(buf);
          MatchvsLog.logI("create room");
          return 0;
        };
        this.getVersion = function() {
          return "MatchVS-SDK-JS_v1.3.0.beta.201805016";
        };
        this.uninit = function() {
          this.mEngineState = ENGE_STATE.NONE;
          MatchvsLog.logI("unInit ");
          return 0;
        };
        this.getRoomList = function(filter) {
          var ret = commEngineStateCheck(this.mEngineState, this.mEngineState, 2);
          if (0 !== ret) return ret;
          var buf = this.mProtocol.getRoomList(this.mGameID, filter);
          if (buf.byteLength > 1024) return -21;
          this.mNetWork.send(buf);
          return 0;
        };
        this.roomCheckIn = function(bookInfo, roomInfo) {
          this.mHotelNetWork = new MatchvsNetWork(HttpConf.HOST_HOTEL_ADDR, this.mNetWorkCallBackImp);
          var buf = this.mProtocol.roomCheckIn(bookInfo, roomInfo, this.mUserID, this.mGameID);
          this.mHotelNetWork.send(buf);
          return 0;
        };
        this.joinRandomRoom = function(maxPlayer, userProfile) {
          var ret = commEngineStateCheck(this.mEngineState, this.mEngineState, 2);
          if (0 !== ret) return ret;
          if (maxPlayer > MVSCONFIG.MAXPLAYER_LIMIT || maxPlayer < MVSCONFIG.MINPLAYER_LIMIT) return -20;
          if (userProfile.length > 512) return -21;
          var roomJoin = new MsRoomJoin(MsEnum.JoinRoomType.joinRandomRoom, this.mUserID, 0, this.mGameID, maxPlayer, 0, 0, userProfile, [ {
            name: "matchvs"
          } ]);
          var buf = this.mProtocol.joinRandomRoom(roomJoin);
          this.mEngineState |= ENGE_STATE.JOIN_ROOMING;
          this.mNetWork.send(buf);
          return 0;
        };
        this.joinRoomWithProperties = function(matchinfo, userProfile) {
          var ret = commEngineStateCheck(this.mEngineState, this.mEngineState, 2);
          if (0 !== ret) return ret;
          if (userProfile.length > 512) return -21;
          if ("object" !== ("undefined" === typeof matchinfo ? "undefined" : _typeof(matchinfo))) return -1;
          if ("string" !== typeof userProfile) return -1;
          if (matchinfo.maxPlayer > MVSCONFIG.MAXPLAYER_LIMIT || matchinfo.maxPlayer < MVSCONFIG.MINPLAYER_LIMIT) return -20;
          var roomJoin = new MsRoomJoin(MsEnum.JoinRoomType.joinRoomWithProperty, this.mUserID, 1, this.mGameID, matchinfo.maxPlayer, matchinfo.mode, matchinfo.canWatch, userProfile, matchinfo.tags);
          var buf = this.mProtocol.joinRoomWithProperties(roomJoin);
          this.mEngineState |= ENGE_STATE.JOIN_ROOMING;
          this.mNetWork.send(buf);
          return 0;
        };
        this.joinRoom = function(roomID, userProfile) {
          var ret = commEngineStateCheck(this.mEngineState, this.mEngineState, 2);
          if (0 !== ret) return ret;
          if (!/^[0-9]+$/.test(roomID)) return -1;
          var roomId = String(roomID).trim();
          if (0 === roomId || "" === roomId) return -1;
          var roomJoin = new MsRoomJoin(MsEnum.JoinRoomType.joinSpecialRoom, this.mUserID, roomID, this.mGameID, 0, 0, 0, userProfile, [ {
            name: "MatchVS"
          } ]);
          var buf = this.mProtocol.joinRoomSpecial(roomJoin);
          this.mEngineState |= ENGE_STATE.JOIN_ROOMING;
          this.mNetWork.send(buf);
          MatchvsLog.logI("join room");
          return 0;
        };
        this.joinOver = function(cpProto) {
          var ret = commEngineStateCheck(this.mEngineState, this.mEngineState, 1);
          if (0 !== ret) return ret;
          if (cpProto.byteLength > 1024) return -21;
          var buf = this.mProtocol.joinOver(this.mGameID, this.mRoomInfo.getRoomid(), stringToUtf8ByteArray(cpProto), this.mUserID);
          this.mNetWork.send(buf);
          return 0;
        };
        this.leaveRoom = function(cpProto) {
          var ret = commEngineStateCheck(this.mEngineState, this.mEngineState, 3);
          if (0 !== ret) return ret;
          var roomid = this.mRecntRoomID;
          this.mRoomInfo && this.mRoomInfo.getRoomid && (roomid = this.mRoomInfo.getRoomid());
          if (cpProto.length > 1024) return -21;
          var buf = this.mProtocol.leaveRoom(this.mGameID, this.mUserID, roomid, cpProto);
          this.mNetWork.send(buf);
          this.mEngineState |= ENGE_STATE.LEAVE_ROOMING;
          this.mHotelNetWork && this.mHotelNetWork.close();
          MatchvsLog.logI("leaveRoom");
          return 0;
        };
        this.kickPlayer = function(userID, cpProto) {
          var ret = commEngineStateCheck(this.mEngineState, this.mEngineState, 1);
          if (0 !== ret) return ret;
          if (cpProto.length > 1024) return -21;
          var buf = this.mProtocol.kickPlayer(userID, this.mUserID, this.mRoomInfo.getRoomid(), cpProto);
          this.mNetWork.send(buf);
          return 0;
        };
        this.setFrameSync = function(frameRate) {
          var ret = commEngineStateCheck(this.mEngineState, this.mEngineState, 1);
          if (0 !== ret) return ret;
          if (frameRate > 20 || frameRate < 0) return -20;
          var buf = this.mProtocol.setFrameSync(Number(frameRate), this.mRoomInfo.getRoomid(), this.mGameID, 0, 1);
          this.mHotelNetWork.send(buf);
          return 0;
        };
        this.sendFrameEvent = function(cpProto) {
          var ret = commEngineStateCheck(this.mEngineState, this.mEngineState, 1);
          if (0 !== ret) return ret;
          if (cpProto.length > 1024) return -21;
          var buf = this.mProtocol.sendFrameEvent(this.mRoomInfo.getRoomid(), 0, cpProto);
          this.mHotelNetWork.send(buf);
          return 0;
        };
        this.joinOpen = function(cpProto) {
          var ret = commEngineStateCheck(this.mEngineState, this.mEngineState, 1);
          if (0 !== ret) return ret;
          var buf = this.mProtocol.joinOpen(this.mGameID, this.mUserID, this.mRoomInfo.getRoomid(), cpProto);
          this.mNetWork.send(buf);
          return 0;
        };
      }
      function MatchvsResponse() {
        this.registerUserResponse = function(userInfo) {};
        this.loginResponse = function(loginRsp) {};
        this.logoutResponse = function(status) {};
        this.createRoomResponse = function(rsp) {};
        this.getRoomListResponse = function(status, roomInfos) {};
        this.joinRoomResponse = function(status, roomUserInfoList, roomInfo) {};
        this.joinRoomNotify = function(roomUserInfo) {};
        this.joinOverResponse = function(rsp) {};
        this.joinOverNotify = function(notifyInfo) {};
        this.leaveRoomResponse = function(rsp) {};
        this.leaveRoomNotify = function(leaveRoomInfo) {};
        this.kickPlayerResponse = function(rsp) {};
        this.kickPlayerNotify = function(notify) {};
        this.sendEventResponse = function(rsp) {};
        this.sendEventNotify = function(tRsp) {};
        this.gameServerNotify = function(tRsp) {};
        this.errorResponse = function(errCode, errMsg) {};
        this.initResponse = function(status) {};
        this.networkStateNotify = function(notify) {};
        this.subscribeEventGroupResponse = function(status, groups) {};
        this.sendEventGroupResponse = function(status, dstNum) {};
        this.sendEventGroupNotify = function(srcUserID, groups, cpProto) {};
        this.setFrameSyncResponse = function(rsp) {};
        this.sendFrameEventResponse = function(rsp) {};
        this.frameUpdate = function(data) {};
        this.hotelHeartBeatRsp = function(data) {};
        this.gatewaySpeedResponse = function(rsp) {};
        this.heartBeatResponse = function(rsp) {};
        this.roomCheckInNotify = function(rsp) {};
        this.disConnectResponse = function(rep) {};
        this.getRoomDetailResponse = function(rsp) {};
        this.getRoomListExResponse = function(rsp) {};
        this.setRoomPropertyResponse = function(rsp) {};
        this.setRoomPropertyNotify = function(notify) {};
        this.reconnectResponse = function(status, roomUserInfoList, roomInfo) {};
        this.joinOpenNotify = function(rsp) {};
        this.joinOpenResponse = function(notify) {};
      }
      MatchvsEngine.prototype.logout = function(cpProto) {
        if ((this.mEngineState & ENGE_STATE.HAVE_LOGIN) !== ENGE_STATE.HAVE_LOGIN) return -4;
        if ((this.mEngineState & ENGE_STATE.IN_ROOM) === ENGE_STATE.IN_ROOM) {
          this.mEngineState |= ENGE_STATE.LEAVE_ROOMING;
          this.leaveRoom("user logout");
          this.mHotelNetWork && this.mHotelNetWork.close();
        }
        var buf = this.mProtocol.logout(cpProto);
        this.mEngineState |= ENGE_STATE.LOGOUTING;
        this.mNetWork.send(buf);
        return 0;
      };
      MatchvsEngine.prototype.heartBeat = function() {
        var Instance = M_ENGINE;
        if (void 0 === Instance.mGameID || "" === Instance.mGameID || 0 === Instance.mGameID) return;
        var roomID;
        roomID = void 0 === Instance.mRoomInfo ? 0 : Instance.mRoomInfo.getRoomid();
        if ((Instance.mEngineState & ENGE_STATE.LOGOUTING) === ENGE_STATE.LOGOUTING) return;
        var buf = Instance.mProtocol.heartBeat(Instance.mGameID, roomID);
        Instance.mNetWork.send(buf);
        MatchvsLog.logI("gateway heartBeat");
      };
      MatchvsEngine.prototype.sendEvent = function(data) {
        if ((this.mEngineState & ENGE_STATE.HAVE_INIT) !== ENGE_STATE.HAVE_INIT) return {
          sequence: this.mProtocol.seq - 1,
          result: -2
        };
        if ((this.mEngineState & ENGE_STATE.HAVE_LOGIN) !== ENGE_STATE.HAVE_LOGIN) return {
          sequence: this.mProtocol.seq - 1,
          result: -4
        };
        if ((this.mEngineState & ENGE_STATE.IN_ROOM) !== ENGE_STATE.IN_ROOM) return {
          sequence: this.mProtocol.seq - 1,
          result: -6
        };
        if ((this.mEngineState & ENGE_STATE.INITING) === ENGE_STATE.INITING) return {
          sequence: this.mProtocol.seq - 1,
          result: -3
        };
        if ((this.mEngineState & ENGE_STATE.CREATEROOM) === ENGE_STATE.CREATEROOM) return {
          sequence: this.mProtocol.seq - 1,
          result: -7
        };
        if ((this.mEngineState & ENGE_STATE.JOIN_ROOMING) === ENGE_STATE.JOIN_ROOMING) return {
          sequence: this.mProtocol.seq - 1,
          result: -7
        };
        if ("string" !== typeof data) return {
          sequence: this.mProtocol.seq - 1,
          result: -1
        };
        var destType = 0;
        var msgType = 0;
        var userids = [];
        var num = 0;
        for (var i = 0; i < this.mAllPlayers.length; i++) this.mAllPlayers[i] !== parseInt(this.mUserID) && (userids[num++] = this.mAllPlayers[i]);
        if (userids.length > MVSCONFIG.MAXPLAYER_LIMIT) return -20;
        if (data.length > 1024) return -21;
        var buf = this.mProtocol.broadCast(this.mRoomInfo.getRoomid(), userids, destType, msgType, stringToUtf8ByteArray(data));
        this.mHotelNetWork.send(buf);
        return {
          sequence: this.mProtocol.seq - 1,
          result: 0
        };
      };
      MatchvsEngine.prototype.sendEventEx = function(msgType, data, desttype, userIDs) {
        if ((this.mEngineState & ENGE_STATE.HAVE_INIT) !== ENGE_STATE.HAVE_INIT) return {
          sequence: this.mProtocol.seq - 1,
          result: -2
        };
        if ((this.mEngineState & ENGE_STATE.HAVE_LOGIN) !== ENGE_STATE.HAVE_LOGIN) return {
          sequence: this.mProtocol.seq - 1,
          result: -4
        };
        if ((this.mEngineState & ENGE_STATE.IN_ROOM) !== ENGE_STATE.IN_ROOM) return {
          sequence: this.mProtocol.seq - 1,
          result: -6
        };
        if ((this.mEngineState & ENGE_STATE.INITING) === ENGE_STATE.INITING) return {
          sequence: this.mProtocol.seq - 1,
          result: -3
        };
        if ((this.mEngineState & ENGE_STATE.CREATEROOM) === ENGE_STATE.CREATEROOM) return {
          sequence: this.mProtocol.seq - 1,
          result: -7
        };
        if ((this.mEngineState & ENGE_STATE.JOIN_ROOMING) === ENGE_STATE.JOIN_ROOMING) return {
          sequence: this.mProtocol.seq - 1,
          result: -7
        };
        if ("string" !== typeof data) return {
          sequence: this.mProtocol.seq - 1,
          result: -1
        };
        if (!(0 === msgType || 1 === msgType || 2 === msgType)) return {
          sequence: this.mProtocol.seq - 1,
          result: -23
        };
        if (!(0 === desttype || 1 === desttype)) return {
          sequence: this.mProtocol.seq - 1,
          result: -24
        };
        if (data.length > 1024) return -21;
        var buf = this.mProtocol.broadCast(this.mRoomInfo.getRoomid(), userIDs, desttype, msgType, stringToUtf8ByteArray(data));
        this.mHotelNetWork.send(buf);
        return {
          sequence: this.mProtocol.seq - 1,
          result: 0
        };
      };
      MatchvsEngine.prototype.subscribeEventGroup = function(confirms, cancels) {
        var ret = commEngineStateCheck(this.mEngineState, this.mEngineState, 1);
        if (0 !== ret) return ret;
        if (0 === confirms.length && 0 === cancels.length) return -20;
        var buf = this.mProtocol.subscribeEventGroup(this.mGameID, this.mRoomInfo.getRoomid(), confirms, cancels);
        this.mHotelNetWork.send(buf);
        return 0;
      };
      MatchvsEngine.prototype.sendEventGroup = function(data, groups) {
        var ret = commEngineStateCheck(this.mEngineState, this.mEngineState, 1);
        if (0 !== ret) return ret;
        if (groups.length <= 0) return -20;
        if (data.length > 1024) return -21;
        var priority = 1;
        var buf = this.mProtocol.sendEventGroup(this.mGameID, this.mRoomInfo.getRoomid(), priority, groups, data);
        this.mHotelNetWork.send(buf);
        return 0;
      };
      MatchvsEngine.prototype.hotelHeartBeat = function() {
        var _engine = M_ENGINE;
        _engine.mEngineState |= ENGE_STATE.IN_ROOM;
        _engine.mEngineState |= ENGE_STATE.HAVE_LOGIN;
        var buf = _engine.mProtocol.hotelHeartBeat(_engine.mGameID, _engine.mRoomInfo.getRoomid(), _engine.mUserID);
        _engine.mHotelNetWork.send(buf);
        MatchvsLog.logI("hotel heartBeat");
      };
      MatchvsEngine.prototype.registerUser = function() {
        if ((this.mEngineState & ENGE_STATE.HAVE_INIT) !== ENGE_STATE.HAVE_INIT) return -2;
        var deviceid = "javascript";
        var channel = this.mChannel;
        var cacheKey = "regUserInfo" + channel + this.mPlatform;
        var gameVersion = this.mGameVersion;
        var cacheUserInfo = LocalStore_Load(cacheKey);
        if (cacheUserInfo) {
          var obj = JSON.parse(cacheUserInfo);
          this.mRsp.registerUserResponse(new MsRegistRsp(obj.status + "", obj.data.userid, obj.data.token, obj.data.nickname, obj.data.avatar));
          MatchvsLog.logI("load user info from cache:" + obj);
          return 0;
        }
        var uri = "/wc3/regit.do";
        var url = HttpConf.REGISTER_USER_URL + uri + "?mac=0&deviceid=" + deviceid + "&channel=" + channel + "&pid=13&version=" + gameVersion;
        var rep = new MatchvsNetWorkCallBack();
        rep.rsp = this.mRsp.registerUserResponse;
        rep.onMsg = function(buf) {
          var obj = JSON.parse(buf);
          if (0 === obj.status) {
            LocalStore_Save(cacheKey, buf);
            this.rsp(new MsRegistRsp(obj.status, obj.data.userid, obj.data.token, obj.data.nickname, obj.data.avatar));
          } else this.rsp(new MsRegistRsp(obj.status, 0, "err", buf, "err"));
        };
        rep.onErr = function(errCode, errMsg) {
          this.rsp(new MsRegistRsp(0 === errCode ? -1 : errCode, 0, "err", errMsg, "err"));
        };
        new MatchvsHttp(rep).get(url);
        return 0;
      };
      MatchvsEngine.prototype.getHostList = function() {
        var gameId = this.mGameID;
        var channel = this.mChannel;
        var platform = this.mPlatform;
        var uri = "/v1/gateway/query";
        var isUseWSS = isNeedUseWSS();
        var url = "https://sdk.matchvs.com" + uri + "?mac=0&gameid=" + gameId + "&channel=" + channel + "&platform=" + platform + (isUseWSS ? "&useWSSProxy=1" : "");
        var rep = new MatchvsNetWorkCallBack();
        var engine = this;
        rep.onMsg = function(buf) {
          var obj = JSON.parse(buf);
          if (200 === obj.status) {
            engine.mEngineState |= ENGE_STATE.HAVE_INIT;
            engine.mEngineState &= ~ENGE_STATE.INITING;
            var http = "https://";
            var port = "";
            HttpConf.REGISTER_USER_URL = http + obj.data.vsuser;
            HttpConf.HOST_GATWAY_ADDR = (isUseWSS ? "wss://" : "ws://") + (isUseWSS ? obj.data.wssProxy : obj.data.engine + ":7001");
            HttpConf.CMSNS_URL = http + obj.data.cmsns;
            HttpConf.VS_OPEN_URL = http + obj.data.vsopen;
            HttpConf.VS_PAY_URL = http + obj.data.vspay;
            HttpConf.VS_PRODUCT_URL = http + obj.data.VS_PRODUCT_URL;
          }
          engine.mRsp.initResponse(obj.status);
        };
        rep.onErr = function(errCode, errMsg) {
          console.error("getHostListErrCode" + errCode + " getHostListErrMsg" + errMsg);
          engine.mRsp.errorResponse(errCode, errMsg);
        };
        new MatchvsHttp(rep).get(url);
        return 0;
      };
      MatchvsEngine.prototype.getRoomListEx = function(filter) {
        var ret = commEngineStateCheck(this.mEngineState, this.mEngineState, 0);
        if (0 !== ret) return ret;
        var buf = this.mProtocol.getRoomListEx(this.mGameID, filter);
        this.mNetWork.send(buf);
        return 0;
      };
      MatchvsEngine.prototype.getRoomDetail = function(roomID) {
        var ret = commEngineStateCheck(this.mEngineState, this.mEngineState, 0);
        if (0 !== ret) return ret;
        var buf = this.mProtocol.getRoomDetail(this.mGameID, roomID);
        this.mNetWork.send(buf);
        return 0;
      };
      MatchvsEngine.prototype.setRoomProperty = function(roomID, roomProperty) {
        if (0 === roomProperty.length) return -1;
        if (roomProperty.length > 1024) return -21;
        var ret = commEngineStateCheck(this.mEngineState, this.mEngineState, 1);
        if (0 !== ret) return ret;
        var buf = this.mProtocol.setRoomProperty(this.mGameID, this.mUserID, roomID, roomProperty);
        this.mNetWork.send(buf);
        return 0;
      };
      MatchvsEngine.prototype.disConnect = function(roomID) {
        var buf = engine.mProtocol.disConnect(this.mUserID, this.mGameID, roomID);
        this.mNetWork.send(buf);
      };
      MatchvsEngine.prototype.hashSet = function(gameID, userID, key, value) {
        var params = "gameID=" + gameID + "&key=" + key + "&userID=" + userID + "&value=" + value;
        var sign = hex_md5(this.mAppKey + "&" + params + "&" + this.mToken);
        var url = HttpConf.VS_OPEN_URL + "/wc5/hashSet.do?" + params + "&sign=" + sign;
        var callback = new MatchvsNetWorkCallBack();
        var httpReq = new MatchvsHttp(callback);
        callback.onMsg = function(rsp) {
          MatchvsLog.logI("hashSetRsp:", rsp);
        };
        callback.onErr = function(errCode, errMsg) {
          MatchvsLog.logI("hashSetRsp:errCode=" + errCode + " errMsg=" + errMsg);
        };
        httpReq.get(url);
      };
      MatchvsEngine.prototype.hashGet = function(gameID, userID, key) {
        var params = "gameID=" + gameID + "&key=" + key + "&userID=" + userID;
        var sign = hex_md5(this.mAppKey + "&" + params + "&" + this.mToken);
        var url = HttpConf.VS_OPEN_URL + "/wc5/hashGet.do?" + params + "&sign=" + sign;
        var callback = new MatchvsNetWorkCallBack();
        var httpReq = new MatchvsHttp(callback);
        callback.onMsg = function(rsp) {
          MatchvsLog.logI("hashGetRsp:", rsp);
        };
        callback.onErr = function(errCode, errMsg) {
          MatchvsLog.logI("hashGetRsp:errCode=" + errCode + " errMsg=" + errMsg);
        };
        httpReq.get(url);
      };
      function Base64() {
        _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        this.encode = function(input) {
          var output = "";
          var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
          var i = 0;
          input = _utf8_encode(input);
          while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = (3 & chr1) << 4 | chr2 >> 4;
            enc3 = (15 & chr2) << 2 | chr3 >> 6;
            enc4 = 63 & chr3;
            isNaN(chr2) ? enc3 = enc4 = 64 : isNaN(chr3) && (enc4 = 64);
            output = output + _keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
          }
          return output;
        };
        this.decode = function(input) {
          var output = "";
          var chr1, chr2, chr3;
          var enc1, enc2, enc3, enc4;
          var i = 0;
          input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
          while (i < input.length) {
            enc1 = _keyStr.indexOf(input.charAt(i++));
            enc2 = _keyStr.indexOf(input.charAt(i++));
            enc3 = _keyStr.indexOf(input.charAt(i++));
            enc4 = _keyStr.indexOf(input.charAt(i++));
            chr1 = enc1 << 2 | enc2 >> 4;
            chr2 = (15 & enc2) << 4 | enc3 >> 2;
            chr3 = (3 & enc3) << 6 | enc4;
            output += String.fromCharCode(chr1);
            64 != enc3 && (output += String.fromCharCode(chr2));
            64 != enc4 && (output += String.fromCharCode(chr3));
          }
          output = _utf8_decode(output);
          return output;
        };
        _utf8_encode = function _utf8_encode(string) {
          string = string.replace(/\r\n/g, "\n");
          var utftext = "";
          for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) utftext += String.fromCharCode(c); else if (c > 127 && c < 2048) {
              utftext += String.fromCharCode(c >> 6 | 192);
              utftext += String.fromCharCode(63 & c | 128);
            } else {
              utftext += String.fromCharCode(c >> 12 | 224);
              utftext += String.fromCharCode(c >> 6 & 63 | 128);
              utftext += String.fromCharCode(63 & c | 128);
            }
          }
          return utftext;
        };
        _utf8_decode = function _utf8_decode(utftext) {
          var string = "";
          var i = 0;
          var c = c1 = c2 = 0;
          while (i < utftext.length) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
              string += String.fromCharCode(c);
              i++;
            } else if (c > 191 && c < 224) {
              c2 = utftext.charCodeAt(i + 1);
              string += String.fromCharCode((31 & c) << 6 | 63 & c2);
              i += 2;
            } else {
              c2 = utftext.charCodeAt(i + 1);
              c3 = utftext.charCodeAt(i + 2);
              string += String.fromCharCode((15 & c) << 12 | (63 & c2) << 6 | 63 & c3);
              i += 3;
            }
          }
          return string;
        };
      }
      try {
        module && module.exports && (module.exports = {
          MatchvsLog: MatchvsLog,
          MatchvsEngine: MatchvsEngine,
          MatchvsResponse: MatchvsResponse,
          MsMatchInfo: MsMatchInfo,
          MsCreateRoomInfo: MsCreateRoomInfo,
          MsRoomFilter: MsRoomFilter,
          MsRoomFilterEx: MsRoomFilterEx,
          LocalStore_Clear: LocalStore_Clear,
          MsReopenRoomResponse: MsReopenRoomResponse,
          MsReopenRoomNotify: MsReopenRoomNotify,
          MatchvsHttp: MatchvsHttp
        });
      } catch (error) {
        console.log(error);
      }
      window.MatchvsLog = MatchvsLog;
      window.MatchvsEngine = MatchvsEngine;
      window.MatchvsResponse = MatchvsResponse;
      window.MsMatchInfo = MsMatchInfo;
      window.MsCreateRoomInfo = MsCreateRoomInfo;
      window.MsRoomFilter = MsRoomFilter;
      window.MsRoomFilterEx = MsRoomFilterEx;
      window.LocalStore_Clear = LocalStore_Clear;
      window.MsReopenRoomResponse = MsReopenRoomResponse;
      window.MsReopenRoomNotify = MsReopenRoomNotify;
      window.MatchvsHttp = MatchvsHttp;
      cc._RF.pop();
    }).call(this, "undefined" !== typeof global ? global : "undefined" !== typeof self ? self : "undefined" !== typeof window ? window : {});
  }, {} ],
  msgType: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "ca231JfnIZDU4ojDPXOoDXg", "msgType");
    "use strict";
    var protocol = dcodeIO.ProtoBuf.newBuilder({
      populateAccessors: true
    })["import"]({
      package: "protocol",
      syntax: "proto2",
      messages: [ {
        name: "result_push",
        syntax: "proto2",
        fields: [ {
          rule: "required",
          type: "int32",
          name: "result",
          id: 1
        }, {
          rule: "optional",
          type: "int32",
          name: "attach",
          id: 2
        }, {
          rule: "optional",
          type: "string",
          name: "msg",
          id: 3
        } ]
      }, {
        name: "heart_beat",
        syntax: "proto2",
        fields: []
      }, {
        name: "heart_beat_ret",
        syntax: "proto2",
        fields: []
      }, {
        name: "kickoff_push",
        syntax: "proto2",
        fields: [ {
          rule: "required",
          type: "int32",
          name: "type",
          id: 1
        } ]
      }, {
        name: "role_info",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "int64",
          name: "id",
          id: 1
        }, {
          rule: "optional",
          type: "int32",
          name: "icon",
          id: 2
        }, {
          rule: "optional",
          type: "string",
          name: "nickname",
          id: 3
        }, {
          rule: "optional",
          type: "sync_data",
          name: "syncData",
          id: 4
        } ]
      }, {
        name: "DataWorkshop",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "int32",
          name: "id",
          id: 1
        }, {
          rule: "optional",
          type: "int64",
          name: "value",
          id: 2
        }, {
          rule: "optional",
          type: "int64",
          name: "startTimestamp",
          id: 3
        }, {
          rule: "optional",
          type: "int64",
          name: "endTimestamp",
          id: 4
        }, {
          rule: "optional",
          type: "int64",
          name: "addValue",
          id: 5
        }, {
          rule: "optional",
          type: "bool",
          name: "open",
          id: 6
        }, {
          rule: "optional",
          type: "bool",
          name: "display",
          id: 7
        } ]
      }, {
        name: "DataHunt",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "int32",
          name: "preyId",
          id: 1
        }, {
          rule: "optional",
          type: "bool",
          name: "inHunt",
          id: 2
        }, {
          rule: "optional",
          type: "int64",
          name: "huntTimestamp",
          id: 3
        }, {
          rule: "optional",
          type: "bool",
          name: "receive",
          id: 5
        }, {
          rule: "optional",
          type: "bool",
          name: "refresh",
          id: 6
        }, {
          rule: "optional",
          type: "int64",
          name: "refreshTimestamp",
          id: 7
        }, {
          rule: "repeated",
          type: "int32",
          name: "rewardId",
          id: 8
        }, {
          rule: "repeated",
          type: "double",
          name: "rewardValue",
          id: 9
        }, {
          rule: "repeated",
          type: "int32",
          name: "advanture",
          id: 10
        }, {
          rule: "optional",
          type: "float",
          name: "seasonRate",
          id: 11
        } ]
      }, {
        name: "DataBuilding",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "int32",
          name: "id",
          id: 1
        }, {
          rule: "optional",
          type: "int64",
          name: "value",
          id: 2
        }, {
          rule: "optional",
          type: "int64",
          name: "startTimestamp",
          id: 3
        }, {
          rule: "optional",
          type: "int64",
          name: "endTimestamp",
          id: 4
        }, {
          rule: "optional",
          type: "int64",
          name: "addValue",
          id: 5
        }, {
          rule: "optional",
          type: "bool",
          name: "open",
          id: 6
        }, {
          rule: "optional",
          type: "bool",
          name: "display",
          id: 7
        } ]
      }, {
        name: "DataMiracle",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "int32",
          name: "id",
          id: 1
        }, {
          rule: "optional",
          type: "int32",
          name: "stage",
          id: 2
        }, {
          rule: "optional",
          type: "int32",
          name: "value",
          id: 3
        }, {
          rule: "optional",
          type: "int64",
          name: "startTimestamp",
          id: 4
        }, {
          rule: "optional",
          type: "int64",
          name: "endTimestamp",
          id: 5
        }, {
          rule: "optional",
          type: "bool",
          name: "done",
          id: 6
        }, {
          rule: "optional",
          type: "bool",
          name: "open",
          id: 7
        }, {
          rule: "optional",
          type: "bool",
          name: "display",
          id: 8
        }, {
          rule: "optional",
          type: "int32",
          name: "spurCount",
          id: 9
        }, {
          rule: "optional",
          type: "int64",
          name: "spurRecoverTimestamp",
          id: 10
        }, {
          rule: "optional",
          type: "int64",
          name: "spurEndTimestamp",
          id: 11
        }, {
          rule: "optional",
          type: "int64",
          name: "drawTimestamp",
          id: 12
        }, {
          rule: "optional",
          type: "bool",
          name: "drawOnce",
          id: 13
        } ]
      }, {
        name: "DataAchievement",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "int32",
          name: "id",
          id: 1
        }, {
          rule: "optional",
          type: "bool",
          name: "done",
          id: 2
        }, {
          rule: "optional",
          type: "bool",
          name: "open",
          id: 3
        }, {
          rule: "optional",
          type: "bool",
          name: "draw",
          id: 4
        } ]
      }, {
        name: "DataUnemployed",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "int32",
          name: "id",
          id: 1
        }, {
          rule: "optional",
          type: "int64",
          name: "value",
          id: 2
        }, {
          rule: "optional",
          type: "int64",
          name: "startTimestamp",
          id: 3
        }, {
          rule: "optional",
          type: "int64",
          name: "endTimestamp",
          id: 4
        }, {
          rule: "optional",
          type: "int64",
          name: "addValue",
          id: 5
        } ]
      }, {
        name: "DataWounded",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "int32",
          name: "id",
          id: 1
        }, {
          rule: "optional",
          type: "double",
          name: "value",
          id: 2
        }, {
          rule: "optional",
          type: "double",
          name: "unemployed",
          id: 3
        }, {
          rule: "optional",
          type: "bool",
          name: "open",
          id: 4
        } ]
      }, {
        name: "DataProfession",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "int32",
          name: "id",
          id: 1
        }, {
          rule: "optional",
          type: "int64",
          name: "value",
          id: 2
        }, {
          rule: "optional",
          type: "int64",
          name: "limit",
          id: 3
        }, {
          rule: "optional",
          type: "bool",
          name: "open",
          id: 4
        }, {
          rule: "optional",
          type: "bool",
          name: "display",
          id: 5
        } ]
      }, {
        name: "DataArmy",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "int32",
          name: "id",
          id: 1
        }, {
          rule: "optional",
          type: "int64",
          name: "value",
          id: 2
        }, {
          rule: "optional",
          type: "int64",
          name: "limit",
          id: 3
        }, {
          rule: "optional",
          type: "int32",
          name: "trainValue",
          id: 4
        }, {
          rule: "optional",
          type: "int32",
          name: "trainLimit",
          id: 5
        }, {
          rule: "optional",
          type: "bool",
          name: "open",
          id: 6
        }, {
          rule: "optional",
          type: "bool",
          name: "display",
          id: 7
        }, {
          rule: "optional",
          type: "int32",
          name: "refID",
          id: 8
        } ]
      }, {
        name: "DataResource",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "int32",
          name: "id",
          id: 1
        }, {
          rule: "optional",
          type: "double",
          name: "value",
          id: 2
        }, {
          rule: "optional",
          type: "double",
          name: "limit",
          id: 3
        }, {
          rule: "optional",
          type: "double",
          name: "history",
          id: 4
        }, {
          rule: "optional",
          type: "bool",
          name: "open",
          id: 5
        } ]
      }, {
        name: "Technology",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "int32",
          name: "id",
          id: 1
        }, {
          rule: "optional",
          type: "int64",
          name: "startTimestamp",
          id: 2
        }, {
          rule: "optional",
          type: "int64",
          name: "endTimestamp",
          id: 3
        }, {
          rule: "optional",
          type: "bool",
          name: "done",
          id: 4
        }, {
          rule: "optional",
          type: "bool",
          name: "open",
          id: 5
        }, {
          rule: "optional",
          type: "bool",
          name: "display",
          id: 6
        } ]
      }, {
        name: "Statistics",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "int32",
          name: "id",
          id: 1
        }, {
          rule: "optional",
          type: "double",
          name: "value",
          id: 2
        } ]
      }, {
        name: "Flag",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "int32",
          name: "id",
          id: 1
        }, {
          rule: "optional",
          type: "int32",
          name: "value",
          id: 2
        }, {
          rule: "optional",
          type: "int64",
          name: "updateTimestamp",
          id: 3
        } ]
      }, {
        name: "Event",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "int32",
          name: "id",
          id: 1
        }, {
          rule: "optional",
          type: "int32",
          name: "state",
          id: 2
        }, {
          rule: "optional",
          type: "int64",
          name: "updateTimestamp",
          id: 3
        } ]
      }, {
        name: "Rank",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "int32",
          name: "rankNum",
          id: 1
        }, {
          rule: "optional",
          type: "string",
          name: "nickname",
          id: 2
        }, {
          rule: "optional",
          type: "int64",
          name: "value",
          id: 3
        }, {
          rule: "optional",
          type: "int32",
          name: "delta",
          id: 4
        }, {
          rule: "optional",
          type: "bool",
          name: "isNew",
          id: 5
        } ]
      }, {
        name: "sync_data",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "DataUnemployed",
          name: "unemployed",
          id: 1
        }, {
          rule: "repeated",
          type: "DataProfession",
          name: "profession",
          id: 2
        }, {
          rule: "repeated",
          type: "DataArmy",
          name: "army",
          id: 3
        }, {
          rule: "repeated",
          type: "DataResource",
          name: "resource",
          id: 4
        }, {
          rule: "repeated",
          type: "DataBuilding",
          name: "building",
          id: 5
        }, {
          rule: "repeated",
          type: "Technology",
          name: "technology",
          id: 6
        }, {
          rule: "repeated",
          type: "Flag",
          name: "flag",
          id: 7
        }, {
          rule: "repeated",
          type: "Event",
          name: "event",
          id: 8
        }, {
          rule: "optional",
          type: "int64",
          name: "timestamp",
          id: 9
        }, {
          rule: "optional",
          type: "int64",
          name: "gameTime",
          id: 10
        }, {
          rule: "optional",
          type: "int32",
          name: "level",
          id: 11
        }, {
          rule: "repeated",
          type: "DataWorkshop",
          name: "workshop",
          id: 12
        }, {
          rule: "optional",
          type: "DataWounded",
          name: "wounded",
          id: 13
        }, {
          rule: "repeated",
          type: "Statistics",
          name: "statistics",
          id: 14
        }, {
          rule: "optional",
          type: "int64",
          name: "offlineCalTime",
          id: 15
        }, {
          rule: "repeated",
          type: "sync_log",
          name: "logs",
          id: 16
        }, {
          rule: "repeated",
          type: "int64",
          name: "doneOpID",
          id: 17
        }, {
          rule: "repeated",
          type: "DataMiracle",
          name: "miracle",
          id: 18
        }, {
          rule: "repeated",
          type: "DataAchievement",
          name: "achievement",
          id: 19
        }, {
          rule: "optional",
          type: "DataHunt",
          name: "hunt",
          id: 20
        } ]
      }, {
        name: "sync_log",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "int32",
          name: "id",
          id: 1
        }, {
          rule: "repeated",
          type: "int32",
          name: "resourceID",
          id: 2
        }, {
          rule: "repeated",
          type: "double",
          name: "resourceValue",
          id: 3
        } ]
      }, {
        name: "sync_data_ret",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "int32",
          name: "result",
          id: 1
        }, {
          rule: "optional",
          type: "sync_data",
          name: "syncData",
          id: 2
        }, {
          rule: "optional",
          type: "int64",
          name: "timestamp",
          id: 3
        } ]
      }, {
        name: "open_push",
        syntax: "proto2",
        fields: [ {
          rule: "repeated",
          type: "int32",
          name: "buildingID",
          id: 1
        }, {
          rule: "repeated",
          type: "int32",
          name: "professionID",
          id: 2
        }, {
          rule: "repeated",
          type: "int32",
          name: "armyID",
          id: 3
        }, {
          rule: "repeated",
          type: "int32",
          name: "technologyID",
          id: 4
        }, {
          rule: "repeated",
          type: "int32",
          name: "workshopID",
          id: 5
        } ]
      }, {
        name: "GmOperation",
        syntax: "proto2",
        fields: [ {
          rule: "required",
          type: "int32",
          name: "opId",
          id: 1
        } ]
      }, {
        name: "login_register",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "string",
          name: "username",
          id: 1
        }, {
          rule: "optional",
          type: "string",
          name: "password",
          id: 2
        } ]
      }, {
        name: "login_register_ret",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "register_Result",
          name: "result",
          id: 1
        }, {
          rule: "optional",
          type: "int64",
          name: "uid",
          id: 2
        }, {
          rule: "optional",
          type: "string",
          name: "token",
          id: 3
        }, {
          rule: "optional",
          type: "string",
          name: "gameServer",
          id: 4
        }, {
          rule: "optional",
          type: "string",
          name: "msg",
          id: 5
        } ]
      }, {
        name: "channel_login",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "string",
          name: "channel",
          id: 1
        }, {
          rule: "optional",
          type: "string",
          name: "channelUID",
          id: 2
        }, {
          rule: "optional",
          type: "string",
          name: "sdk",
          id: 3
        } ]
      }, {
        name: "channel_login_ret",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "int64",
          name: "uid",
          id: 1
        }, {
          rule: "optional",
          type: "string",
          name: "token",
          id: 2
        }, {
          rule: "optional",
          type: "string",
          name: "gameServer",
          id: 3
        } ]
      }, {
        name: "login_login",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "string",
          name: "username",
          id: 1
        }, {
          rule: "optional",
          type: "string",
          name: "password",
          id: 2
        } ]
      }, {
        name: "login_login_ret",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "login_Result",
          name: "result",
          id: 1
        }, {
          rule: "optional",
          type: "int64",
          name: "uid",
          id: 2
        }, {
          rule: "optional",
          type: "string",
          name: "token",
          id: 3
        }, {
          rule: "optional",
          type: "string",
          name: "gameServer",
          id: 4
        } ]
      }, {
        name: "login_server",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "string",
          name: "token",
          id: 1
        }, {
          rule: "optional",
          type: "string",
          name: "platform",
          id: 2
        }, {
          rule: "optional",
          type: "string",
          name: "version",
          id: 3
        }, {
          rule: "optional",
          type: "int32",
          name: "serverId",
          id: 4
        }, {
          rule: "optional",
          type: "string",
          name: "deviceId",
          id: 5
        }, {
          rule: "optional",
          type: "string",
          name: "channel",
          id: 6
        }, {
          rule: "optional",
          type: "int64",
          name: "userId",
          id: 7
        } ]
      }, {
        name: "login_sever_ret",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "role_info",
          name: "roleInfo",
          id: 1
        }, {
          rule: "optional",
          type: "int64",
          name: "userId",
          id: 2
        }, {
          rule: "optional",
          type: "int64",
          name: "serverTime",
          id: 3
        } ]
      }, {
        name: "recoup_role",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "int64",
          name: "id",
          id: 1
        }, {
          rule: "optional",
          type: "int32",
          name: "server_id",
          id: 2
        }, {
          rule: "repeated",
          type: "int64",
          name: "role_id_list",
          id: 3
        }, {
          rule: "repeated",
          type: "recoup_entry",
          name: "resource",
          id: 4
        }, {
          rule: "repeated",
          type: "recoup_entry",
          name: "building",
          id: 5
        }, {
          rule: "repeated",
          type: "recoup_entry",
          name: "profession",
          id: 6
        }, {
          rule: "repeated",
          type: "recoup_entry",
          name: "army",
          id: 7
        }, {
          rule: "repeated",
          type: "recoup_bool_entry",
          name: "technology",
          id: 8
        }, {
          rule: "repeated",
          type: "recoup_entry",
          name: "workshop",
          id: 9
        }, {
          rule: "optional",
          type: "int64",
          name: "recoup_time",
          id: 10
        } ]
      }, {
        name: "recoup_entry",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "int32",
          name: "tid",
          id: 1
        }, {
          rule: "optional",
          type: "int64",
          name: "value",
          id: 2
        } ]
      }, {
        name: "recoup_bool_entry",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "int32",
          name: "tid",
          id: 1
        }, {
          rule: "optional",
          type: "bool",
          name: "done",
          id: 2
        } ]
      }, {
        name: "delete_recoup",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "int64",
          name: "recoup_index",
          id: 1
        } ]
      }, {
        name: "generate_server",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "int32",
          name: "server_id",
          id: 1
        }, {
          rule: "optional",
          type: "string",
          name: "server_name",
          id: 2
        }, {
          rule: "optional",
          type: "int32",
          name: "server_state",
          id: 3
        }, {
          rule: "optional",
          type: "int32",
          name: "server_maintain_state",
          id: 4
        }, {
          rule: "optional",
          type: "int32",
          name: "server_label",
          id: 5
        }, {
          rule: "optional",
          type: "int32",
          name: "server_show_state",
          id: 6
        }, {
          rule: "optional",
          type: "int64",
          name: "server_show_time",
          id: 7
        }, {
          rule: "optional",
          type: "int64",
          name: "server_release_time",
          id: 8
        }, {
          rule: "repeated",
          type: "string",
          name: "channels",
          id: 9
        }, {
          rule: "optional",
          type: "string",
          name: "extranet_ip",
          id: 10
        }, {
          rule: "optional",
          type: "string",
          name: "intranet_ip",
          id: 11
        }, {
          rule: "optional",
          type: "string",
          name: "sign",
          id: 12
        } ]
      }, {
        name: "server_batch_maintain",
        syntax: "proto2",
        fields: [ {
          rule: "repeated",
          type: "int32",
          name: "servers",
          id: 1
        }, {
          rule: "optional",
          type: "int32",
          name: "server_maintain_state",
          id: 2
        }, {
          rule: "optional",
          type: "string",
          name: "sign",
          id: 3
        } ]
      }, {
        name: "server_all_maintain",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "int32",
          name: "server_maintain_state",
          id: 1
        }, {
          rule: "optional",
          type: "string",
          name: "sign",
          id: 2
        } ]
      }, {
        name: "guest_bind",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "string",
          name: "appid",
          id: 1
        }, {
          rule: "optional",
          type: "string",
          name: "userid",
          id: 2
        }, {
          rule: "optional",
          type: "string",
          name: "jz_userid",
          id: 3
        }, {
          rule: "optional",
          type: "string",
          name: "channel_id",
          id: 4
        }, {
          rule: "optional",
          type: "string",
          name: "sign",
          id: 5
        } ]
      }, {
        name: "Opponent",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "int32",
          name: "level",
          id: 1
        }, {
          rule: "optional",
          type: "int32",
          name: "country",
          id: 2
        }, {
          rule: "optional",
          type: "string",
          name: "nickname",
          id: 3
        }, {
          rule: "repeated",
          type: "DataArmy",
          name: "army",
          id: 4
        }, {
          rule: "optional",
          type: "fight_reward",
          name: "reward",
          id: 5
        }, {
          rule: "optional",
          type: "int32",
          name: "epoch",
          id: 6
        } ]
      }, {
        name: "get_fight_opponent",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "bool",
          name: "pvp",
          id: 1
        }, {
          rule: "optional",
          type: "int64",
          name: "uid",
          id: 2
        }, {
          rule: "optional",
          type: "int64",
          name: "peopleTotal",
          id: 3
        }, {
          rule: "optional",
          type: "int32",
          name: "level",
          id: 4
        }, {
          rule: "optional",
          type: "int32",
          name: "victoryTotal",
          id: 5
        }, {
          rule: "repeated",
          type: "int32",
          name: "doneTech",
          id: 6
        } ]
      }, {
        name: "get_fight_opponent_ret",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "Opponent",
          name: "opponent",
          id: 1
        }, {
          rule: "optional",
          type: "Opponent",
          name: "lOpponent",
          id: 2
        }, {
          rule: "optional",
          type: "Opponent",
          name: "hOpponent",
          id: 3
        } ]
      }, {
        name: "random_fight_opponent",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "bool",
          name: "pvp",
          id: 1
        }, {
          rule: "optional",
          type: "int64",
          name: "uid",
          id: 2
        }, {
          rule: "optional",
          type: "int64",
          name: "peopleTotal",
          id: 3
        }, {
          rule: "optional",
          type: "int32",
          name: "gold",
          id: 4
        }, {
          rule: "optional",
          type: "int32",
          name: "level",
          id: 5
        }, {
          rule: "optional",
          type: "int32",
          name: "victoryTotal",
          id: 6
        }, {
          rule: "repeated",
          type: "int32",
          name: "doneTech",
          id: 7
        } ]
      }, {
        name: "random_fight_opponent_ret",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "Opponent",
          name: "opponent",
          id: 1
        }, {
          rule: "optional",
          type: "Opponent",
          name: "lOpponent",
          id: 2
        }, {
          rule: "optional",
          type: "Opponent",
          name: "hOpponent",
          id: 3
        } ]
      }, {
        name: "start_fight",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "bool",
          name: "pvp",
          id: 1
        }, {
          rule: "optional",
          type: "int64",
          name: "uid",
          id: 2
        }, {
          rule: "optional",
          type: "int32",
          name: "level",
          id: 3
        }, {
          rule: "optional",
          type: "int64",
          name: "peopleTotal",
          id: 4
        }, {
          rule: "repeated",
          type: "DataArmy",
          name: "army",
          id: 5
        }, {
          rule: "optional",
          type: "float",
          name: "woundedRatio",
          id: 6
        }, {
          rule: "optional",
          type: "int32",
          name: "victoryTotal",
          id: 7
        }, {
          rule: "repeated",
          type: "int32",
          name: "doneTech",
          id: 8
        }, {
          rule: "optional",
          type: "int32",
          name: "opponentType",
          id: 9
        }, {
          rule: "optional",
          type: "int64",
          name: "maxPeopleTotal",
          id: 10
        } ]
      }, {
        name: "test_fight",
        syntax: "proto2",
        fields: [ {
          rule: "repeated",
          type: "DataArmy",
          name: "self",
          id: 1
        }, {
          rule: "repeated",
          type: "DataArmy",
          name: "opponent",
          id: 2
        }, {
          rule: "optional",
          type: "int32",
          name: "selfLevel",
          id: 3
        }, {
          rule: "optional",
          type: "int32",
          name: "opponentLevel",
          id: 4
        }, {
          rule: "optional",
          type: "int32",
          name: "victoryTotal",
          id: 5
        } ]
      }, {
        name: "test_fight_count",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "test_fight",
          name: "fight",
          id: 1
        }, {
          rule: "optional",
          type: "int32",
          name: "count",
          id: 2
        } ]
      }, {
        name: "test_fight_count_ret",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "int32",
          name: "victory",
          id: 1
        }, {
          rule: "optional",
          type: "int32",
          name: "lose",
          id: 2
        }, {
          rule: "optional",
          type: "int32",
          name: "draw",
          id: 3
        } ]
      }, {
        name: "start_fight_ret",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "int32",
          name: "result",
          id: 1
        }, {
          rule: "optional",
          type: "fight_reward",
          name: "reward",
          id: 2
        }, {
          rule: "repeated",
          type: "fight_report",
          name: "reports",
          id: 4
        }, {
          rule: "optional",
          type: "int64",
          name: "selfDeath",
          id: 5
        }, {
          rule: "optional",
          type: "int64",
          name: "selfWounded",
          id: 6
        }, {
          rule: "optional",
          type: "int64",
          name: "opponentDeath",
          id: 7
        }, {
          rule: "optional",
          type: "int64",
          name: "opponentWounded",
          id: 8
        }, {
          rule: "repeated",
          type: "DataArmy",
          name: "self",
          id: 9
        }, {
          rule: "repeated",
          type: "DataArmy",
          name: "opponent",
          id: 10
        }, {
          rule: "optional",
          type: "int32",
          name: "selfHolyShitArmy",
          id: 11
        }, {
          rule: "optional",
          type: "int32",
          name: "opponentHolyShitArmy",
          id: 12
        }, {
          rule: "optional",
          type: "double",
          name: "totalRatio",
          id: 13
        }, {
          rule: "optional",
          type: "double",
          name: "selfMorale",
          id: 14
        }, {
          rule: "optional",
          type: "double",
          name: "opponentMorale",
          id: 15
        } ]
      }, {
        name: "fight_reward",
        syntax: "proto2",
        fields: [ {
          rule: "repeated",
          type: "DataResource",
          name: "resource",
          id: 1
        }, {
          rule: "optional",
          type: "int32",
          name: "trophy",
          id: 2
        }, {
          rule: "repeated",
          type: "DataResource",
          name: "luxury",
          id: 3
        } ]
      }, {
        name: "fight_report",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "int32",
          name: "id",
          id: 1
        }, {
          rule: "optional",
          type: "int32",
          name: "round",
          id: 2
        }, {
          rule: "repeated",
          type: "figh_round_report",
          name: "roundReport",
          id: 3
        } ]
      }, {
        name: "figh_round_report",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "int32",
          name: "round",
          id: 1
        }, {
          rule: "repeated",
          type: "DataArmy",
          name: "self",
          id: 2
        }, {
          rule: "repeated",
          type: "DataArmy",
          name: "opponent",
          id: 3
        }, {
          rule: "optional",
          type: "skill_report",
          name: "selfSkill",
          id: 6
        }, {
          rule: "optional",
          type: "skill_report",
          name: "opponentSkill",
          id: 7
        }, {
          rule: "repeated",
          type: "int32",
          name: "selfDodgeArmy",
          id: 8
        }, {
          rule: "repeated",
          type: "int32",
          name: "opponentDodgeArmy",
          id: 9
        }, {
          rule: "optional",
          type: "double",
          name: "selfMorale",
          id: 10
        }, {
          rule: "optional",
          type: "double",
          name: "opponentMorale",
          id: 11
        } ]
      }, {
        name: "skill_report",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "int32",
          name: "armyID",
          id: 1
        }, {
          rule: "optional",
          type: "int32",
          name: "skillID",
          id: 2
        }, {
          rule: "optional",
          type: "int32",
          name: "targetArmyID",
          id: 3
        } ]
      }, {
        name: "log_in_out",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "string",
          name: "logtime",
          id: 1
        }, {
          rule: "optional",
          type: "string",
          name: "channelid",
          id: 2
        }, {
          rule: "optional",
          type: "string",
          name: "channeluid",
          id: 3
        }, {
          rule: "optional",
          type: "string",
          name: "serverid",
          id: 4
        }, {
          rule: "optional",
          type: "string",
          name: "charid",
          id: 5
        }, {
          rule: "optional",
          type: "string",
          name: "logmode",
          id: 6
        }, {
          rule: "optional",
          type: "string",
          name: "logoutmode",
          id: 7
        }, {
          rule: "optional",
          type: "string",
          name: "lasttime",
          id: 8
        }, {
          rule: "optional",
          type: "string",
          name: "accountname",
          id: 9
        }, {
          rule: "optional",
          type: "string",
          name: "charname",
          id: 10
        }, {
          rule: "optional",
          type: "string",
          name: "ip",
          id: 11
        }, {
          rule: "optional",
          type: "string",
          name: "mac",
          id: 12
        }, {
          rule: "optional",
          type: "string",
          name: "devicelabel",
          id: 13
        }, {
          rule: "optional",
          type: "string",
          name: "ostype",
          id: 14
        }, {
          rule: "optional",
          type: "string",
          name: "ageid",
          id: 15
        }, {
          rule: "optional",
          type: "string",
          name: "countrylv",
          id: 16
        }, {
          rule: "optional",
          type: "string",
          name: "techdonenum",
          id: 17
        }, {
          rule: "optional",
          type: "string",
          name: "totalpopulation",
          id: 18
        }, {
          rule: "optional",
          type: "string",
          name: "totalland",
          id: 19
        }, {
          rule: "optional",
          type: "string",
          name: "jin_yuanbao",
          id: 20
        }, {
          rule: "optional",
          type: "string",
          name: "resources",
          id: 21
        }, {
          rule: "optional",
          type: "string",
          name: "resourceRates",
          id: 22
        }, {
          rule: "optional",
          type: "string",
          name: "buildings",
          id: 23
        }, {
          rule: "optional",
          type: "string",
          name: "workshops",
          id: 24
        }, {
          rule: "optional",
          type: "string",
          name: "professions",
          id: 25
        }, {
          rule: "optional",
          type: "string",
          name: "armies",
          id: 26
        }, {
          rule: "optional",
          type: "string",
          name: "technologies",
          id: 27
        } ]
      }, {
        name: "log_yuanbao",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "string",
          name: "logtime",
          id: 1
        }, {
          rule: "optional",
          type: "string",
          name: "channelid",
          id: 2
        }, {
          rule: "optional",
          type: "string",
          name: "channeluid",
          id: 3
        }, {
          rule: "optional",
          type: "string",
          name: "serverid",
          id: 4
        }, {
          rule: "optional",
          type: "string",
          name: "charid",
          id: 5
        }, {
          rule: "optional",
          type: "string",
          name: "accountname",
          id: 6
        }, {
          rule: "optional",
          type: "string",
          name: "charname",
          id: 7
        }, {
          rule: "optional",
          type: "string",
          name: "changetype",
          id: 8
        }, {
          rule: "optional",
          type: "string",
          name: "changereason",
          id: 9
        }, {
          rule: "optional",
          type: "string",
          name: "totalnuma",
          id: 10
        }, {
          rule: "optional",
          type: "string",
          name: "deltaa",
          id: 11
        }, {
          rule: "optional",
          type: "string",
          name: "totalnumb",
          id: 12
        }, {
          rule: "optional",
          type: "string",
          name: "deltab",
          id: 13
        }, {
          rule: "optional",
          type: "string",
          name: "delta",
          id: 14
        }, {
          rule: "optional",
          type: "string",
          name: "totalnum",
          id: 15
        }, {
          rule: "optional",
          type: "string",
          name: "param1",
          id: 16
        }, {
          rule: "optional",
          type: "string",
          name: "param2",
          id: 17
        }, {
          rule: "optional",
          type: "string",
          name: "param3",
          id: 18
        }, {
          rule: "optional",
          type: "string",
          name: "param4",
          id: 19
        } ]
      }, {
        name: "create_role",
        syntax: "proto2",
        fields: [ {
          rule: "required",
          type: "int32",
          name: "icon",
          id: 1
        }, {
          rule: "required",
          type: "string",
          name: "nickname",
          id: 2
        } ]
      }, {
        name: "create_role_ret",
        syntax: "proto2",
        fields: [ {
          rule: "required",
          type: "int32",
          name: "result",
          id: 1
        }, {
          rule: "optional",
          type: "role_info",
          name: "roleInfo",
          id: 2
        } ]
      }, {
        name: "get_role_info",
        syntax: "proto2",
        fields: []
      }, {
        name: "get_role_info_ret",
        syntax: "proto2",
        fields: [ {
          rule: "required",
          type: "role_info",
          name: "roleInfo",
          id: 1
        } ]
      }, {
        name: "change_nickname",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "string",
          name: "newNickname",
          id: 1
        } ]
      }, {
        name: "change_nickname_ret",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "bool",
          name: "result",
          id: 1
        } ]
      }, {
        name: "role_info_push",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "int32",
          name: "level",
          id: 1
        }, {
          rule: "optional",
          type: "int32",
          name: "exp",
          id: 2
        }, {
          rule: "optional",
          type: "int32",
          name: "power",
          id: 3
        }, {
          rule: "optional",
          type: "int32",
          name: "limit",
          id: 4
        }, {
          rule: "optional",
          type: "int32",
          name: "faith",
          id: 5
        }, {
          rule: "optional",
          type: "int32",
          name: "diamond",
          id: 6
        } ]
      }, {
        name: "role_power_push",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "int32",
          name: "power",
          id: 1
        }, {
          rule: "optional",
          type: "int64",
          name: "updateTimestamp",
          id: 2
        } ]
      }, {
        name: "role_flag_info",
        syntax: "proto2",
        fields: []
      }, {
        name: "role_flag_info_ret",
        syntax: "proto2",
        fields: [ {
          rule: "repeated",
          type: "int32",
          name: "flag",
          id: 1
        }, {
          rule: "repeated",
          type: "int32",
          name: "value",
          id: 2
        } ]
      }, {
        name: "update_flag",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "int32",
          name: "flag",
          id: 1
        }, {
          rule: "optional",
          type: "int32",
          name: "value",
          id: 2
        } ]
      }, {
        name: "update_flag_ret",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "bool",
          name: "result",
          id: 1
        } ]
      }, {
        name: "role_flag_push",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "int32",
          name: "flag",
          id: 1
        }, {
          rule: "optional",
          type: "int32",
          name: "value",
          id: 2
        } ]
      }, {
        name: "get_rank_info",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "int32",
          name: "type",
          id: 1
        } ]
      }, {
        name: "get_rank_info_ret",
        syntax: "proto2",
        fields: [ {
          rule: "repeated",
          type: "Rank",
          name: "topRank",
          id: 1
        }, {
          rule: "optional",
          type: "Rank",
          name: "myRank",
          id: 2
        } ]
      }, {
        name: "acc_batch_building",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "int32",
          name: "buildingID",
          id: 1
        } ]
      }, {
        name: "acc_batch_building_ret",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "DataBuilding",
          name: "building",
          id: 1
        } ]
      }, {
        name: "acc_batch_people",
        syntax: "proto2",
        fields: []
      }, {
        name: "acc_batch_people_ret",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "DataUnemployed",
          name: "unemployed",
          id: 1
        } ]
      }, {
        name: "acc_upgrade_technology",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "int32",
          name: "techID",
          id: 1
        } ]
      }, {
        name: "acc_upgrade_technology_ret",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "Technology",
          name: "technology",
          id: 1
        } ]
      }, {
        name: "acc_hunt",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "int32",
          name: "huntID",
          id: 1
        } ]
      }, {
        name: "acc_hunt_ret",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "DataHunt",
          name: "hunt",
          id: 1
        } ]
      }, {
        name: "C2GS",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "int32",
          name: "session",
          id: 1
        }, {
          rule: "repeated",
          type: "int32",
          name: "sequence",
          id: 2
        }, {
          rule: "optional",
          type: "heart_beat",
          name: "heartBeat",
          id: 3
        }, {
          rule: "optional",
          type: "login_register",
          name: "loginRegister",
          id: 6
        }, {
          rule: "optional",
          type: "login_login",
          name: "loginLogin",
          id: 7
        }, {
          rule: "optional",
          type: "login_server",
          name: "loginServer",
          id: 11
        }, {
          rule: "optional",
          type: "create_role",
          name: "createRole",
          id: 12
        }, {
          rule: "optional",
          type: "bool",
          name: "getNotice",
          id: 18
        }, {
          rule: "optional",
          type: "sync_data",
          name: "syncData",
          id: 20
        }, {
          rule: "optional",
          type: "change_nickname",
          name: "changeNickname",
          id: 21
        }, {
          rule: "optional",
          type: "int32",
          name: "getFlag",
          id: 22
        }, {
          rule: "optional",
          type: "random_fight_opponent",
          name: "randomFightOpponent",
          id: 30
        }, {
          rule: "optional",
          type: "start_fight",
          name: "startFight",
          id: 31
        }, {
          rule: "optional",
          type: "get_fight_opponent",
          name: "getFightOpponent",
          id: 32
        }, {
          rule: "optional",
          type: "acc_batch_building",
          name: "accBatchBuilding",
          id: 40
        }, {
          rule: "optional",
          type: "acc_batch_people",
          name: "accBatchPeople",
          id: 41
        }, {
          rule: "optional",
          type: "acc_upgrade_technology",
          name: "accUpgradeTechnology",
          id: 42
        }, {
          rule: "optional",
          type: "acc_hunt",
          name: "accHunt",
          id: 43
        }, {
          rule: "optional",
          type: "bool",
          name: "drawDayShare",
          id: 44
        }, {
          rule: "optional",
          type: "int32",
          name: "drawAchievement",
          id: 45
        }, {
          rule: "optional",
          type: "int32",
          name: "drawMiracle",
          id: 46
        }, {
          rule: "optional",
          type: "int32",
          name: "drawMiracleOnce",
          id: 47
        }, {
          rule: "optional",
          type: "bool",
          name: "updateFightData",
          id: 50
        }, {
          rule: "optional",
          type: "get_rank_info",
          name: "getRankInfo",
          id: 60
        }, {
          rule: "optional",
          type: "GmOperation",
          name: "gmOperation",
          id: 90
        }, {
          rule: "optional",
          type: "test_fight",
          name: "testFight",
          id: 100
        }, {
          rule: "optional",
          type: "test_fight_count",
          name: "testFightCount",
          id: 101
        }, {
          rule: "optional",
          type: "log_in_out",
          name: "logInOut",
          id: 200
        }, {
          rule: "optional",
          type: "log_yuanbao",
          name: "logYuanBao",
          id: 201
        }, {
          rule: "optional",
          type: "channel_login",
          name: "channelLogin",
          id: 400
        }, {
          rule: "optional",
          type: "int64",
          name: "kickoff",
          id: 500
        }, {
          rule: "optional",
          type: "guest_bind",
          name: "guestBind",
          id: 601
        }, {
          rule: "optional",
          type: "recoup_role",
          name: "recoupRole",
          id: 602
        } ]
      }, {
        name: "GS2C",
        syntax: "proto2",
        fields: [ {
          rule: "optional",
          type: "int32",
          name: "session",
          id: 1
        }, {
          rule: "repeated",
          type: "int32",
          name: "sequence",
          id: 2
        }, {
          rule: "optional",
          type: "heart_beat_ret",
          name: "heartBeatRet",
          id: 3
        }, {
          rule: "optional",
          type: "login_register_ret",
          name: "loginRegisterRet",
          id: 6
        }, {
          rule: "optional",
          type: "login_login_ret",
          name: "loginLoginRet",
          id: 7
        }, {
          rule: "optional",
          type: "login_sever_ret",
          name: "loginServerRet",
          id: 11
        }, {
          rule: "optional",
          type: "create_role_ret",
          name: "createRoleRet",
          id: 12
        }, {
          rule: "optional",
          type: "string",
          name: "getNoticeRet",
          id: 18
        }, {
          rule: "optional",
          type: "sync_data_ret",
          name: "syncDataRet",
          id: 20
        }, {
          rule: "optional",
          type: "change_nickname_ret",
          name: "changeNicknameRet",
          id: 21
        }, {
          rule: "optional",
          type: "Flag",
          name: "getFlagRet",
          id: 22
        }, {
          rule: "optional",
          type: "random_fight_opponent_ret",
          name: "randomFightOpponentRet",
          id: 30
        }, {
          rule: "optional",
          type: "start_fight_ret",
          name: "startFightRet",
          id: 31
        }, {
          rule: "optional",
          type: "get_fight_opponent_ret",
          name: "getFightOpponentRet",
          id: 32
        }, {
          rule: "optional",
          type: "acc_batch_building_ret",
          name: "accBatchBuildingRet",
          id: 40
        }, {
          rule: "optional",
          type: "acc_batch_people_ret",
          name: "accBatchPeopleRet",
          id: 41
        }, {
          rule: "optional",
          type: "acc_upgrade_technology_ret",
          name: "accUpgradeTechnologyRet",
          id: 42
        }, {
          rule: "optional",
          type: "acc_hunt_ret",
          name: "accHuntRet",
          id: 43
        }, {
          rule: "optional",
          type: "bool",
          name: "drawDayShareRet",
          id: 44
        }, {
          rule: "optional",
          type: "bool",
          name: "drawAchievementRet",
          id: 45
        }, {
          rule: "optional",
          type: "int64",
          name: "drawMiracleRet",
          id: 46
        }, {
          rule: "optional",
          type: "bool",
          name: "drawMiracleOnceRet",
          id: 47
        }, {
          rule: "optional",
          type: "bool",
          name: "updateFightDataRet",
          id: 50
        }, {
          rule: "optional",
          type: "get_rank_info_ret",
          name: "getRankInfoRet",
          id: 60
        }, {
          rule: "optional",
          type: "GmOperation",
          name: "gmOperationRet",
          id: 90
        }, {
          rule: "optional",
          type: "start_fight_ret",
          name: "testFightRet",
          id: 100
        }, {
          rule: "optional",
          type: "test_fight_count_ret",
          name: "testFightCountRet",
          id: 101
        }, {
          rule: "optional",
          type: "bool",
          name: "logInOutRet",
          id: 200
        }, {
          rule: "optional",
          type: "bool",
          name: "logYuanBaoRet",
          id: 201
        }, {
          rule: "optional",
          type: "channel_login_ret",
          name: "channelLoginRet",
          id: 400
        }, {
          rule: "optional",
          type: "int64",
          name: "kickoffRet",
          id: 500
        }, {
          rule: "optional",
          type: "bool",
          name: "guestBindRet",
          id: 601
        }, {
          rule: "optional",
          type: "bool",
          name: "recoupRoleRet",
          id: 602
        }, {
          rule: "optional",
          type: "result_push",
          name: "resultPush",
          id: 1e3
        }, {
          rule: "optional",
          type: "kickoff_push",
          name: "kickoffPush",
          id: 1001
        }, {
          rule: "optional",
          type: "open_push",
          name: "openPush",
          id: 1002
        }, {
          rule: "optional",
          type: "Flag",
          name: "flagPush",
          id: 1003
        }, {
          rule: "optional",
          type: "DataResource",
          name: "resourcePush",
          id: 1004
        }, {
          rule: "repeated",
          type: "Statistics",
          name: "statisticsPush",
          id: 1005
        }, {
          rule: "optional",
          type: "recoup_role",
          name: "opRecoupRole",
          id: 1006
        }, {
          rule: "optional",
          type: "bool",
          name: "newNoticePush",
          id: 1007
        } ]
      } ],
      enums: [ {
        name: "login_Result",
        syntax: "proto2",
        values: [ {
          name: "loginSuccess",
          id: 1
        }, {
          name: "invalidUser",
          id: 2
        }, {
          name: "invalidPwd",
          id: 3
        }, {
          name: "forbiddenUser",
          id: 4
        }, {
          name: "invalidMaintain",
          id: 5
        }, {
          name: "invalidGameServer",
          id: 6
        } ]
      }, {
        name: "register_Result",
        syntax: "proto2",
        values: [ {
          name: "registerSuccess",
          id: 1
        }, {
          name: "userExists",
          id: 2
        }, {
          name: "invalidFormat",
          id: 3
        }, {
          name: "invalidServer",
          id: 6
        } ]
      }, {
        name: "server_Result",
        syntax: "proto2",
        values: [ {
          name: "success",
          id: 1
        }, {
          name: "maintenance",
          id: 2
        }, {
          name: "notLogin",
          id: 3
        } ]
      } ],
      services: [ {
        name: "RPCService",
        options: {},
        rpc: {
          request: {
            request: "C2GS",
            request_stream: false,
            response: "GS2C",
            response_stream: false,
            options: {}
          }
        }
      } ],
      isNamespace: true
    }).build([ "protocol" ]);
    module.exports = protocol;
    cc._RF.pop();
  }, {} ],
  network: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "7e9b5MfwetNZr1FIGJKz57q", "network");
    "use strict";
    window.network = {
      initNetwork: function initNetwork() {
        this.pomeloBuildObj = pomeloBuild.create();
        this.pomelo = this.pomeloBuildObj.pomelo;
        this.isBinding = false;
        if (!this.isBinding) {
          this.onMessage = this.onMessage.bind(this);
          this.isBinding = true;
        }
        this.netListener = eventListener.create("one");
        this.reset();
        this._registerNetEvent();
      },
      reset: function reset() {
        this.curMsgName = "";
        this.routerManager = {};
      },
      _registerNetEvent: function _registerNetEvent() {
        this.pomelo["on"]("heartbeat timeout", function() {
          this.pomelo["disconnect"]();
          this.netListener.dispatch("reconnect timeout", {});
        }.bind(this));
        this.pomelo["on"]("heartbeat recv", function() {
          clientEvent.dispatch("updateNetworkState", "heartBeatRet");
        }.bind(this));
        this.pomelo["on"]("close", function() {
          this.pomelo["disconnect"]();
          this.netListener.dispatch("network close", {});
        }.bind(this));
        this.pomelo["on"]("onKick", function() {
          this.netListener.dispatch("kick user", {});
          this.receiveRouterFromServer("close all netLoading");
        }.bind(this));
      },
      on: function on(route) {
        this.netListener.on.apply(this.netListener, arguments);
        pomelo["on"](route, this.onMessage);
      },
      getCurMsgName: function getCurMsgName() {
        return this.curMsgName;
      },
      connect: function connect(ip, port, cb) {
        var netConfig = {
          host: ip,
          port: port,
          log: true
        };
        this.isKicked = false;
        netConfig.wsStr = "wss://";
        setTimeout(function() {
          this.pomelo["init"](netConfig, function() {
            cb && cb();
          }.bind(this));
        }.bind(this), 0);
      },
      disconnect: function disconnect() {
        this.isConnected() && this.pomelo["disconnect"]();
      },
      guid: function guid() {
        function s4() {
          return Math.floor(65536 * (1 + Math.random())).toString(16).substring(1);
        }
        return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
      },
      send: function send(routeStr, dataObj) {
        "undefined" === typeof dataObj && (dataObj = {});
        dataObj.uuid = this.guid();
        console.log("send route:" + routeStr + " data:" + JSON.stringify(dataObj));
        this.addRouterToManager(routeStr);
        this.isConnected() && this.pomelo["request"](routeStr, dataObj, this.onMessage);
      },
      onMessage: function onMessage(msgOrigin) {
        var router = msgOrigin["route"];
        this.receiveRouterFromServer(router);
        console.log("receive msg from :" + JSON.stringify(msgOrigin));
        500 === msgOrigin["body"]["code"] && cc.error("server data error, can't find the route:" + router);
        if (!router) {
          cc.error("please add the msg route in server");
          return;
        }
        if (Object.keys(msgOrigin["body"]).length <= 0) {
          cc.error("server data error, can't response no data proto");
          return;
        }
        this.curMsgName = msgOrigin["route"];
        this.netListener.dispatch(msgOrigin["route"], msgOrigin["body"]);
      },
      setNetLoadingStatus: function setNetLoadingStatus(flag) {
        flag || clientEvent.dispatch("hidePanel", "netLoadingPanel");
      },
      checkNetLoadingStatus: function checkNetLoadingStatus() {
        var keys = Object.keys(this.routerManager);
        var keysLength = keys.length;
        if (keysLength <= 0) {
          this.netListener.dispatch("hidePanel", "netLoadingPanel");
          return;
        }
        var currentTime = Date.now();
        for (var key in this.routerManager) if (this.routerManager.hasOwnProperty(key)) {
          var routerTime = this.routerManager[key];
          var deltaTime = currentTime - routerTime;
          if (deltaTime > this.netLoadingCheckInterval) return;
        }
      },
      addRouterToManager: function addRouterToManager(router) {
        var keys = Object.keys(this.routerManager);
        if (-1 === keys.indexOf("connectTimeout")) {
          "connectTimeout" === router && (this.routerManager = {});
          keys = Object.keys(this.routerManager);
          var index = keys.indexOf(router);
          if (-1 === index) {
            var currentTime = Date.now();
            this.routerManager[router] = currentTime;
          }
        }
      },
      receiveRouterFromServer: function receiveRouterFromServer(router) {
        if ("close all netLoading" === router) {
          this.routerManager = {};
          this.checkNetLoadingStatus();
          return;
        }
        var keys = Object.keys(this.routerManager);
        var index = keys.indexOf(router);
        if (index > -1) {
          console.log(router, "cost", Date.now() - this.routerManager[router], "ms");
          delete this.routerManager[router];
          this.checkNetLoadingStatus();
        }
      },
      clearCallback: function clearCallback() {
        this.pomelo && this.pomelo.clearCallback();
      }
    };
    network.isConnecting = function() {
      return this.pomelo.isConnecting();
    };
    network.isConnected = function() {
      return this.pomelo.isOpen();
    };
    network.isClosed = function() {
      return this.pomelo.isClosed();
    };
    network.isClosing = function() {
      return this.pomelo.isClosing();
    };
    network.chooseNetworkMode = function() {
      this.initNetwork();
      if (this.pomelo) for (var key in this.netListener) this.pomelo["on"](key, this.onMessage);
    };
    network.on = function(msgName, handler) {
      this.netListener.on(msgName, handler);
    };
    network.dispatch = function(msgName, msgContent) {
      this.netListener.dispatch(msgName, msgContent);
    };
    cc._RF.pop();
  }, {} ],
  pathManager: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "85adfHNP99AnowHXOf4M0WT", "pathManager");
    "use strict";
    var mvs = require("Matchvs");
    cc.Class({
      extends: cc.Component,
      properties: {
        blueHead: {
          type: cc.Prefab,
          default: null
        },
        blueCorner: {
          type: cc.Prefab,
          default: null
        },
        blueStraight: {
          type: cc.Prefab,
          default: null
        },
        redHead: {
          type: cc.Prefab,
          default: null
        },
        redCorner: {
          type: cc.Prefab,
          default: null
        },
        redStraight: {
          type: cc.Prefab,
          default: null
        }
      },
      onLoad: function onLoad() {
        Game.PathManager = this;
        this.arrMap = [];
        this.blueHeadPool = new cc.NodePool();
        this.blueCornerPool = new cc.NodePool();
        this.blueStraightPool = new cc.NodePool();
        this.redHeadPool = new cc.NodePool();
        this.redCornerPool = new cc.NodePool();
        this.redStraightPool = new cc.NodePool();
      },
      addPath: function addPath(arrPath, id) {
        this.arrMap = Game.BlockManager.arrMap;
        if (this.arrMap.length <= 0) return;
        for (var path = 0; path < arrPath.length; path++) if (0 === path) {
          var angle = this.twoNodeRotation(arrPath[path], arrPath[path + 1]);
          var pos1 = this.arrMap[arrPath[path].row][arrPath[path].col].pos;
          var pos2 = this.arrMap[arrPath[path + 1].row][arrPath[path + 1].col].pos;
          this.setHead(id, angle, pos1);
          var data = this.straightPosAndLong(pos1, pos2);
          this.setStraight(id, angle, data.pos, data.long);
        } else if (path === arrPath.length - 1) {
          var _angle = this.twoNodeRotation(arrPath[path], arrPath[path - 1]);
          var pos = this.arrMap[arrPath[path].row][arrPath[path].col].pos;
          this.setHead(id, _angle, pos);
        } else {
          var angleCorner = this.threeNodeRotation(arrPath[path - 1], arrPath[path], arrPath[path + 1]);
          var _pos = this.arrMap[arrPath[path].row][arrPath[path].col].pos;
          var _pos2 = this.arrMap[arrPath[path + 1].row][arrPath[path + 1].col].pos;
          this.setCorner(id, angleCorner, _pos);
          var _data = this.straightPosAndLong(_pos, _pos2);
          var _angle2 = this.twoNodeRotation(arrPath[path], arrPath[path + 1]);
          this.setStraight(id, _angle2, _data.pos, _data.long);
        }
      },
      twoNodeRotation: function twoNodeRotation(path1, path2) {
        var angle = 0;
        path1.row !== path2.row ? angle = path1.row > path2.row ? 180 : 0 : path1.col !== path2.col && (angle = path1.col > path2.col ? 90 : 270);
        return angle;
      },
      threeNodeRotation: function threeNodeRotation(path1, path2, path3) {
        var angle = 0;
        path1.row !== path2.row ? path1.row > path2.row ? angle = path2.col > path3.col ? 0 : 270 : path1.row < path2.row && (angle = path2.col > path3.col ? 90 : 180) : path1.col > path2.col ? angle = path2.row > path3.row ? 180 : 270 : path1.col < path2.col && (angle = path2.row > path3.row ? 90 : 0);
        return angle;
      },
      setHead: function setHead(id, angle, pos) {
        if (id === Game.PlayerManager.self.playerId) {
          var head = this.blueHeadPool.get();
          head || (head = cc.instantiate(this.blueHead));
        } else {
          var head = this.redHeadPool.get();
          head || (head = cc.instantiate(this.redHead));
        }
        head.parent = this.node;
        head.rotation = angle;
        head.setPosition(pos);
        head.getComponent(cc.Animation).play("pathHead");
        head.getComponent("path").initDelete(.4);
      },
      setCorner: function setCorner(id, angle, pos) {
        if (id === Game.PlayerManager.self.playerId) {
          var corner = this.blueCornerPool.get();
          corner || (corner = cc.instantiate(this.blueCorner));
        } else {
          var corner = this.redCornerPool.get();
          corner || (corner = cc.instantiate(this.redCorner));
        }
        corner.parent = this.node;
        corner.rotation = angle;
        corner.setPosition(pos);
        corner.getComponent("path").initDelete(.4);
      },
      setStraight: function setStraight(id, angle, pos, long) {
        if (id === Game.PlayerManager.self.playerId) {
          var straight = this.blueStraightPool.get();
          straight || (straight = cc.instantiate(this.blueStraight));
        } else {
          var straight = this.redStraightPool.get();
          straight || (straight = cc.instantiate(this.redStraight));
        }
        straight.parent = this.node;
        straight.rotation = angle;
        straight.setPosition(pos);
        straight.height = long;
        straight.getChildByName("electric").width = 2 * long + 50;
        straight.getComponent("path").initDelete(.4);
      },
      straightPosAndLong: function straightPosAndLong(pos1, pos2) {
        var long = 0;
        var pos = cc.p();
        if (pos1.x === pos2.x) if (pos1.y > pos2.y) {
          pos = cc.p(pos1.x, pos1.y - 20);
          long = pos1.y - pos2.y - 20;
        } else {
          pos = cc.p(pos1.x, pos1.y + 20);
          long = pos2.y - pos1.y - 20;
        } else if (pos1.y === pos2.y) if (pos1.x > pos2.x) {
          pos = cc.p(pos1.x - 20, pos1.y);
          long = pos1.x - pos2.x - 20;
        } else {
          pos = cc.p(pos1.x + 20, pos1.y);
          long = pos2.x - pos1.x - 20;
        }
        var data = {
          pos: pos,
          long: long
        };
        return data;
      },
      recyclePath: function recyclePath(target) {
        switch (target.name) {
         case "blueHead":
          this.blueHeadPool.put(target);
          break;

         case "blueCorner":
          this.blueCornerPool.put(target);
          break;

         case "blueStraight":
          this.blueStraightPool.put(target);
          break;

         case "redHead":
          this.redHeadPool.put(target);
          break;

         case "redCorner":
          this.redCornerPool.put(target);
          break;

         case "redStraight":
          this.redStraightPool.put(target);
        }
      }
    });
    cc._RF.pop();
  }, {
    Matchvs: "Matchvs"
  } ],
  path: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "2567ddW4flIRr9ymsxz8doh", "path");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {},
      start: function start() {},
      initDelete: function initDelete(time) {
        var _this = this;
        this.scheduleOnce(function() {
          Game.PathManager.recyclePath(_this.node);
        }, time);
      }
    });
    cc._RF.pop();
  }, {} ],
  playerIcon: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "7c5b0PM5GxL454wtQ2uJEdQ", "playerIcon");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        playerSprite: {
          default: null,
          type: cc.Sprite
        }
      },
      setData: function setData(userInfo) {
        this.userInfo = userInfo;
        this.playerId = userInfo.id ? userInfo.id : userInfo.userId;
        this.playerSprite.node.active = true;
        Game.GameManager.userInfoReq(this.playerId);
      },
      init: function init() {
        this.userInfo = null;
        clientEvent.on(clientEvent.eventType.playerAccountGet, this.userInfoSet, this);
      },
      userInfoSet: function userInfoSet(recvMsg) {
        recvMsg.account == this.playerId && recvMsg.headIcon && "-" !== recvMsg.headIcon && cc.loader.load({
          url: recvMsg.headIcon,
          type: "png"
        }, function(err, texture) {
          var spriteFrame = new cc.SpriteFrame(texture, cc.Rect(0, 0, texture.width, texture.height));
          this.playerSprite && (this.playerSprite.spriteFrame = spriteFrame);
        }.bind(this));
      },
      onDestroy: function onDestroy() {
        clientEvent.off(clientEvent.eventType.playerAccountGet, this.userInfoSet, this);
      },
      onLoad: function onLoad() {
        this.init();
      }
    });
    cc._RF.pop();
  }, {} ],
  playerManager: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "98205mAT71MRqdnPLQj5llV", "playerManager");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        selfNode: cc.Node,
        rivalNode: cc.Node
      },
      onLoad: function onLoad() {
        Game.PlayerManager = this;
        this.playerInit();
      },
      playerInit: function playerInit() {
        this.self = this.selfNode.getComponent("player");
        this.self.init(GLB.playerUserIds[0]);
        this.rival = this.rivalNode.getComponent("player");
        this.rival.init(GLB.playerUserIds[1]);
      }
    });
    cc._RF.pop();
  }, {} ],
  player: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "9d5f3ZY5/RK/Ii3XDRXaXsO", "player");
    "use strict";
    var mvs = require("Matchvs");
    cc.Class({
      extends: cc.Component,
      properties: {
        scoreLabel: {
          default: null,
          type: cc.Node
        }
      },
      onLoad: function onLoad() {
        this.score = 0;
        this.combo = 1;
        this.maxCombo = 0;
        this.blockNumber = 0;
        this.buff = 20;
      },
      init: function init(playerId) {
        this.playerId = playerId;
      },
      addScore: function addScore() {
        this.score += 10 * this.combo;
        this.blockNumber += 2;
        this.buff = 20;
        this.combo++;
        this.combo > this.maxCombo && (this.maxCombo = this.combo);
        this.changeScore();
      },
      buffTime: function buffTime() {
        if (!Game.ClickManager.bClick) return;
        this.buff--;
        this.buff <= 0 && (this.combo = 1);
      },
      getData: function getData() {
        var data = {
          score: this.score,
          combo: this.combo,
          maxCombo: this.maxCombo,
          blockNumber: this.blockNumber,
          buff: this.buff
        };
        return data;
      },
      setData: function setData(data) {
        this.score = data.score;
        this.combo = data.combo;
        this.maxCombo = data.maxCombo;
        this.blockNumber = data.blockNumber;
        this.buff = data.buff;
      },
      changeScore: function changeScore() {
        this.scoreLabel.getComponent(cc.Label).string = this.score;
        this.node.dispatchEvent(new cc.Event.EventCustom(clientEvent.eventType.setScoreProgressBar, true));
      }
    });
    cc._RF.pop();
  }, {
    Matchvs: "Matchvs"
  } ],
  pomeloBuild: [ function(require, module, exports) {
    (function(Buffer) {
      "use strict";
      cc._RF.push(module, "c59516Ze9ZGv5XFLtGVgFKL", "pomeloBuild");
      "use strict";
      var _typeof = "function" === typeof Symbol && "symbol" === typeof Symbol.iterator ? function(obj) {
        return typeof obj;
      } : function(obj) {
        return obj && "function" === typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
      var has = Object.prototype.hasOwnProperty;
      var pomeloBuild = cc.Class({
        onLoad: function onLoad() {
          this.modules = {};
          this.aliases = {};
        },
        requirePomelo: function requirePomelo(path, parent, orig) {
          var resolved = this.resolve(path);
          if (null === resolved) {
            orig = orig || path;
            parent = parent || "root";
            var err = new Error('Failed to requirePomelo "' + orig + '" from "' + parent + '"');
            err.path = orig;
            err.parent = parent;
            err.requirePomelo = true;
            throw err;
          }
          var module = this.modules[resolved];
          if (!module.exports) {
            module.exports = {};
            module.client = module.component = true;
            module.call(this, module.exports, this.relative(resolved), module);
          }
          return module.exports;
        },
        resolve: function resolve(path) {
          "/" === path.charAt(0) && (path = path.slice(1));
          var index = path + "/index.js";
          var paths = [ path, path + ".js", path + ".json", path + "/index.js", path + "/index.json" ];
          for (var i = 0; i < paths.length; i++) {
            var resolvePath = paths[i];
            if (has.call(this.modules, resolvePath)) return resolvePath;
          }
          if (has.call(this.aliases, index)) return this.aliases[index];
        },
        normalize: function normalize(curr, path) {
          var segs = [];
          if ("." !== path.charAt(0)) return path;
          curr = curr.split("/");
          path = path.split("/");
          for (var i = 0; i < path.length; ++i) ".." === path[i] ? curr.pop() : "." !== path[i] && "" !== path[i] && segs.push(path[i]);
          return curr.concat(segs).join("/");
        },
        register: function register(path, definition) {
          this.modules[path] = definition;
        },
        alias: function alias(from, to) {
          if (!has.call(this.modules, from)) throw new Error('Failed to alias "' + from + '", it does not exist');
          this.aliases[to] = from;
        },
        relative: function relative(parent) {
          var p = this.normalize(parent, "..");
          function lastIndexOf(arr, obj) {
            var i = arr.length;
            while (i--) if (arr[i] === obj) return i;
            return -1;
          }
          var selfPomelo = this;
          function localrequirePomelo(path) {
            var resolved = localrequirePomelo.resolve(path);
            return selfPomelo.requirePomelo(resolved, parent, path);
          }
          localrequirePomelo.resolve = function(path) {
            var c = path.charAt(0);
            if ("/" === c) return path.slice(1);
            if ("." === c) return selfPomelo.normalize(p, path);
            var segs = parent.split("/");
            var i = lastIndexOf(segs, "deps") + 1;
            i || (i = 0);
            path = segs.slice(0, i + 1).join("/") + "/deps/" + path;
            return path;
          };
          localrequirePomelo.exists = function(path) {
            return has.call(selfPomelo.modules, localrequirePomelo.resolve(path));
          };
          return localrequirePomelo;
        }
      });
      pomeloBuild.create = function() {
        var pomeloBuildObj = new pomeloBuild();
        pomeloBuildObj.onLoad();
        pomeloBuildObj.register("component-indexof/index.js", function(exports, requirePomelo, module) {
          var indexOf = [].indexOf;
          module.exports = function(arr, obj) {
            if (indexOf) return arr.indexOf(obj);
            for (var i = 0; i < arr.length; ++i) if (arr[i] === obj) return i;
            return -1;
          };
        });
        pomeloBuildObj.register("component-emitter/index.js", function(exports, requirePomelo, module) {
          var index = requirePomelo("indexof");
          module.exports = Emitter;
          function Emitter(obj) {
            if (obj) return mixin(obj);
          }
          function mixin(obj) {
            for (var key in Emitter.prototype) obj[key] = Emitter.prototype[key];
            return obj;
          }
          Emitter.prototype.on = function(event, fn) {
            this._callbacks = this._callbacks || {};
            (this._callbacks[event] = this._callbacks[event] || []).push(fn);
            return this;
          };
          Emitter.prototype.once = function(event, fn) {
            var self = this;
            this._callbacks = this._callbacks || {};
            function on() {
              self.off(event, on);
              fn.apply(this, arguments);
            }
            fn._off = on;
            this.on(event, on);
            return this;
          };
          Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = function(event, fn) {
            this._callbacks = this._callbacks || {};
            if (0 === arguments.length) {
              this._callbacks = {};
              return this;
            }
            var callbacks = this._callbacks[event];
            if (!callbacks) return this;
            if (1 === arguments.length) {
              delete this._callbacks[event];
              return this;
            }
            var i = index(callbacks, fn._off || fn);
            ~i && callbacks.splice(i, 1);
            return this;
          };
          Emitter.prototype.emit = function(event) {
            this._callbacks = this._callbacks || {};
            var args = [].slice.call(arguments, 1), callbacks = this._callbacks[event];
            if (callbacks) {
              callbacks = callbacks.slice(0);
              for (var i = 0, len = callbacks.length; i < len; ++i) callbacks[i].apply(this, args);
            }
            return this;
          };
          Emitter.prototype.listeners = function(event) {
            this._callbacks = this._callbacks || {};
            return this._callbacks[event] || [];
          };
          Emitter.prototype.hasListeners = function(event) {
            return !!this.listeners(event).length;
          };
        });
        pomeloBuildObj.register("NetEase-pomelo-protocol/lib/protocol.js", function(exports, requirePomelo, module) {
          (function(exports, ByteArray, global) {
            var Protocol = exports;
            var PKG_HEAD_BYTES = 4;
            var MSG_FLAG_BYTES = 1;
            var MSG_ROUTE_CODE_BYTES = 2;
            var MSG_ID_MAX_BYTES = 5;
            var MSG_ROUTE_LEN_BYTES = 1;
            var MSG_ROUTE_CODE_MAX = 65535;
            var MSG_COMPRESS_ROUTE_MASK = 1;
            var MSG_TYPE_MASK = 7;
            var Package = Protocol.Package = {};
            var Message = Protocol.Message = {};
            Package.TYPE_HANDSHAKE = 1;
            Package.TYPE_HANDSHAKE_ACK = 2;
            Package.TYPE_HEARTBEAT = 3;
            Package.TYPE_DATA = 4;
            Package.TYPE_KICK = 5;
            Message.TYPE_REQUEST = 0;
            Message.TYPE_NOTIFY = 1;
            Message.TYPE_RESPONSE = 2;
            Message.TYPE_PUSH = 3;
            Protocol.strencode = function(str) {
              var byteArray = new ByteArray(3 * str.length);
              var offset = 0;
              for (var i = 0; i < str.length; i++) {
                var charCode = str.charCodeAt(i);
                var codes = null;
                codes = charCode <= 127 ? [ charCode ] : charCode <= 2047 ? [ 192 | charCode >> 6, 128 | 63 & charCode ] : [ 224 | charCode >> 12, 128 | (4032 & charCode) >> 6, 128 | 63 & charCode ];
                for (var j = 0; j < codes.length; j++) {
                  byteArray[offset] = codes[j];
                  ++offset;
                }
              }
              var _buffer = new ByteArray(offset);
              copyArray(_buffer, 0, byteArray, 0, offset);
              return _buffer;
            };
            Protocol.strdecode = function(buffer) {
              var bytes = new ByteArray(buffer);
              var array = [];
              var offset = 0;
              var charCode = 0;
              var end = bytes.length;
              while (offset < end) {
                if (bytes[offset] < 128) {
                  charCode = bytes[offset];
                  offset += 1;
                } else if (bytes[offset] < 224) {
                  charCode = ((63 & bytes[offset]) << 6) + (63 & bytes[offset + 1]);
                  offset += 2;
                } else {
                  charCode = ((15 & bytes[offset]) << 12) + ((63 & bytes[offset + 1]) << 6) + (63 & bytes[offset + 2]);
                  offset += 3;
                }
                array.push(charCode);
              }
              var res = "";
              var chunk = 8192;
              var i;
              for (i = 0; i < array.length / chunk; i++) res += String.fromCharCode.apply(null, array.slice(i * chunk, (i + 1) * chunk));
              res += String.fromCharCode.apply(null, array.slice(i * chunk));
              return res;
            };
            Package.encode = function(type, body) {
              var length = body ? body.length : 0;
              var buffer = new ByteArray(PKG_HEAD_BYTES + length);
              var index = 0;
              buffer[index++] = 255 & type;
              buffer[index++] = length >> 16 & 255;
              buffer[index++] = length >> 8 & 255;
              buffer[index++] = 255 & length;
              body && copyArray(buffer, index, body, 0, length);
              return buffer;
            };
            Package.decode = function(buffer) {
              var bytes = new ByteArray(buffer);
              var type = bytes[0];
              var index = 1;
              var length = (bytes[index++] << 16 | bytes[index++] << 8 | bytes[index++]) >>> 0;
              var body = length ? new ByteArray(length) : null;
              copyArray(body, 0, bytes, PKG_HEAD_BYTES, length);
              return {
                type: type,
                body: body
              };
            };
            Message.encode = function(id, type, compressRoute, route, msg) {
              var idBytes = msgHasId(type) ? caculateMsgIdBytes(id) : 0;
              var msgLen = MSG_FLAG_BYTES + idBytes;
              if (msgHasRoute(type)) if (compressRoute) {
                if ("number" !== typeof route) throw new Error("error flag for number route!");
                msgLen += MSG_ROUTE_CODE_BYTES;
              } else {
                msgLen += MSG_ROUTE_LEN_BYTES;
                if (route) {
                  route = Protocol.strencode(route);
                  if (route.length > 255) throw new Error("route maxlength is overflow");
                  msgLen += route.length;
                }
              }
              msg && (msgLen += msg.length);
              var buffer = new ByteArray(msgLen);
              var offset = 0;
              offset = encodeMsgFlag(type, compressRoute, buffer, offset);
              msgHasId(type) && (offset = encodeMsgId(id, idBytes, buffer, offset));
              msgHasRoute(type) && (offset = encodeMsgRoute(compressRoute, route, buffer, offset));
              msg && (offset = encodeMsgBody(msg, buffer, offset));
              return buffer;
            };
            Message.decode = function(buffer) {
              var bytes = new ByteArray(buffer);
              var bytesLen = bytes.length || bytes.byteLength;
              var offset = 0;
              var id = 0;
              var route = null;
              var flag = bytes[offset++];
              var compressRoute = flag & MSG_COMPRESS_ROUTE_MASK;
              var type = flag >> 1 & MSG_TYPE_MASK;
              if (msgHasId(type)) {
                var byte = bytes[offset++];
                id = 127 & byte;
                while (128 & byte) {
                  id <<= 7;
                  byte = bytes[offset++];
                  id |= 127 & byte;
                }
              }
              if (msgHasRoute(type)) if (compressRoute) route = bytes[offset++] << 8 | bytes[offset++]; else {
                var routeLen = bytes[offset++];
                if (routeLen) {
                  route = new ByteArray(routeLen);
                  copyArray(route, 0, bytes, offset, routeLen);
                  route = Protocol.strdecode(route);
                } else route = "";
                offset += routeLen;
              }
              var bodyLen = bytesLen - offset;
              var body = new ByteArray(bodyLen);
              copyArray(body, 0, bytes, offset, bodyLen);
              return {
                id: id,
                type: type,
                compressRoute: compressRoute,
                route: route,
                body: body
              };
            };
            var copyArray = function copyArray(dest, doffset, src, soffset, length) {
              if ("function" === typeof src.copy) src.copy(dest, doffset, soffset, soffset + length); else for (var index = 0; index < length; index++) dest[doffset++] = src[soffset++];
            };
            var msgHasId = function msgHasId(type) {
              return type === Message.TYPE_REQUEST || type === Message.TYPE_RESPONSE;
            };
            var msgHasRoute = function msgHasRoute(type) {
              return type === Message.TYPE_REQUEST || type === Message.TYPE_NOTIFY || type === Message.TYPE_PUSH;
            };
            var caculateMsgIdBytes = function caculateMsgIdBytes(id) {
              var len = 0;
              do {
                len += 1;
                id >>= 7;
              } while (id > 0);
              return len;
            };
            var encodeMsgFlag = function encodeMsgFlag(type, compressRoute, buffer, offset) {
              if (type !== Message.TYPE_REQUEST && type !== Message.TYPE_NOTIFY && type !== Message.TYPE_RESPONSE && type !== Message.TYPE_PUSH) throw new Error("unkonw message type: " + type);
              buffer[offset] = type << 1 | (compressRoute ? 1 : 0);
              return offset + MSG_FLAG_BYTES;
            };
            var encodeMsgId = function encodeMsgId(id, idBytes, buffer, offset) {
              var index = offset + idBytes - 1;
              buffer[index--] = 127 & id;
              while (index >= offset) {
                id >>= 7;
                buffer[index--] = 127 & id | 128;
              }
              return offset + idBytes;
            };
            var encodeMsgRoute = function encodeMsgRoute(compressRoute, route, buffer, offset) {
              if (compressRoute) {
                if (route > MSG_ROUTE_CODE_MAX) throw new Error("route number is overflow");
                buffer[offset++] = route >> 8 & 255;
                buffer[offset++] = 255 & route;
              } else if (route) {
                buffer[offset++] = 255 & route.length;
                copyArray(buffer, offset, route, 0, route.length);
                offset += route.length;
              } else buffer[offset++] = 0;
              return offset;
            };
            var encodeMsgBody = function encodeMsgBody(msg, buffer, offset) {
              copyArray(buffer, offset, msg, 0, msg.length);
              return offset + msg.length;
            };
            module.exports = Protocol;
          })("object" === ("undefined" === typeof module ? "undefined" : _typeof(module)) ? module.exports : this.Protocol = {}, "object" === ("undefined" === typeof module ? "undefined" : _typeof(module)) ? Buffer : Uint8Array, this);
        });
        pomeloBuildObj.register("pomelonode-pomelo-protobuf/lib/client/protobuf.js", function(exports, requirePomelo, module) {
          (function(exports, global) {
            var Protobuf = exports;
            Protobuf.init = function(opts) {
              Protobuf.encoder.init(opts.encoderProtos);
              Protobuf.decoder.init(opts.decoderProtos);
            };
            Protobuf.encode = function(key, msg) {
              return Protobuf.encoder.encode(key, msg);
            };
            Protobuf.decode = function(key, msg) {
              return Protobuf.decoder.decode(key, msg);
            };
            module.exports = Protobuf;
          })("object" === ("undefined" === typeof module ? "undefined" : _typeof(module)) ? module.exports : this.protobuf = {}, this);
          (function(exports, global) {
            var constants = exports.constants = {};
            constants.TYPES = {
              uInt32: 0,
              sInt32: 0,
              int32: 0,
              double: 1,
              string: 2,
              message: 2,
              float: 5
            };
          })("undefined" !== typeof protobuf ? protobuf : module.exports, this);
          (function(exports, global) {
            var Util = exports.util = {};
            Util.isSimpleType = function(type) {
              return "uInt32" === type || "sInt32" === type || "int32" === type || "uInt64" === type || "sInt64" === type || "float" === type || "double" === type;
            };
          })("undefined" !== typeof protobuf ? protobuf : module.exports, this);
          (function(exports, global) {
            var Codec = exports.codec = {};
            var buffer = new ArrayBuffer(8);
            var float32Array = new Float32Array(buffer);
            var float64Array = new Float64Array(buffer);
            var uInt8Array = new Uint8Array(buffer);
            Codec.encodeUInt32 = function(n) {
              var n = parseInt(n);
              if (isNaN(n) || n < 0) return null;
              var result = [];
              do {
                var tmp = n % 128;
                var next = Math.floor(n / 128);
                0 !== next && (tmp += 128);
                result.push(tmp);
                n = next;
              } while (0 !== n);
              return result;
            };
            Codec.encodeSInt32 = function(n) {
              var n = parseInt(n);
              if (isNaN(n)) return null;
              n = n < 0 ? 2 * Math.abs(n) - 1 : 2 * n;
              return Codec.encodeUInt32(n);
            };
            Codec.decodeUInt32 = function(bytes) {
              var n = 0;
              for (var i = 0; i < bytes.length; i++) {
                var m = parseInt(bytes[i]);
                n += (127 & m) * Math.pow(2, 7 * i);
                if (m < 128) return n;
              }
              return n;
            };
            Codec.decodeSInt32 = function(bytes) {
              var n = this.decodeUInt32(bytes);
              var flag = n % 2 === 1 ? -1 : 1;
              n = (n % 2 + n) / 2 * flag;
              return n;
            };
            Codec.encodeFloat = function(float) {
              float32Array[0] = float;
              return uInt8Array;
            };
            Codec.decodeFloat = function(bytes, offset) {
              if (!bytes || bytes.length < offset + 4) return null;
              for (var i = 0; i < 4; i++) uInt8Array[i] = bytes[offset + i];
              return float32Array[0];
            };
            Codec.encodeDouble = function(double) {
              float64Array[0] = double;
              return uInt8Array.subarray(0, 8);
            };
            Codec.decodeDouble = function(bytes, offset) {
              if (!bytes || bytes.length < 8 + offset) return null;
              for (var i = 0; i < 8; i++) uInt8Array[i] = bytes[offset + i];
              return float64Array[0];
            };
            Codec.encodeStr = function(bytes, offset, str) {
              for (var i = 0; i < str.length; i++) {
                var code = str.charCodeAt(i);
                var codes = encode2UTF8(code);
                for (var j = 0; j < codes.length; j++) {
                  bytes[offset] = codes[j];
                  offset++;
                }
              }
              return offset;
            };
            Codec.decodeStr = function(bytes, offset, length) {
              var array = [];
              var end = offset + length;
              while (offset < end) {
                var code = 0;
                if (bytes[offset] < 128) {
                  code = bytes[offset];
                  offset += 1;
                } else if (bytes[offset] < 224) {
                  code = ((63 & bytes[offset]) << 6) + (63 & bytes[offset + 1]);
                  offset += 2;
                } else {
                  code = ((15 & bytes[offset]) << 12) + ((63 & bytes[offset + 1]) << 6) + (63 & bytes[offset + 2]);
                  offset += 3;
                }
                array.push(code);
              }
              var str = "";
              for (var i = 0; i < array.length; ) {
                str += String.fromCharCode.apply(null, array.slice(i, i + 1e4));
                i += 1e4;
              }
              return str;
            };
            Codec.byteLength = function(str) {
              if ("string" !== typeof str) return -1;
              var length = 0;
              for (var i = 0; i < str.length; i++) {
                var code = str.charCodeAt(i);
                length += codeLength(code);
              }
              return length;
            };
            function encode2UTF8(charCode) {
              return charCode <= 127 ? [ charCode ] : charCode <= 2047 ? [ 192 | charCode >> 6, 128 | 63 & charCode ] : [ 224 | charCode >> 12, 128 | (4032 & charCode) >> 6, 128 | 63 & charCode ];
            }
            function codeLength(code) {
              return code <= 127 ? 1 : code <= 2047 ? 2 : 3;
            }
          })("undefined" !== typeof protobuf ? protobuf : module.exports, this);
          (function(exports, global) {
            var protobuf = exports;
            var MsgEncoder = exports.encoder = {};
            var codec = protobuf.codec;
            var constant = protobuf.constants;
            var util = protobuf.util;
            MsgEncoder.init = function(protos) {
              this.protos = protos || {};
            };
            MsgEncoder.encode = function(route, msg) {
              var protos = this.protos[route];
              if (!checkMsg(msg, protos)) return null;
              var length = codec.byteLength(JSON.stringify(msg));
              var buffer = new ArrayBuffer(length);
              var uInt8Array = new Uint8Array(buffer);
              var offset = 0;
              if (!!protos) {
                offset = encodeMsg(uInt8Array, offset, protos, msg);
                if (offset > 0) return uInt8Array.subarray(0, offset);
              }
              return null;
            };
            function checkMsg(msg, protos) {
              if (!protos) return false;
              for (var name in protos) {
                var proto = protos[name];
                switch (proto.option) {
                 case "required":
                  if ("undefined" === typeof msg[name]) return false;

                 case "optional":
                  if ("undefined" !== typeof msg[name]) {
                    var message = protos.__messages[proto.type] || MsgEncoder.protos["message " + proto.type];
                    !message || checkMsg(msg[name], message);
                  }
                  break;

                 case "repeated":
                  var message = protos.__messages[proto.type] || MsgEncoder.protos["message " + proto.type];
                  if (!!msg[name] && !!message) for (var i = 0; i < msg[name].length; i++) if (!checkMsg(msg[name][i], message)) return false;
                }
              }
              return true;
            }
            function encodeMsg(buffer, offset, protos, msg) {
              for (var name in msg) if (!!protos[name]) {
                var proto = protos[name];
                switch (proto.option) {
                 case "required":
                 case "optional":
                  offset = writeBytes(buffer, offset, encodeTag(proto.type, proto.tag));
                  offset = encodeProp(msg[name], proto.type, offset, buffer, protos);
                  break;

                 case "repeated":
                  msg[name].length > 0 && (offset = encodeArray(msg[name], proto, offset, buffer, protos));
                }
              }
              return offset;
            }
            function encodeProp(value, type, offset, buffer, protos) {
              switch (type) {
               case "uInt32":
                offset = writeBytes(buffer, offset, codec.encodeUInt32(value));
                break;

               case "int32":
               case "sInt32":
                offset = writeBytes(buffer, offset, codec.encodeSInt32(value));
                break;

               case "float":
                writeBytes(buffer, offset, codec.encodeFloat(value));
                offset += 4;
                break;

               case "double":
                writeBytes(buffer, offset, codec.encodeDouble(value));
                offset += 8;
                break;

               case "string":
                var length = codec.byteLength(value);
                offset = writeBytes(buffer, offset, codec.encodeUInt32(length));
                codec.encodeStr(buffer, offset, value);
                offset += length;
                break;

               default:
                var message = protos.__messages[type] || MsgEncoder.protos["message " + type];
                if (!!message) {
                  var tmpBuffer = new ArrayBuffer(codec.byteLength(JSON.stringify(value)));
                  var length = 0;
                  length = encodeMsg(tmpBuffer, length, message, value);
                  offset = writeBytes(buffer, offset, codec.encodeUInt32(length));
                  for (var i = 0; i < length; i++) {
                    buffer[offset] = tmpBuffer[i];
                    offset++;
                  }
                }
              }
              return offset;
            }
            function encodeArray(array, proto, offset, buffer, protos) {
              var i = 0;
              if (util.isSimpleType(proto.type)) {
                offset = writeBytes(buffer, offset, encodeTag(proto.type, proto.tag));
                offset = writeBytes(buffer, offset, codec.encodeUInt32(array.length));
                for (i = 0; i < array.length; i++) offset = encodeProp(array[i], proto.type, offset, buffer);
              } else for (i = 0; i < array.length; i++) {
                offset = writeBytes(buffer, offset, encodeTag(proto.type, proto.tag));
                offset = encodeProp(array[i], proto.type, offset, buffer, protos);
              }
              return offset;
            }
            function writeBytes(buffer, offset, bytes) {
              for (var i = 0; i < bytes.length; i++, offset++) buffer[offset] = bytes[i];
              return offset;
            }
            function encodeTag(type, tag) {
              var value = constant.TYPES[type] || 2;
              return codec.encodeUInt32(tag << 3 | value);
            }
          })("undefined" !== typeof protobuf ? protobuf : module.exports, this);
          (function(exports, global) {
            var protobuf = exports;
            var MsgDecoder = exports.decoder = {};
            var codec = protobuf.codec;
            var util = protobuf.util;
            var buffer;
            var offset = 0;
            MsgDecoder.init = function(protos) {
              this.protos = protos || {};
            };
            MsgDecoder.setProtos = function(protos) {
              !protos || (this.protos = protos);
            };
            MsgDecoder.decode = function(route, buf) {
              var protos = this.protos[route];
              buffer = buf;
              offset = 0;
              if (!!protos) return decodeMsg({}, protos, buffer.length);
              return null;
            };
            function decodeMsg(msg, protos, length) {
              while (offset < length) {
                var head = getHead();
                var type = head.type;
                var tag = head.tag;
                var name = protos.__tags[tag];
                switch (protos[name].option) {
                 case "optional":
                 case "required":
                  msg[name] = decodeProp(protos[name].type, protos);
                  break;

                 case "repeated":
                  msg[name] || (msg[name] = []);
                  decodeArray(msg[name], protos[name].type, protos);
                }
              }
              return msg;
            }
            function isFinish(msg, protos) {
              return !protos.__tags[peekHead().tag];
            }
            function getHead() {
              var tag = codec.decodeUInt32(getBytes());
              return {
                type: 7 & tag,
                tag: tag >> 3
              };
            }
            function peekHead() {
              var tag = codec.decodeUInt32(peekBytes());
              return {
                type: 7 & tag,
                tag: tag >> 3
              };
            }
            function decodeProp(type, protos) {
              switch (type) {
               case "uInt32":
                return codec.decodeUInt32(getBytes());

               case "int32":
               case "sInt32":
                return codec.decodeSInt32(getBytes());

               case "float":
                var float = codec.decodeFloat(buffer, offset);
                offset += 4;
                return float;

               case "double":
                var double = codec.decodeDouble(buffer, offset);
                offset += 8;
                return double;

               case "string":
                var length = codec.decodeUInt32(getBytes());
                var str = codec.decodeStr(buffer, offset, length);
                offset += length;
                return str;

               default:
                var message = protos.__messages[type] || MsgDecoder.protos["message " + type];
                if (!!protos && !!message) {
                  var length = codec.decodeUInt32(getBytes());
                  var msg = {};
                  decodeMsg(msg, message, offset + length);
                  return msg;
                }
              }
            }
            function decodeArray(array, type, protos) {
              if (util.isSimpleType(type)) {
                var length = codec.decodeUInt32(getBytes());
                for (var i = 0; i < length; i++) array.push(decodeProp(type));
              } else array.push(decodeProp(type, protos));
            }
            function getBytes(flag) {
              var bytes = [];
              var pos = offset;
              flag = flag || false;
              var b;
              do {
                b = buffer[pos];
                bytes.push(b);
                pos++;
              } while (b >= 128);
              flag || (offset = pos);
              return bytes;
            }
            function peekBytes() {
              return getBytes(true);
            }
          })("undefined" !== typeof protobuf ? protobuf : module.exports, this);
        });
        pomeloBuildObj.register("pomelonode-pomelo-jsclient-websocket/lib/pomelo-client.js", function(exports, requirePomelo, module) {
          (function(self) {
            var JS_WS_CLIENT_TYPE = "js-websocket";
            var JS_WS_CLIENT_VERSION = "0.0.1";
            var Protocol = self.Protocol;
            var Package = Protocol.Package;
            var Message = Protocol.Message;
            var EventEmitter = self.EventEmitter;
            var protobuf = self.protobuf;
            var RES_OK = 200;
            var RES_FAIL = 500;
            var RES_OLD_CLIENT = 501;
            "function" !== typeof Object.create && (Object.create = function(o) {
              function F() {}
              F.prototype = o;
              return new F();
            });
            var root = window;
            var pomelo = Object.create(EventEmitter.prototype);
            root.pomelo = pomelo;
            var socket = null;
            var reqId = 0;
            var callbacks = {};
            var handlers = {};
            var routeMap = {};
            var heartbeatInterval = 0;
            var heartbeatTimeout = 0;
            var nextHeartbeatTimeout = 0;
            var gapThreshold = 100;
            var heartbeatId = null;
            var heartbeatTimeoutId = null;
            var handshakeCallback = null;
            var handshakeBuffer = {
              sys: {
                type: JS_WS_CLIENT_TYPE,
                version: JS_WS_CLIENT_VERSION
              },
              user: {}
            };
            var initCallback = null;
            pomelo.init = function(params, cb) {
              initCallback = cb;
              var host = params.host;
              var port = params.port;
              var wsStr = "ws://";
              params.wsStr && (wsStr = params.wsStr);
              var url = wsStr + host;
              port && (url += ":" + port);
              handshakeBuffer.user = params.user;
              handshakeCallback = params.handshakeCallback;
              initWebSocket(url, cb);
            };
            var initWebSocket = function initWebSocket(url, cb) {
              console.log("connect to " + url);
              var onopen = function onopen(event) {
                var obj = Package.encode(Package.TYPE_HANDSHAKE, Protocol.strencode(JSON.stringify(handshakeBuffer)));
                send(obj);
              };
              var onmessage = function onmessage(event) {
                processPackage(Package.decode(event.data), cb);
                heartbeatTimeout && (nextHeartbeatTimeout = Date.now() + heartbeatTimeout);
              };
              var onerror = function onerror(event) {
                pomelo.emit("io-error", event);
                console.warn("socket error: ", JSON.stringify(event));
              };
              var onclose = function onclose(event) {
                pomelo.emit("close", event);
                console.warn("socket close: ", JSON.stringify(event));
              };
              socket = new WebSocket(url);
              socket.binaryType = "arraybuffer";
              socket.onopen = onopen;
              socket.onmessage = onmessage;
              socket.onerror = onerror;
              socket.onclose = onclose;
            };
            pomelo.disconnect = function() {
              if (socket) {
                socket.disconnect && socket.disconnect();
                socket.close && socket.close();
                console.log("disconnect");
                socket = null;
              }
              if (heartbeatId) {
                clearTimeout(heartbeatId);
                heartbeatId = null;
              }
              if (heartbeatTimeoutId) {
                clearTimeout(heartbeatTimeoutId);
                heartbeatTimeoutId = null;
              }
            };
            pomelo.request = function(route, msg, cb) {
              if (2 === arguments.length && "function" === typeof msg) {
                cb = msg;
                msg = {};
              } else msg = msg || {};
              route = route || msg.route;
              if (!route) return;
              reqId++;
              reqId % 128 == 0 && reqId++;
              sendMessage(reqId, route, msg);
              callbacks[reqId] = cb;
              routeMap[reqId] = route;
            };
            pomelo.notify = function(route, msg) {
              msg = msg || {};
              sendMessage(0, route, msg);
            };
            pomelo.clearCallback = function() {
              if (!socket) return;
              socket.onopen = null;
              socket.onmessage = null;
              socket.onerror = null;
              socket.onclose = null;
            };
            pomelo.isConnecting = function() {
              return socket && socket.readyState === WebSocket.CONNECTING;
            };
            pomelo.isOpen = function() {
              return socket && socket.readyState === WebSocket.OPEN;
            };
            pomelo.isClosed = function() {
              return socket && socket.readyState === WebSocket.CLOSED;
            };
            pomelo.isClosing = function() {
              return socket && socket.readyState === WebSocket.CLOSING;
            };
            var sendMessage = function sendMessage(reqId, route, msg) {
              var type = reqId ? Message.TYPE_REQUEST : Message.TYPE_NOTIFY;
              var protos = !pomelo.data.protos ? {} : pomelo.data.protos.client;
              msg = protos[route] ? protobuf.encode(route, msg) : Protocol.strencode(JSON.stringify(msg));
              var compressRoute = 0;
              if (pomelo.dict && pomelo.dict[route]) {
                route = pomelo.dict[route];
                compressRoute = 1;
              }
              msg = Message.encode(reqId, type, compressRoute, route, msg);
              var packet = Package.encode(Package.TYPE_DATA, msg);
              send(packet);
            };
            var send = function send(packet) {
              socket && socket.send(packet.buffer);
            };
            var handler = {};
            var heartbeat = function heartbeat(data) {
              if (!heartbeatInterval) return;
              pomelo.emit("heartbeat recv");
              var obj = Package.encode(Package.TYPE_HEARTBEAT);
              if (heartbeatTimeoutId) {
                clearTimeout(heartbeatTimeoutId);
                heartbeatTimeoutId = null;
              }
              if (heartbeatId) return;
              heartbeatId = setTimeout(function() {
                heartbeatId = null;
                send(obj);
                nextHeartbeatTimeout = Date.now() + heartbeatTimeout;
                heartbeatTimeoutId = setTimeout(heartbeatTimeoutCb, heartbeatTimeout);
              }, heartbeatInterval);
            };
            var heartbeatTimeoutCb = function heartbeatTimeoutCb() {
              var gap = nextHeartbeatTimeout - Date.now();
              if (gap > gapThreshold) heartbeatTimeoutId = setTimeout(heartbeatTimeoutCb, gap); else {
                console.warn("server heartbeat timeout");
                pomelo.emit("heartbeat timeout");
                pomelo.disconnect();
              }
            };
            var handshake = function handshake(data) {
              data = JSON.parse(Protocol.strdecode(data));
              if (data.code === RES_OLD_CLIENT) {
                pomelo.emit("error", "client version not fullfill");
                return;
              }
              if (data.code !== RES_OK) {
                pomelo.emit("error", "handshake fail");
                return;
              }
              handshakeInit(data);
              var obj = Package.encode(Package.TYPE_HANDSHAKE_ACK);
              send(obj);
              if (initCallback) {
                initCallback(socket);
                initCallback = null;
              }
            };
            var onData = function onData(data) {
              var msg = Message.decode(data);
              if (msg.id > 0) {
                msg.route = routeMap[msg.id];
                delete routeMap[msg.id];
                if (!msg.route) return;
              }
              msg.body = deCompose(msg);
              processMessage(pomelo, msg);
            };
            var onKick = function onKick(data) {
              var info = JSON.parse(Protocol.strdecode(data));
              var reason = "kick";
              info.hasOwnProperty("reason") && (reason = info["reason"]);
              pomelo.emit("onKick", reason);
            };
            handlers[Package.TYPE_HANDSHAKE] = handshake;
            handlers[Package.TYPE_HEARTBEAT] = heartbeat;
            handlers[Package.TYPE_DATA] = onData;
            handlers[Package.TYPE_KICK] = onKick;
            var processPackage = function processPackage(msg) {
              handlers[msg.type](msg.body);
            };
            var processMessage = function processMessage(pomelo, msg) {
              if (!msg.id) {
                pomelo.emit(msg.route, msg);
                return;
              }
              var cb = callbacks[msg.id];
              delete callbacks[msg.id];
              if ("function" !== typeof cb) return;
              cb(msg);
              return;
            };
            var processMessageBatch = function processMessageBatch(pomelo, msgs) {
              for (var i = 0, l = msgs.length; i < l; i++) processMessage(pomelo, msgs[i]);
            };
            var deCompose = function deCompose(msg) {
              var protos = !pomelo.data.protos ? {} : pomelo.data.protos.server;
              var abbrs = pomelo.data.abbrs;
              var route = msg.route;
              if (msg.compressRoute) {
                if (!abbrs[route]) return {};
                route = msg.route = abbrs[route];
              }
              return protos[route] ? protobuf.decode(route, msg.body) : JSON.parse(Protocol.strdecode(msg.body));
            };
            var handshakeInit = function handshakeInit(data) {
              if (data.sys && data.sys.heartbeat) {
                heartbeatInterval = 1e3 * data.sys.heartbeat;
                heartbeatTimeout = 2 * heartbeatInterval;
              } else {
                heartbeatInterval = 0;
                heartbeatTimeout = 0;
              }
              initData(data);
              "function" === typeof handshakeCallback && handshakeCallback(data.user);
            };
            var initData = function initData(data) {
              if (!data || !data.sys) return;
              pomelo.data = pomelo.data || {};
              var dict = data.sys.dict;
              var protos = data.sys.protos;
              if (dict) {
                pomelo.data.dict = dict;
                pomelo.data.abbrs = {};
                for (var route in dict) pomelo.data.abbrs[dict[route]] = route;
              }
              if (protos) {
                pomelo.data.protos = {
                  server: protos.server || {},
                  client: protos.client || {}
                };
                !protobuf || protobuf.init({
                  encoderProtos: protos.client,
                  decoderProtos: protos.server
                });
              }
            };
            module.exports = pomelo;
          })(this);
        });
        pomeloBuildObj.register("boot/index.js", function(exports, requirePomelo, module) {
          var Emitter = requirePomelo("emitter");
          this.EventEmitter = Object.create(Emitter);
          var protocol = requirePomelo("pomelo-protocol");
          this.Protocol = protocol;
          var protobuf = requirePomelo("pomelo-protobuf");
          this.protobuf = protobuf;
          var pomelo = requirePomelo("pomelo-jsclient-websocket");
          this.pomelo = pomelo;
        });
        pomeloBuildObj.alias("boot/index.js", "pomelo-client/deps/boot/index.js");
        pomeloBuildObj.alias("component-emitter/index.js", "boot/deps/emitter/index.js");
        pomeloBuildObj.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");
        pomeloBuildObj.alias("NetEase-pomelo-protocol/lib/protocol.js", "boot/deps/pomelo-protocol/lib/protocol.js");
        pomeloBuildObj.alias("NetEase-pomelo-protocol/lib/protocol.js", "boot/deps/pomelo-protocol/index.js");
        pomeloBuildObj.alias("NetEase-pomelo-protocol/lib/protocol.js", "NetEase-pomelo-protocol/index.js");
        pomeloBuildObj.alias("pomelonode-pomelo-protobuf/lib/client/protobuf.js", "boot/deps/pomelo-protobuf/lib/client/protobuf.js");
        pomeloBuildObj.alias("pomelonode-pomelo-protobuf/lib/client/protobuf.js", "boot/deps/pomelo-protobuf/index.js");
        pomeloBuildObj.alias("pomelonode-pomelo-protobuf/lib/client/protobuf.js", "pomelonode-pomelo-protobuf/index.js");
        pomeloBuildObj.alias("pomelonode-pomelo-jsclient-websocket/lib/pomelo-client.js", "boot/deps/pomelo-jsclient-websocket/lib/pomelo-client.js");
        pomeloBuildObj.alias("pomelonode-pomelo-jsclient-websocket/lib/pomelo-client.js", "boot/deps/pomelo-jsclient-websocket/index.js");
        pomeloBuildObj.alias("pomelonode-pomelo-jsclient-websocket/lib/pomelo-client.js", "pomelonode-pomelo-jsclient-websocket/index.js");
        pomeloBuildObj.requirePomelo("boot");
        return pomeloBuildObj;
      };
      window.pomeloBuild = pomeloBuild;
      cc._RF.pop();
    }).call(this, require("buffer").Buffer);
  }, {
    buffer: 2
  } ],
  rankUserInfo: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "d3f88VVzr9Fk587sigdmFVb", "rankUserInfo");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        rankCntLb: cc.Label,
        userNameLb: cc.Label,
        userIcon: cc.Sprite,
        userScoreLb: cc.Label
      },
      setData: function setData(rankIndex, data) {
        this.rankCntLb && (this.rankCntLb.string = rankIndex + 1);
        this.userNameLb.string = data.nick;
        cc.loader.load({
          url: data.url,
          type: "png"
        }, function(err, texture) {
          var spriteFrame = new cc.SpriteFrame(texture, cc.Rect(0, 0, texture.width, texture.height));
          this.userIcon && (this.userIcon.spriteFrame = spriteFrame);
        }.bind(this));
        this.userScoreLb.string = data.score;
      }
    });
    cc._RF.pop();
  }, {} ],
  resultPlayerIcon: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "38706mPQDBCcq8qjMuqQHVj", "resultPlayerIcon");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        icon: {
          default: null,
          type: cc.Sprite
        },
        nameLb: {
          default: null,
          type: cc.Label
        }
      },
      setData: function setData(id) {
        this.playerId = id;
        clientEvent.on(clientEvent.eventType.playerAccountGet, this.userInfoSet, this);
        Game.GameManager.userInfoReq(this.playerId);
      },
      userInfoSet: function userInfoSet(recvMsg) {
        if (recvMsg.account == this.playerId) {
          this.nameLb && (this.nameLb.string = recvMsg.userName);
          recvMsg.headIcon && "-" !== recvMsg.headIcon && cc.loader.load({
            url: recvMsg.headIcon,
            type: "png"
          }, function(err, texture) {
            var spriteFrame = new cc.SpriteFrame(texture, cc.Rect(0, 0, texture.width, texture.height));
            this.icon && (this.icon.spriteFrame = spriteFrame);
          }.bind(this));
        }
      },
      onDestroy: function onDestroy() {
        clientEvent.off(clientEvent.eventType.playerAccountGet, this.userInfoSet, this);
      }
    });
    cc._RF.pop();
  }, {} ],
  roomInfo: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "c337dIMd/tPPqIUQecSSWLa", "roomInfo");
    "use strict";
    var mvs = require("Matchvs");
    cc.Class({
      extends: cc.Component,
      properties: {
        roomIdLb: {
          default: null,
          type: cc.Label
        },
        roomNameLb: {
          default: null,
          type: cc.Label
        }
      },
      start: function start() {
        this.node.on("click", this.joinRoom, this);
      },
      setData: function setData(msRoomAttribute) {
        this.msRoomAttribute = msRoomAttribute;
        this.roomIdLb.string = msRoomAttribute.roomID;
        this.roomNameLb.string = msRoomAttribute.roomName;
      },
      joinRoom: function joinRoom() {
        mvs.engine.joinRoom(this.msRoomAttribute.roomID, "joinRoomSpecial");
      }
    });
    cc._RF.pop();
  }, {
    Matchvs: "Matchvs"
  } ],
  roomUserInfo: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "03ed8JZPJFK1I6th5/637fn", "roomUserInfo");
    "use strict";
    var mvs = require("Matchvs");
    cc.Class({
      extends: cc.Component,
      properties: {
        userName: {
          default: null,
          type: cc.Label
        },
        ownerTag: {
          default: null,
          type: cc.Node
        },
        otherTag: {
          default: null,
          type: cc.Node
        },
        selfTag: {
          default: null,
          type: cc.Node
        },
        defaultNode: {
          default: null,
          type: cc.Node
        },
        commonNode: {
          default: null,
          type: cc.Node
        },
        kick: {
          default: null,
          type: cc.Node
        },
        userIcon: {
          default: null,
          type: cc.Sprite
        }
      },
      init: function init() {
        this.defaultNode.active = true;
        this.otherTag.active = false;
        this.ownerTag.active = false;
        this.selfTag.active = false;
        this.userName.string = "";
        this.commonNode.active = false;
        this.kick.active = false;
        this.kick.on("click", this.kickPlayer, this);
        this.userId = 0;
        clientEvent.on(clientEvent.eventType.playerAccountGet, this.userInfoSet, this);
      },
      setData: function setData(userId, ownerId) {
        this.userId = userId;
        if (this.userId === ownerId) {
          this.ownerTag.active = true;
          this.otherTag.active = false;
          this.selfTag.active = false;
        } else if (this.userId === GLB.userInfo.id) {
          this.ownerTag.active = false;
          this.otherTag.active = false;
          this.selfTag.active = true;
        } else {
          this.ownerTag.active = false;
          this.otherTag.active = true;
          this.selfTag.active = false;
        }
        this.defaultNode.active = false;
        this.commonNode.active = true;
        this.userName.string = this.userId;
        GLB.isRoomOwner && this.userId !== GLB.userInfo.id ? this.kick.active = true : this.kick.active = false;
        Game.GameManager.userInfoReq(this.userId);
      },
      userInfoSet: function userInfoSet(recvMsg) {
        console.log("recvMsg:" + recvMsg);
        if (recvMsg.account == this.userId) {
          console.log("set user info");
          console.log(recvMsg);
          this.userName.string = recvMsg.userName;
          recvMsg.headIcon && "-" !== recvMsg.headIcon && cc.loader.load({
            url: recvMsg.headIcon,
            type: "png"
          }, function(err, texture) {
            var spriteFrame = new cc.SpriteFrame(texture, cc.Rect(0, 0, texture.width, texture.height));
            this.userIcon && (this.userIcon.spriteFrame = spriteFrame);
          }.bind(this));
        }
      },
      onDestroy: function onDestroy() {
        clientEvent.off(clientEvent.eventType.playerAccountGet, this.userInfoSet, this);
      },
      kickPlayer: function kickPlayer() {
        mvs.engine.kickPlayer(this.userId, "kick");
      }
    });
    cc._RF.pop();
  }, {
    Matchvs: "Matchvs"
  } ],
  uiBeginnerCourse: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "cf7a5WlJ7JBhYScI/V6zp6g", "uiBeginnerCourse");
    "use strict";
    var uiPanel = require("uiPanel");
    cc.Class({
      extends: uiPanel,
      properties: {
        pageView: {
          default: null,
          type: cc.Node
        }
      },
      onLoad: function onLoad() {
        this._super();
        this.nodeDict["close"].on(cc.Node.EventType.TOUCH_END, this.close, this);
        this.nodeDict["left"].on(cc.Node.EventType.TOUCH_END, this.leftScroll, this);
        this.nodeDict["right"].on(cc.Node.EventType.TOUCH_END, this.rightScroll, this);
      },
      leftScroll: function leftScroll() {
        var index = this.pageView.getComponent(cc.PageView).getCurrentPageIndex();
        this.pageView.getComponent(cc.PageView).setCurrentPageIndex(index - 1);
      },
      rightScroll: function rightScroll() {
        var index = this.pageView.getComponent(cc.PageView).getCurrentPageIndex();
        this.pageView.getComponent(cc.PageView).setCurrentPageIndex(index + 1);
      },
      close: function close() {
        var lobbyPanel = uiFunc.findUI("uiLobbyPanelVer");
        lobbyPanel && lobbyPanel.getComponent("uiLobbyPanel").openBotton();
        uiFunc.closeUI(this.node.name);
        this.node.destroy();
      },
      update: function update() {
        var index = this.pageView.getComponent(cc.PageView).getCurrentPageIndex();
        this.nodeDict["left"].getComponent(cc.Button).interactable = true;
        this.nodeDict["right"].getComponent(cc.Button).interactable = true;
        0 === index ? this.nodeDict["left"].getComponent(cc.Button).interactable = false : 2 === index && (this.nodeDict["right"].getComponent(cc.Button).interactable = false);
      }
    });
    cc._RF.pop();
  }, {
    uiPanel: "uiPanel"
  } ],
  uiCreateRoom: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "e15a0SellRL6YcLfubCYSrA", "uiCreateRoom");
    "use strict";
    var uiPanel = require("uiPanel");
    var mvs = require("Matchvs");
    cc.Class({
      extends: uiPanel,
      properties: {},
      onLoad: function onLoad() {
        this._super();
        this.playerCntLb = this.nodeDict["playerCnt"].getComponent(cc.Label);
        this.playerCnt = GLB.PLAYER_COUNTS[0];
        this.playerCntLb.string = this.playerCnt;
        this.refreshBtnState();
        this.nodeDict["quit"].on("click", this.quit, this);
        this.nodeDict["addNode"].on("click", this.addPlayerCount, this);
        this.nodeDict["subNode"].on("click", this.subPlayerCount, this);
        this.nodeDict["create"].on("click", this.createRoom, this);
        clientEvent.on(clientEvent.eventType.createRoomResponse, this.createRoomResponse, this);
      },
      addPlayerCount: function addPlayerCount() {
        for (var i = 0; i < GLB.PLAYER_COUNTS.length; i++) if (this.playerCnt === GLB.PLAYER_COUNTS[i] && GLB.PLAYER_COUNTS.length > i + 1) {
          this.playerCnt = GLB.PLAYER_COUNTS[i + 1];
          break;
        }
        this.playerCntLb.string = this.playerCnt;
        this.refreshBtnState();
      },
      subPlayerCount: function subPlayerCount() {
        for (var i = 0; i < GLB.PLAYER_COUNTS.length; i++) if (this.playerCnt === GLB.PLAYER_COUNTS[i] && i > 0) {
          this.playerCnt = GLB.PLAYER_COUNTS[i - 1];
          break;
        }
        this.playerCntLb.string = this.playerCnt;
        this.refreshBtnState();
      },
      refreshBtnState: function refreshBtnState() {
        this.playerCnt === GLB.PLAYER_COUNTS[0] ? this.nodeDict["subNode"].getComponent(cc.Button).interactable = false : this.nodeDict["subNode"].getComponent(cc.Button).interactable = true;
        this.playerCnt === GLB.PLAYER_COUNTS[GLB.PLAYER_COUNTS.length - 1] ? this.nodeDict["addNode"].getComponent(cc.Button).interactable = false : this.nodeDict["addNode"].getComponent(cc.Button).interactable = true;
      },
      quit: function quit() {
        uiFunc.closeUI(this.node.name);
        this.node.destroy();
      },
      createRoom: function createRoom() {
        Game.GameManager.blockInput();
        var create = new mvs.CreateRoomInfo();
        create.roomName = this.nodeDict["roomName"].getComponent(cc.EditBox).string;
        GLB.MAX_PLAYER_COUNT = this.playerCnt;
        create.maxPlayer = GLB.MAX_PLAYER_COUNT;
        create.mode = 0;
        create.canWatch = 0;
        create.visibility = 1;
        create.roomProperty = GLB.MAX_PLAYER_COUNT;
        var result = mvs.engine.createRoom(create, {
          maxPlayer: GLB.MAX_PLAYER_COUNT
        });
        0 !== result && console.log("\u521b\u5efa\u623f\u95f4\u5931\u8d25,\u9519\u8bef\u7801:" + result);
      },
      createRoomResponse: function createRoomResponse(data) {
        var status = data.rsp.status;
        if (200 !== status) console.log("\u521b\u5efa\u623f\u95f4\u5931\u8d25,\u5f02\u6b65\u56de\u8c03\u9519\u8bef\u7801: " + status); else {
          console.log("\u521b\u5efa\u623f\u95f4\u6210\u529f:" + JSON.stringify(data.rsp));
          console.log("\u623f\u95f4\u53f7: " + data.rsp.roomID);
          GLB.roomId = data.rsp.roomID;
          cc.Canvas.instance.designResolution.height > cc.Canvas.instance.designResolution.width ? uiFunc.openUI("uiRoomVer", function(obj) {
            var room = obj.getComponent("uiRoom");
            room.createRoomInit(data.rsp);
            uiFunc.closeUI(this.node.name);
            this.node.destroy();
          }.bind(this)) : uiFunc.openUI("uiRoom", function(obj) {
            var room = obj.getComponent("uiRoom");
            room.createRoomInit(data.rsp);
            uiFunc.closeUI(this.node.name);
            this.node.destroy();
          }.bind(this));
        }
      },
      onDestroy: function onDestroy() {
        clientEvent.off(clientEvent.eventType.createRoomResponse, this.createRoomResponse, this);
      }
    });
    cc._RF.pop();
  }, {
    Matchvs: "Matchvs",
    uiPanel: "uiPanel"
  } ],
  uiExit: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "a7381zzskBJ4bDJQ9ArBMyG", "uiExit");
    "use strict";
    var uiPanel = require("uiPanel");
    var mvs = require("Matchvs");
    cc.Class({
      extends: uiPanel,
      properties: {},
      onLoad: function onLoad() {
        this._super();
        this.nodeDict["sure"].on("click", this.sure, this);
        this.nodeDict["close"].on("click", this.close, this);
        !Game.GameManager.bExit;
      },
      close: function close() {
        uiFunc.closeUI(this.node.name);
        this.node.destroy();
      },
      sure: function sure() {
        if (!Game.GameManager.bExit) return;
        mvs.engine.leaveRoom("");
        Game.BlockManager.deleteWholeBlock();
        var gamePanel = uiFunc.findUI("uiGamePanel");
        if (gamePanel) {
          uiFunc.closeUI("uiGamePanel");
          gamePanel.destroy();
        }
        uiFunc.closeUI(this.node.name);
        this.node.destroy();
        Game.GameManager.lobbyShow();
      }
    });
    cc._RF.pop();
  }, {
    Matchvs: "Matchvs",
    uiPanel: "uiPanel"
  } ],
  uiGamePanel: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "c90ffERpYtEm4iOtta637HR", "uiGamePanel");
    "use strict";
    var _cc$Class;
    function _defineProperty(obj, key, value) {
      key in obj ? Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      }) : obj[key] = value;
      return obj;
    }
    var mvs = require("Matchvs");
    var uiPanel = require("uiPanel");
    cc.Class((_cc$Class = {
      extends: uiPanel,
      properties: {
        bgmAudio: {
          default: null,
          url: cc.AudioClip
        },
        startAudio: {
          default: null,
          url: cc.AudioClip
        },
        selfScore: {
          default: null,
          type: cc.Label
        },
        rivalScore: {
          default: null,
          type: cc.Label
        },
        progressBar: {
          default: null,
          type: cc.Node
        },
        numberSpriteFrame: {
          default: [],
          type: cc.SpriteFrame
        }
      },
      onLoad: function onLoad() {
        this._super();
        this.round = 0;
        this.count = 0;
        this.playerLcon = this.nodeDict["player"].getComponent("resultPlayerIcon");
        this.rivalLcon = this.nodeDict["rival"].getComponent("resultPlayerIcon");
        this.node.on(clientEvent.eventType.nextRound, this.initArrBlock, this);
        this.node.on(clientEvent.eventType.setScoreProgressBar, this.setScoreProgressBar, this);
        clientEvent.on(clientEvent.eventType.roundStart, this.roundStart, this);
        clientEvent.on(clientEvent.eventType.updateMap, this.sendInitMapMsg, this);
        clientEvent.on(clientEvent.eventType.gameOver, this.gameOver, this);
        clientEvent.on(clientEvent.eventType.getRoomDetailResponse, this.setPlayerId, this);
        clientEvent.on(clientEvent.eventType.leaveRoomMedNotify, this.leaveRoom, this);
        clientEvent.on(clientEvent.eventType.getReconnectionData, this.getReconnectionData, this);
        clientEvent.on(clientEvent.eventType.setReconnectionData, this.setReconnectionData, this);
        clientEvent.on(clientEvent.eventType.setCount, this.setCount, this);
        clientEvent.on(clientEvent.eventType.checkLcon, this.checkLcon, this);
        this.nodeDict["exit"].on(cc.Node.EventType.TOUCH_START, this.exit, this);
        this.nodeDict["round"].getComponent(cc.Animation).on("finished", this.gameStart, this);
        this.scheduleOnce(this.checkGameStatus, 10);
        window.BK && !BK.Audio.switch && (BK.Audio.switch = true);
        this.bgmId = cc.audioEngine.play(this.bgmAudio, true, 1);
      },
      sendExpressionMsg: function sendExpressionMsg(event, customEventData) {
        Game.GameManager.gameState !== GameState.Over && mvs.engine.sendFrameEvent(JSON.stringify({
          action: GLB.BUBBLE,
          type: customEventData,
          id: Game.PlayerManager.self.playerId
        }));
      },
      showLcon: function showLcon() {
        this.playerLcon.setData(GLB.playerUserIds[0]);
        this.rivalLcon.setData(GLB.playerUserIds[1]);
      },
      checkLcon: function checkLcon() {
        if (null === this.playerLcon.icon.spriteFrame) {
          Game.GameManager.network.connect(GLB.IP, GLB.PORT, function() {});
          this.scheduleOnce(this.showLcon, 1);
        }
      },
      setPlayerId: function setPlayerId(data) {
        var arrPlayer = data.rsp.userInfos;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = void 0;
        try {
          for (var _iterator = arrPlayer[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var player = _step.value;
            player.userId === GLB.userInfo.id ? GLB.playerUserIds[0] = player.userId : GLB.playerUserIds[1] = player.userId;
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            !_iteratorNormalCompletion && _iterator.return && _iterator.return();
          } finally {
            if (_didIteratorError) throw _iteratorError;
          }
        }
        Game.PlayerManager.playerInit();
      },
      initArrBlock: function initArrBlock() {
        if (!this.playPrompt()) {
          this.gameOver();
          return;
        }
        if (!GLB.isRoomOwner) return;
        var arrMap = [];
        for (var row = 0; row < 8; row++) {
          arrMap[row] = [];
          for (var col = 0; col < 9; col++) arrMap[row][col] = 0;
        }
        var length = window.dataManager.layoutDtMgr.getArrLayoutLenght();
        var removeId = Math.floor(Math.random() * length + 1);
        var arrRemove = window.dataManager.layoutDtMgr.getDataByID(removeId).array;
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = void 0;
        try {
          for (var _iterator2 = arrRemove[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var data = _step2.value;
            arrMap[data[0]][data[1]] = null;
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            !_iteratorNormalCompletion2 && _iterator2.return && _iterator2.return();
          } finally {
            if (_didIteratorError2) throw _iteratorError2;
          }
        }
        var number = 72 - arrRemove.length;
        var arrBlock = [];
        for (var i = 0; i < number / 2; i++) {
          var blockType = Math.floor(10 * Math.random());
          arrBlock.push(blockType);
          arrBlock.push(blockType);
        }
        for (var _row = 0; _row < 8; _row++) for (var _col = 0; _col < 9; _col++) if (null !== arrMap[_row][_col]) {
          var index = Math.floor(Math.random() * arrBlock.length);
          arrMap[_row][_col] = arrBlock[index];
          arrBlock.splice(index, 1);
        }
        this.sendInitMapMsg(arrMap);
      },
      checkGameStatus: function checkGameStatus() {
        Game.GameManager.openTip("\u6e38\u620f\u65e0\u6cd5\u8fdb\u884c");
        this.scheduleOnce(function() {
          Game.GameManager.recurLobby();
        }, 2.5);
      },
      leaveRoom: function leaveRoom(data) {
        Game.GameManager.gameState !== GameState.Over && uiFunc.openUI("uiTip", function(obj) {
          var uiTip = obj.getComponent("uiTip");
          uiTip && data.leaveRoomInfo.userId !== GLB.userInfo.id && uiTip.setData("\u5bf9\u624b\u91cd\u65b0\u8fde\u63a5\u5931\u8d25\uff0c\u5373\u5c06\u7ed3\u675f\u6e38\u620f");
        }.bind(this));
      },
      sendInitMapMsg: function sendInitMapMsg(arrMap) {
        Game.GameManager.gameState !== GameState.Over && mvs.engine.sendFrameEvent(JSON.stringify({
          action: GLB.INITMAP,
          array: arrMap
        }));
      },
      exit: function exit() {
        if (!Game.ClickManager.bClick) return;
        uiFunc.openUI("uiExit");
      },
      gameOver: function gameOver() {
        if (GLB.isRoomOwner) {
          var msg = {
            action: GLB.GAME_OVER_EVENT
          };
          Game.GameManager.sendEventEx(msg);
        }
        cc.audioEngine.stop(this.bgmId);
      },
      roundStart: function roundStart() {
        this.initArrBlock();
        this.showLcon();
      }
    }, _defineProperty(_cc$Class, "leaveRoom", function leaveRoom() {
      Game.GameManager.bExit = false;
      this.scheduleOnce(function() {
        Game.GameManager.bExit = true;
      }, 3);
      Game.GameManager.gameState !== GameState.Over && uiFunc.openUI("uiTip", function(obj) {
        var uiTip = obj.getComponent("uiTip");
        if (uiTip) {
          uiTip.setData("\u5bf9\u624b\u79bb\u5f00\u4e86\u6e38\u620f");
          cc.log("\u5bf9\u624b\u79bb\u5f00\u4e86\u6e38\u620f");
        }
      }.bind(this));
    }), _defineProperty(_cc$Class, "setScoreProgressBar", function setScoreProgressBar() {
      var ratio = Game.PlayerManager.self.score / (Game.PlayerManager.self.score + Game.PlayerManager.rival.score);
      0 === Game.PlayerManager.self.score && 0 === Game.PlayerManager.rival.score && (ratio = .5);
      this.progressBar.getComponent(cc.ProgressBar).progress = ratio;
      this.progressBar.getChildByName("light").x = 500 * ratio - 250;
    }), _defineProperty(_cc$Class, "playPrompt", function playPrompt() {
      var _this = this;
      this.round++;
      this.nodeDict["prompt"].active = true;
      Game.ClickManager.bClick = false;
      if (this.round >= 4) {
        clearInterval(this.scheduleCountDown);
        this.nodeDict["gameOver"].opacity = 255;
        return false;
      }
      this.count = 60;
      clearInterval(this.scheduleCountDown);
      this.nodeDict["countDown"].getComponent(cc.Label).string = "\u5269\u4f59\u65f6\u95f4 " + this.count;
      this.nodeDict["tab"].getComponent(cc.Label).string = "Round " + this.round + "/3";
      this.nodeDict["number"].getComponent(cc.Sprite).spriteFrame = this.numberSpriteFrame[this.round - 1];
      this.nodeDict["round"].getComponent(cc.Animation).play("round1");
      if (window.BK && !BK.Audio.switch) {
        BK.Audio.switch = true;
        this.bgmId = cc.audioEngine.play(this.bgmAudio, true, 1);
      }
      this.scheduleOnce(function() {
        cc.audioEngine.play(_this.startAudio, false, 1);
      }, 2.5);
      return true;
    }), _defineProperty(_cc$Class, "gameStart", function gameStart() {
      clearInterval(this.scheduleCountDown);
      this.unschedule(this.checkGameStatus);
      Game.ClickManager.bClick = true;
      this.nodeDict["prompt"].active = false;
      this.scheduleCountDown = setInterval(function() {
        this.countDown();
      }.bind(this), 1e3);
    }), _defineProperty(_cc$Class, "countDown", function countDown() {
      this.count > 0 && this.count--;
      this.nodeDict["countDown"].getComponent(cc.Label).string = "\u5269\u4f59\u65f6\u95f4 " + this.count;
      this.count <= 0 && this.sendNextRound();
    }), _defineProperty(_cc$Class, "setCount", function setCount(count) {
      this.count = count;
    }), _defineProperty(_cc$Class, "sendNextRound", function sendNextRound() {
      clearInterval(this.scheduleCountDown);
      Game.GameManager.gameState !== GameState.Over && GLB.isRoomOwner && mvs.engine.sendFrameEvent(JSON.stringify({
        action: GLB.TIME_OUT
      }));
    }), _defineProperty(_cc$Class, "getReconnectionData", function getReconnectionData() {
      cc.log("\u53d1\u9001\u91cd\u65b0\u8fde\u63a5\u6570\u636e");
      var arrMap = Game.BlockManager.getArrMap();
      this.sendInitMapMsg(arrMap);
      var selfData = Game.PlayerManager.self.getData();
      var rivalData = Game.PlayerManager.rival.getData();
      var gameData = {
        round: this.round,
        count: this.count,
        selfData: selfData,
        rivalData: rivalData,
        gamestate: Game.GameManager.gameState
      };
      Game.GameManager.gameState !== GameState.Over && mvs.engine.sendFrameEvent(JSON.stringify({
        action: GLB.RECONNECTION_DATA,
        playerId: Game.PlayerManager.self.playerId,
        gameData: gameData
      }));
    }), _defineProperty(_cc$Class, "setReconnectionData", function setReconnectionData(cpProto) {
      cc.log("\u6389\u7ebf\u73a9\u5bb6\u63a5\u53d7\u5e76\u66f4\u65b0\u6570\u636e");
      var data = cpProto.gameData;
      var id = cpProto.playerId;
      if (data.round <= 0 || data.gamestate !== GameState.Play) return;
      Game.GameManager.bReconnect = true;
      this.round = data.round;
      this.count = data.count;
      if (id === GLB.userInfo.id) {
        GLB.isRoomOwner = true;
        Game.PlayerManager.self.setData(data.selfData);
        Game.PlayerManager.rival.setData(data.rivalData);
      } else {
        GLB.isRoomOwner = false;
        Game.PlayerManager.self.setData(data.rivalData);
        Game.PlayerManager.rival.setData(data.selfData);
      }
      Game.PlayerManager.self.changeScore();
      Game.PlayerManager.rival.changeScore();
      this.nodeDict && (this.nodeDict["tab"].getComponent(cc.Label).string = "Round " + this.round + "/3");
      Game.GameManager.gameState = GameState.Play;
      this.showLcon();
      this.gameStart();
    }), _defineProperty(_cc$Class, "onDestroy", function onDestroy() {
      clientEvent.off(clientEvent.eventType.roundStart, this.roundStart, this);
      clientEvent.off(clientEvent.eventType.gameOver, this.gameOver, this);
      clientEvent.off(clientEvent.eventType.refreshSlateBtn, this.refreshSlateBtn, this);
      clientEvent.off(clientEvent.eventType.leaveRoomMedNotify, this.leaveRoom, this);
      clientEvent.off(clientEvent.eventType.getRoomDetailResponse, this.setPlayerId, this);
      clientEvent.off(clientEvent.eventType.getReconnectionData, this.getReconnectionData, this);
      clientEvent.off(clientEvent.eventType.setCount, this.setCount, this);
      clientEvent.off(clientEvent.eventType.checkLcon, this.checkLcon, this);
      this.node.off(clientEvent.eventType.nextRound, this.initArrBlock, this);
      this.node.off(clientEvent.eventType.setScoreProgressBar, this.setScoreProgressBar, this);
      this.nodeDict["exit"].off(cc.Node.EventType.TOUCH_START, this.exit, this);
      clearInterval(this.scheduleCountDown);
      cc.audioEngine.stop(this.bgmId);
      window.BK && (BK.Audio.switch = false);
    }), _cc$Class));
    cc._RF.pop();
  }, {
    Matchvs: "Matchvs",
    uiPanel: "uiPanel"
  } ],
  uiLobbyPanel: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "a5e20CGbKhAx5GXgmsgxPm/", "uiLobbyPanel");
    "use strict";
    var uiPanel = require("uiPanel");
    var mvs = require("Matchvs");
    cc.Class({
      extends: uiPanel,
      properties: {},
      start: function start() {
        this.nodeDict["guide"].on("click", this.beginnerCourse, this);
        this.nodeDict["randomRoom"].on("click", this.randomRoom, this);
        this.nodeDict["createRoom"].on("click", this.createRoom, this);
        this.nodeDict["joinRoom"].on("click", this.joinRoom, this);
        this.nodeDict["inviteFriend"].on("click", this.inviteFriend, this);
        this.nodeDict["exit"].on("click", this.exit, this);
        GLB.nickName ? this.nodeDict["name"].getComponent(cc.Label).string = GLB.nickName : this.nodeDict["name"].getComponent(cc.Label).string = GLB.userInfo.id;
        GLB.avatarUrl && cc.loader.load({
          url: GLB.avatarUrl,
          type: "png"
        }, function(err, texture) {
          var spriteFrame = new cc.SpriteFrame(texture, cc.Rect(0, 0, texture.width, texture.height));
          this.node && (this.nodeDict["userIcon"].getComponent(cc.Sprite).spriteFrame = spriteFrame);
        }.bind(this));
        this.nodeDict["rank"].on("click", this.rank, this);
      },
      rank: function rank() {
        Game.GameManager.blockInput();
        Game.GameManager.getRankData(function(data) {
          uiFunc.openUI("uiRankPanelVer", function(obj) {
            var uiRankPanelScript = obj.getComponent("uiRankPanel");
            uiRankPanelScript && uiRankPanelScript.setData(data);
          });
        });
      },
      exit: function exit() {
        mvs.engine.logout("");
        uiFunc.closeUI(this.node.name);
        this.node.destroy();
      },
      onEnable: function onEnable() {
        GLB.isRoomOwner = false;
        GLB.MAX_PLAYER_COUNT = 2;
      },
      randomRoom: function randomRoom() {
        Game.GameManager.blockInput();
        GLB.matchType = GLB.RANDOM_MATCH;
        console.log("\u5f00\u59cb\u968f\u673a\u5339\u914d");
        GLB.gameType === GLB.COOPERATION ? GLB.MAX_PLAYER_COUNT > 1 ? cc.Canvas.instance.designResolution.height > cc.Canvas.instance.designResolution.width ? uiFunc.openUI("uiMatchingVer", function(obj) {
          var matching = obj.getComponent("uiMatching");
          matching.joinRandomRoom();
        }) : uiFunc.openUI("uiMatching", function(obj) {
          var matching = obj.getComponent("uiMatching");
          matching.joinRandomRoom();
        }) : cc.director.loadScene("game") : GLB.gameType === GLB.COMPETITION && (2 === GLB.MAX_PLAYER_COUNT ? cc.Canvas.instance.designResolution.height > cc.Canvas.instance.designResolution.width ? uiFunc.openUI("uiMatching1v1Ver", function(obj) {
          var matching = obj.getComponent("uiMatching1v1Ver");
          matching.joinRandomRoom();
        }) : uiFunc.openUI("uiMatching1v1", function(obj) {
          var matching = obj.getComponent("uiMatching1v1");
          matching.joinRandomRoom();
        }) : 4 === GLB.MAX_PLAYER_COUNT && (cc.Canvas.instance.designResolution.height > cc.Canvas.instance.designResolution.width, 
        uiFunc.openUI("uiMatching2v2Ver", function(obj) {
          var matching = obj.getComponent("uiMatching2v2Ver");
          matching.joinRandomRoom();
        })));
      },
      createRoom: function createRoom() {
        Game.GameManager.blockInput();
        cc.Canvas.instance.designResolution.height > cc.Canvas.instance.designResolution.width ? uiFunc.openUI("uiCreateRoomVer") : uiFunc.openUI("uiCreateRoom");
      },
      joinRoom: function joinRoom() {
        Game.GameManager.blockInput();
        cc.Canvas.instance.designResolution.height > cc.Canvas.instance.designResolution.width ? uiFunc.openUI("uiRoomListVer") : uiFunc.openUI("uiRoomList");
      },
      inviteFriend: function inviteFriend() {
        window.BK && BK.QQ.shareToArk(0, "\u840c\u9e1f\u8fde\u8fde\u770b", "https://data.tianziyou.com/matchvsGamesRes/logo/linkGameLogo.png", true);
      },
      beginnerCourse: function beginnerCourse() {
        uiFunc.openUI("uiBeginnerCourse");
        this.nodeDict["guide"].getComponent(cc.Button).interactable = false;
      },
      openBotton: function openBotton() {
        this.nodeDict["guide"].getComponent(cc.Button).interactable = true;
      }
    });
    cc._RF.pop();
  }, {
    Matchvs: "Matchvs",
    uiPanel: "uiPanel"
  } ],
  uiLogin: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "fb82d5Sr/1JnZbeK/r8ui/t", "uiLogin");
    "use strict";
    var uiPanel = require("uiPanel");
    cc.Class({
      extends: uiPanel,
      properties: {},
      onLoad: function onLoad() {
        this._super();
        this.nodeDict["start"].on("click", this.startGame, this);
      },
      startGame: function startGame() {
        Game.GameManager.matchVsInit();
      }
    });
    cc._RF.pop();
  }, {
    uiPanel: "uiPanel"
  } ],
  uiMaskLayout: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "70976uUsa1KB6aRPbNdogmb", "uiMaskLayout");
    "use strict";
    var uiPanel = require("uiPanel");
    cc.Class({
      extends: uiPanel,
      start: function start() {
        clientEvent.on(clientEvent.eventType.openUI, this.uiOperateCallBack, this);
        clientEvent.on(clientEvent.eventType.closeUI, this.uiOperateCallBack, this);
        this.isUseMask = false;
        this.node.active = false;
      },
      uiOperateCallBack: function uiOperateCallBack() {
        var lastMaskIndex = -1;
        for (var i = uiFunc.uiList.length - 1; i >= 0; i--) {
          var ui = uiFunc.uiList[i];
          var panel = ui.getComponent("uiPanel");
          if (panel && panel.isUseMask) {
            lastMaskIndex = i;
            break;
          }
        }
        if (!(lastMaskIndex >= 0)) {
          this.node.active = false;
          return;
        }
        this.node.active = true;
        for (var j = lastMaskIndex; j < uiFunc.uiList.length; j++) {
          var targetUI = uiFunc.uiList[j];
          if (targetUI) {
            this.node.setSiblingIndex(Number.MAX_SAFE_INTEGER);
            targetUI.setSiblingIndex(Number.MAX_SAFE_INTEGER);
          } else console.log("current show ui is null!");
        }
      },
      refresh: function refresh() {
        var lastMaskIndex = -1;
        for (var i = uiFunc.uiList.length - 1; i >= 0; i--) {
          var ui = uiFunc.uiList[i];
          var panel = ui.getComponent("uiPanel");
          if (panel.isUseMask) {
            lastMaskIndex = i;
            break;
          }
        }
        if (!(lastMaskIndex >= 0)) {
          this.node.active = false;
          return;
        }
        this.node.active = true;
        for (var j = lastMaskIndex; j < uiFunc.uiList.length; j++) {
          var targetUI = uiFunc.uiList[j];
          if (targetUI) {
            this.node.setSiblingIndex(Number.MAX_SAFE_INTEGER);
            targetUI.setSiblingIndex(Number.MAX_SAFE_INTEGER);
          } else console.log("current show ui is null!");
        }
      },
      onDestroy: function onDestroy() {
        clientEvent.off(clientEvent.eventType.openUI, this.uiOperateCallBack, this);
        clientEvent.off(clientEvent.eventType.closeUI, this.uiOperateCallBack, this);
      }
    });
    cc._RF.pop();
  }, {
    uiPanel: "uiPanel"
  } ],
  uiMatching1v1Ver: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "705085fc89PIavCo9Cf1kbp", "uiMatching1v1Ver");
    "use strict";
    var uiPanel = require("uiPanel");
    var mvs = require("Matchvs");
    cc.Class({
      extends: uiPanel,
      properties: {
        playerIcons: [ cc.Node ]
      },
      onLoad: function onLoad() {
        this._super();
        this.nodeDict["quit"].on("click", this.leaveRoom, this);
        this.bQuit = true;
        this.joinRoom = false;
        clientEvent.on(clientEvent.eventType.joinRoomResponse, this.joinRoomResponse, this);
        clientEvent.on(clientEvent.eventType.joinRoomNotify, this.joinRoomNotify, this);
        clientEvent.on(clientEvent.eventType.leaveRoomResponse, this.leaveRoomResponse, this);
        clientEvent.on(clientEvent.eventType.leaveRoomNotify, this.leaveRoomNotify, this);
        clientEvent.on(clientEvent.eventType.joinOverResponse, this.joinOverResponse, this);
        clientEvent.on(clientEvent.eventType.checkLcon, this.checkLcon, this);
      },
      joinRandomRoom: function joinRandomRoom() {
        var result = null;
        if (GLB.matchType === GLB.RANDOM_MATCH) {
          result = mvs.engine.joinRandomRoom(GLB.MAX_PLAYER_COUNT, "");
          if (0 !== result) {
            console.log("\u8fdb\u5165\u623f\u95f4\u5931\u8d25,\u9519\u8bef\u7801:" + result);
            Game.GameManager.openTip("\u8fdb\u5165\u623f\u95f4\u5931\u8d25");
            Game.GameManager.recurLobby();
          }
        } else if (GLB.matchType === GLB.PROPERTY_MATCH) {
          var matchinfo = new mvs.MatchInfo();
          matchinfo.maxPlayer = GLB.MAX_PLAYER_COUNT;
          matchinfo.mode = 0;
          matchinfo.canWatch = 0;
          matchinfo.tags = GLB.tagsInfo;
          result = mvs.engine.joinRoomWithProperties(matchinfo, "joinRoomWithProperties");
          0 !== result && console.log("\u8fdb\u5165\u623f\u95f4\u5931\u8d25,\u9519\u8bef\u7801:" + result);
        }
      },
      startGame: function startGame() {
        console.log("\u6e38\u620f\u5373\u5c06\u5f00\u59cb");
        cc.director.loadScene("game");
      },
      joinRoomResponse: function joinRoomResponse(data) {
        if (200 !== data.status) console.log("\u8fdb\u5165\u623f\u95f4\u5931\u8d25,\u5f02\u6b65\u56de\u8c03\u9519\u8bef\u7801: " + data.status); else {
          console.log("\u8fdb\u5165\u623f\u95f4\u6210\u529f");
          console.log("\u623f\u95f4\u53f7: " + data.roomInfo.roomID);
        }
        GLB.roomId = data.roomInfo.roomID;
        var userIds = [ GLB.userInfo.id ];
        console.log("\u623f\u95f4\u7528\u6237: " + userIds);
        var playerIcon = null;
        for (var j = 0; j < data.roomUserInfoList.length; j++) {
          playerIcon = this.playerIcons[j + 1].getComponent("playerIcon");
          if (playerIcon && !playerIcon.userInfo) {
            playerIcon.setData(data.roomUserInfoList[j]);
            GLB.userInfo.id !== data.roomUserInfoList[j].userId && userIds.push(data.roomUserInfoList[j].userId);
          }
        }
        for (var i = 0; i < this.playerIcons.length; i++) {
          playerIcon = this.playerIcons[i].getComponent("playerIcon");
          if (playerIcon && !playerIcon.userInfo) {
            playerIcon.setData(GLB.userInfo);
            break;
          }
        }
        GLB.playerUserIds = userIds;
        if (userIds.length >= GLB.MAX_PLAYER_COUNT) {
          var result = mvs.engine.joinOver("");
          console.log("\u53d1\u51fa\u5173\u95ed\u623f\u95f4\u7684\u901a\u77e5");
          0 !== result && console.log("\u5173\u95ed\u623f\u95f4\u5931\u8d25\uff0c\u9519\u8bef\u7801\uff1a", result);
          GLB.playerUserIds = userIds;
        }
        this.joinRoom = true;
      },
      showLcon: function showLcon() {
        for (var i = 0; i < GLB.playerUserIds.length; i++) {
          var playerIcon = this.playerIcons[i].getComponent("playerIcon");
          playerIcon && !playerIcon.userInfo && playerIcon.setData(GLB.playerUserIds[i]);
        }
      },
      checkLcon: function checkLcon() {
        if (null === this.playerIcons[i].getComponent("playerIcon").playerSprite.spriteFrame || this.joinRoom) {
          Game.GameManager.network.connect(GLB.IP, GLB.PORT, function() {});
          this.scheduleOnce(this.showLcon, 1);
        }
      },
      joinRoomNotify: function joinRoomNotify(data) {
        console.log("joinRoomNotify, roomUserInfo:" + JSON.stringify(data.roomUserInfo));
        var playerIcon = null;
        for (var j = 0; j < this.playerIcons.length; j++) {
          playerIcon = this.playerIcons[j].getComponent("playerIcon");
          if (playerIcon && !playerIcon.userInfo) {
            playerIcon.setData(data.roomUserInfo);
            break;
          }
        }
        this.bQuit = false;
      },
      leaveRoom: function leaveRoom() {
        if (!this.bQuit) return;
        mvs.engine.leaveRoom("");
        uiFunc.closeUI(this.node.name);
        this.node.destroy();
      },
      leaveRoomNotify: function leaveRoomNotify(data) {
        if (GLB.roomId === data.leaveRoomInfo.roomID) for (var i = 0; i < this.playerIcons.length; i++) {
          var playerIcon = this.playerIcons[i].getComponent("playerIcon");
          if (playerIcon && playerIcon.userInfo && playerIcon.playerId === data.leaveRoomInfo.userId) {
            playerIcon.init();
            break;
          }
        }
      },
      leaveRoomResponse: function leaveRoomResponse(data) {
        if (200 === data.leaveRoomRsp.status) {
          console.log("\u79bb\u5f00\u623f\u95f4\u6210\u529f");
          for (var i = 0; i < this.playerIcons.length; i++) {
            var playerIcon = this.playerIcons[i].getComponent("playerIcon");
            if (playerIcon) {
              playerIcon.init();
              break;
            }
          }
          uiFunc.closeUI(this.node.name);
          this.node.destroy();
        } else console.log("\u79bb\u5f00\u623f\u95f4\u5931\u8d25");
      },
      joinOverResponse: function joinOverResponse(data) {
        if (200 === data.joinOverRsp.status) {
          console.log("\u5173\u95ed\u623f\u95f4\u6210\u529f");
          this.notifyGameStart();
        } else console.log("\u5173\u95ed\u623f\u95f4\u5931\u8d25\uff0c\u56de\u8c03\u901a\u77e5\u9519\u8bef\u7801\uff1a", data.joinOverRsp.status);
      },
      notifyGameStart: function notifyGameStart() {
        GLB.isRoomOwner = true;
        var msg = {
          action: GLB.GAME_START_EVENT,
          userIds: GLB.playerUserIds
        };
        setTimeout(function() {
          Game.GameManager.sendEventEx(msg);
        }, 750);
      },
      onDestroy: function onDestroy() {
        clientEvent.off(clientEvent.eventType.joinRoomResponse, this.joinRoomResponse, this);
        clientEvent.off(clientEvent.eventType.joinRoomNotify, this.joinRoomNotify, this);
        clientEvent.off(clientEvent.eventType.leaveRoomResponse, this.leaveRoomResponse, this);
        clientEvent.off(clientEvent.eventType.leaveRoomNotify, this.leaveRoomNotify, this);
        clientEvent.off(clientEvent.eventType.joinOverResponse, this.joinOverResponse, this);
        clientEvent.off(clientEvent.eventType.checkLcon, this.checkLcon, this);
      }
    });
    cc._RF.pop();
  }, {
    Matchvs: "Matchvs",
    uiPanel: "uiPanel"
  } ],
  uiPanel: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "30528wp12pACamYt0bQ/BUa", "uiPanel");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        isTop: false
      },
      onLoad: function onLoad() {
        this.nodeDict = {};
        var linkWidget = function(self, nodeDict) {
          var children = self.children;
          for (var i = 0; i < children.length; i++) {
            var widgetName = children[i].name;
            if (widgetName && widgetName.indexOf("key_") >= 0) {
              var nodeName = widgetName.substring(4);
              nodeDict[nodeName] && cc.error("\u63a7\u4ef6\u540d\u5b57\u91cd\u590d!" + children[i].name);
              nodeDict[nodeName] = children[i];
            }
            children[i].childrenCount > 0 && linkWidget(children[i], nodeDict);
          }
        }.bind(this);
        linkWidget(this.node, this.nodeDict);
      },
      onDestroy: function onDestroy() {
        clientEvent.clear(this);
      }
    });
    cc._RF.pop();
  }, {} ],
  uiRankPanel: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "2c8cfg9bhVBM6dvwnWUt5qp", "uiRankPanel");
    "use strict";
    var uiPanel = require("uiPanel");
    cc.Class({
      extends: uiPanel,
      properties: {
        rankPrefab: {
          default: null,
          type: cc.Node
        },
        rank1Node: {
          default: null,
          type: cc.Node
        },
        rank2Node: {
          default: null,
          type: cc.Node
        },
        rank3Node: {
          default: null,
          type: cc.Node
        }
      },
      onLoad: function onLoad() {
        this._super();
        this.rankPrefab.active = false;
        this.rank1Node.active = false;
        this.rank2Node.active = false;
        this.rank3Node.active = false;
        this.rank1Info = this.rank1Node.getComponent("rankUserInfo");
        this.rank2Info = this.rank2Node.getComponent("rankUserInfo");
        this.rank3Info = this.rank3Node.getComponent("rankUserInfo");
        this.nodeDict["exit"].on("click", this.quit, this);
      },
      quit: function quit() {
        uiFunc.closeUI(this.node.name);
        this.node.destroy();
      },
      setData: function setData(rankdata) {
        console.log("setData");
        rankdata = rankdata.filter(function(data) {
          return data.score !== Number.MAX_SAFE_INTEGER && 0 !== data.score;
        });
        for (var i = 0; i < rankdata.length; i++) if (0 === i) {
          this.rank1Node.active = true;
          this.rank1Info.setData(i, rankdata[i]);
        } else if (1 === i) {
          this.rank2Node.active = true;
          this.rank2Info.setData(i, rankdata[i]);
        } else if (2 === i) {
          this.rank3Node.active = true;
          this.rank3Info.setData(i, rankdata[i]);
        } else {
          var temp = cc.instantiate(this.rankPrefab);
          temp.active = true;
          temp.parent = this.rankPrefab.parent;
          var rankInfo = temp.getComponent("rankUserInfo");
          rankInfo.setData(i, rankdata[i]);
        }
      }
    });
    cc._RF.pop();
  }, {
    uiPanel: "uiPanel"
  } ],
  uiResultPanel: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "aadc24gULhCPYULPXeRnBE/", "uiResultPanel");
    "use strict";
    var uiPanel = require("uiPanel");
    cc.Class({
      extends: uiPanel,
      properties: {},
      start: function start() {}
    });
    cc._RF.pop();
  }, {
    uiPanel: "uiPanel"
  } ],
  uiResult: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "f36ab+a3uVHprGY+tE/xnl0", "uiResult");
    "use strict";
    var uiPanel = require("uiPanel");
    var mvs = require("Matchvs");
    cc.Class({
      extends: uiPanel,
      properties: {
        loseClip: {
          default: null,
          url: cc.AudioClip
        },
        victoryClip: {
          default: null,
          url: cc.AudioClip
        }
      },
      onLoad: function onLoad() {
        this._super();
        this.player1 = this.nodeDict["player1"].getComponent("resultPlayerIcon");
        this.player1.node.active = false;
        this.player2 = this.nodeDict["player2"].getComponent("resultPlayerIcon");
        this.player2.node.active = false;
        this.player3 = this.nodeDict["player3"].getComponent("resultPlayerIcon");
        this.player3.node.active = false;
        this.nodeDict["quit"].on("click", this.quit, this);
      },
      setData: function setData(data) {
        if (data.length > 0) {
          this.player1.setData(data[0]);
          this.player1.node.active = true;
          if (data.length > 1) {
            this.player2.setData(data[1]);
            this.player2.node.active = true;
          }
          if (data.length > 2) {
            this.player3.setData(data[2]);
            this.player3.node.active = true;
          }
        }
        data.loseCamp === Camp.Friend ? cc.audioEngine.play(this.victoryClip, false, 1) : cc.audioEngine.play(this.loseClip, false, 1);
      },
      quit: function quit() {
        mvs.engine.leaveRoom("");
        var gamePanel = uiFunc.findUI("uiGamePanel");
        if (gamePanel) {
          uiFunc.closeUI("uiGamePanel");
          gamePanel.destroy();
        }
        uiFunc.closeUI(this.node.name);
        this.node.destroy();
        Game.GameManager.lobbyShow();
      }
    });
    cc._RF.pop();
  }, {
    Matchvs: "Matchvs",
    uiPanel: "uiPanel"
  } ],
  uiRoomList: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "b8d92GHTWtF9b8nT+A88ZLS", "uiRoomList");
    "use strict";
    var uiPanel = require("uiPanel");
    var mvs = require("Matchvs");
    cc.Class({
      extends: uiPanel,
      properties: {},
      start: function start() {
        this.roomPrefab = this.nodeDict["roomPrefab"];
        this.editBox = this.nodeDict["editBox"].getComponent(cc.EditBox);
        this.roomPrefab.active = false;
        this.nodeDict["search"].on("click", this.search, this);
        this.nodeDict["quit"].on("click", this.quit, this);
        this.rooms = [];
        clientEvent.on(clientEvent.eventType.getRoomListResponse, this.getRoomListResponse, this);
        clientEvent.on(clientEvent.eventType.joinRoomResponse, this.joinRoomResponse, this);
        clientEvent.on(clientEvent.eventType.getRoomListExResponse, this.getRoomListExResponse, this);
        this.getRoomList();
        this.roomRqId = setInterval(function() {
          "" === this.editBox.string && this.getRoomList();
        }.bind(this), 5e3);
      },
      getRoomList: function getRoomList() {
        var filter = {
          maxPlayer: 0,
          mode: 0,
          canWatch: 0,
          roomProperty: "",
          full: 2,
          state: 1,
          sort: 1,
          order: 0,
          pageNo: 0,
          pageSize: 20
        };
        mvs.engine.getRoomListEx(filter);
      },
      getRoomListResponse: function getRoomListResponse(data) {
        for (var j = 0; j < this.rooms.length; j++) this.rooms[j].destroy();
        this.rooms = [];
        data.roomInfos.sort(function(a, b) {
          return a.roomID - b.roomID;
        });
        for (var i = 0; i < data.roomInfos.length; i++) {
          var room = cc.instantiate(this.roomPrefab);
          room.active = true;
          room.parent = this.roomPrefab.parent;
          var roomScript = room.getComponent("roomInfo");
          roomScript.setData(data.roomInfos[i]);
          this.rooms.push(room);
        }
      },
      getRoomListExResponse: function getRoomListExResponse(data) {
        for (var j = 0; j < this.rooms.length; j++) this.rooms[j].destroy();
        this.rooms = [];
        this.roomAttrs = data.rsp.roomAttrs;
        for (var i = 0; i < data.rsp.roomAttrs.length; i++) {
          var room = cc.instantiate(this.roomPrefab);
          room.active = true;
          room.parent = this.roomPrefab.parent;
          var roomScript = room.getComponent("roomInfo");
          roomScript.setData(data.rsp.roomAttrs[i]);
          this.rooms.push(room);
        }
      },
      quit: function quit() {
        clearInterval(this.roomRqId);
        uiFunc.closeUI(this.node.name);
        this.node.destroy();
      },
      search: function search() {
        if ("" === this.editBox.string) for (var i = 0; i < this.rooms.length; i++) this.rooms[i].active = true; else for (var j = 0; j < this.rooms.length; j++) {
          var roomScript = this.rooms[j].getComponent("roomInfo");
          roomScript.roomIdLb.string == this.editBox.string ? this.rooms[j].active = true : this.rooms[j].active = false;
        }
      },
      joinRoomResponse: function joinRoomResponse(data) {
        if (200 !== data.status) console.log("\u8fdb\u5165\u623f\u95f4\u5931\u8d25,\u5f02\u6b65\u56de\u8c03\u9519\u8bef\u7801: " + data.status); else {
          console.log("\u8fdb\u5165\u623f\u95f4\u6210\u529f");
          console.log("\u623f\u95f4\u53f7: " + data.roomInfo.roomID);
          data.roomUserInfoList.some(function(x) {
            return x.userId === GLB.userInfo.id;
          }) || data.roomUserInfoList.push({
            userId: GLB.userInfo.id,
            userProfile: ""
          });
          for (var i = 0; i < this.roomAttrs.length; i++) if (data.roomInfo.roomID === this.roomAttrs[i].roomID) {
            GLB.MAX_PLAYER_COUNT = this.roomAttrs[i].maxPlayer;
            break;
          }
          cc.Canvas.instance.designResolution.height > cc.Canvas.instance.designResolution.width ? uiFunc.openUI("uiRoomVer", function(obj) {
            var room = obj.getComponent("uiRoom");
            room.joinRoomInit(data.roomUserInfoList, data.roomInfo);
            uiFunc.closeUI(this.node.name);
            this.node.destroy();
          }.bind(this)) : uiFunc.openUI("uiRoom", function(obj) {
            var room = obj.getComponent("uiRoom");
            room.joinRoomInit(data.roomUserInfoList, data.roomInfo);
            uiFunc.closeUI(this.node.name);
            this.node.destroy();
          }.bind(this));
        }
      },
      onDestroy: function onDestroy() {
        clearInterval(this.roomRqId);
        clientEvent.off(clientEvent.eventType.getRoomListResponse, this.getRoomListResponse, this);
        clientEvent.off(clientEvent.eventType.joinRoomResponse, this.joinRoomResponse, this);
        clientEvent.off(clientEvent.eventType.getRoomListExResponse, this.getRoomListExResponse, this);
      }
    });
    cc._RF.pop();
  }, {
    Matchvs: "Matchvs",
    uiPanel: "uiPanel"
  } ],
  uiRoom: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "72f2f1cYGZOhIZyqvev+rWy", "uiRoom");
    "use strict";
    var uiPanel = require("uiPanel");
    var mvs = require("Matchvs");
    cc.Class({
      extends: uiPanel,
      properties: {},
      onLoad: function onLoad() {
        this._super();
        this.players = [];
        this.roomId = 0;
        this.roomInfo = null;
        this.owner = 0;
        this.playerPrefab = this.nodeDict["player"];
        this.playerPrefab.active = false;
        this.nodeDict["quit"].on("click", this.quit, this);
        this.nodeDict["startGame"].on("click", this.startGame, this);
        clientEvent.on(clientEvent.eventType.joinRoomNotify, this.joinRoomNotify, this);
        clientEvent.on(clientEvent.eventType.leaveRoomResponse, this.leaveRoomResponse, this);
        clientEvent.on(clientEvent.eventType.leaveRoomNotify, this.leaveRoomNotify, this);
        clientEvent.on(clientEvent.eventType.kickPlayerResponse, this.kickPlayerResponse, this);
        clientEvent.on(clientEvent.eventType.kickPlayerNotify, this.kickPlayerNotify, this);
        clientEvent.on(clientEvent.eventType.leaveRoomMedNotify, this.leaveRoomMedNotify, this);
        for (var i = 0; i < GLB.MAX_PLAYER_COUNT; i++) {
          var temp = cc.instantiate(this.playerPrefab);
          temp.active = true;
          temp.parent = this.nodeDict["layout"];
          var roomUserInfo = temp.getComponent("roomUserInfo");
          roomUserInfo.init();
          this.players.push(roomUserInfo);
        }
      },
      kickPlayerResponse: function kickPlayerResponse(data) {
        for (var j = 0; j < this.players.length; j++) if (this.players[j].userId === data.kickPlayerRsp.userID) {
          this.players[j].init();
          break;
        }
        if (GLB.userInfo.id === data.kickPlayerRsp.userID) {
          GLB.isRoomOwner = false;
          uiFunc.closeUI(this.node.name);
          this.node.destroy();
        }
      },
      kickPlayerNotify: function kickPlayerNotify(data) {
        for (var j = 0; j < this.players.length; j++) if (this.players[j].userId === data.kickPlayerNotify.userId) {
          this.players[j].init();
          break;
        }
        if (GLB.userInfo.id === data.kickPlayerNotify.userId) {
          GLB.isRoomOwner = false;
          uiFunc.closeUI(this.node.name);
          this.node.destroy();
        }
      },
      joinRoomNotify: function joinRoomNotify(data) {
        for (var j = 0; j < this.players.length; j++) if (0 === this.players[j].userId) {
          this.players[j].setData(data.roomUserInfo.userId, this.ownerId);
          break;
        }
      },
      leaveRoomResponse: function leaveRoomResponse(data) {
        200 === data.leaveRoomRsp.status ? console.log("\u79bb\u5f00\u623f\u95f4\u6210\u529f\uff01") : console.log("\u79bb\u5f00\u623f\u95f4\u5931\u8d25");
        GLB.isRoomOwner = false;
        uiFunc.closeUI(this.node.name);
        this.node.destroy();
      },
      leaveRoomMedNotify: function leaveRoomMedNotify(data) {
        for (var j = 0; j < this.players.length; j++) if (this.players[j].userId === data.userID) {
          this.players[j].init();
          break;
        }
        data.userId !== GLB.userInfo.id && (this.ownerId = GLB.userInfo.id);
        this.ownerId === GLB.userInfo.id && (GLB.isRoomOwner = true);
        for (var i = 0; i < this.players.length; i++) 0 !== this.players[i].userId && this.players[i].setData(this.players[i].userId, this.ownerId);
        mvs.engine.kickPlayer(data.userID, "kick");
        this.refreshStartBtn();
      },
      leaveRoomNotify: function leaveRoomNotify(data) {
        for (var j = 0; j < this.players.length; j++) if (this.players[j].userId === data.leaveRoomInfo.userId) {
          this.players[j].init();
          break;
        }
        data.leaveRoomInfo.userId !== GLB.userInfo.id && (this.ownerId = GLB.userInfo.id);
        this.ownerId === GLB.userInfo.id && (GLB.isRoomOwner = true);
        for (var i = 0; i < this.players.length; i++) 0 !== this.players[i].userId && this.players[i].setData(this.players[i].userId, this.ownerId);
        this.refreshStartBtn();
      },
      refreshStartBtn: function refreshStartBtn() {
        var spNode = this.nodeDict["startGame"];
        var btn = this.nodeDict["startGame"].getComponent(cc.Button);
        if (GLB.isRoomOwner) {
          spNode.color = cc.Color.WHITE;
          btn.enabled = true;
        } else {
          spNode.color = cc.Color.BLACK;
          btn.enabled = false;
        }
      },
      quit: function quit() {
        mvs.engine.leaveRoom("");
      },
      startGame: function startGame() {
        if (!GLB.isRoomOwner) {
          uiFunc.openUI("uiTip", function(obj) {
            var uiTip = obj.getComponent("uiTip");
            uiTip && uiTip.setData("\u7b49\u5f85\u623f\u4e3b\u5f00\u59cb\u6e38\u620f");
          }.bind(this));
          return;
        }
        var userIds = [];
        var playerCnt = 0;
        for (var j = 0; j < this.players.length; j++) if (0 !== this.players[j].userId) {
          playerCnt++;
          userIds.push(this.players[j].userId);
        }
        if (playerCnt === GLB.MAX_PLAYER_COUNT) {
          var result = mvs.engine.joinOver("");
          console.log("\u53d1\u51fa\u5173\u95ed\u623f\u95f4\u7684\u901a\u77e5");
          0 !== result && console.log("\u5173\u95ed\u623f\u95f4\u5931\u8d25\uff0c\u9519\u8bef\u7801\uff1a", result);
          GLB.playerUserIds = userIds;
          var msg = {
            action: GLB.GAME_START_EVENT,
            userIds: userIds
          };
          Game.GameManager.sendEventEx(msg);
        } else uiFunc.openUI("uiTip", function(obj) {
          var uiTip = obj.getComponent("uiTip");
          uiTip && uiTip.setData("\u623f\u95f4\u4eba\u6570\u4e0d\u8db3");
        }.bind(this));
      },
      createRoomInit: function createRoomInit(rsp) {
        this.roomId = rsp.roomID;
        this.ownerId = rsp.owner;
        this.players[0].setData(this.ownerId, this.ownerId);
        GLB.isRoomOwner = true;
        this.refreshStartBtn();
      },
      joinRoomInit: function joinRoomInit(roomUserInfoList, roomInfo) {
        roomUserInfoList.sort(function(a, b) {
          if (roomInfo.ownerId === b.userId) return 1;
          return 0;
        });
        this.ownerId = roomInfo.ownerId;
        for (var j = 0; j < roomUserInfoList.length; j++) this.players[j].setData(roomUserInfoList[j].userId, this.ownerId);
        this.refreshStartBtn();
      },
      onDestroy: function onDestroy() {
        clientEvent.off(clientEvent.eventType.joinRoomNotify, this.joinRoomNotify, this);
        clientEvent.off(clientEvent.eventType.leaveRoomResponse, this.leaveRoomResponse, this);
        clientEvent.off(clientEvent.eventType.leaveRoomNotify, this.leaveRoomNotify, this);
        clientEvent.off(clientEvent.eventType.kickPlayerResponse, this.kickPlayerResponse, this);
        clientEvent.off(clientEvent.eventType.kickPlayerNotify, this.kickPlayerNotify, this);
        clientEvent.off(clientEvent.eventType.leaveRoomMedNotify, this.leaveRoomMedNotify, this);
      }
    });
    cc._RF.pop();
  }, {
    Matchvs: "Matchvs",
    uiPanel: "uiPanel"
  } ],
  uiTip: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "7960fhCqglNqaW5JWJ8/Tdi", "uiTip");
    "use strict";
    var uiPanel = require("uiPanel");
    cc.Class({
      extends: uiPanel,
      properties: {},
      onload: function onload() {
        this._super();
      },
      start: function start() {
        setTimeout(function() {
          if (this && this.node) {
            uiFunc.closeUI(this.node.name);
            this.node.destroy();
          }
        }.bind(this), 2e3);
      },
      setData: function setData(content) {
        this.nodeDict["tipLb"].getComponent(cc.Label).string = content;
      }
    });
    cc._RF.pop();
  }, {
    uiPanel: "uiPanel"
  } ],
  uiVsResult: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "35707Ri1WpCHqvUV83dj6vS", "uiVsResult");
    "use strict";
    var uiPanel = require("uiPanel");
    var mvs = require("Matchvs");
    cc.Class({
      extends: uiPanel,
      properties: {
        loseClip: {
          default: null,
          url: cc.AudioClip
        },
        victoryClip: {
          default: null,
          url: cc.AudioClip
        }
      },
      start: function start() {
        var isLose = !Game.GameManager.isRivalLeave && Game.PlayerManager.self.score < Game.PlayerManager.rival.score;
        clientEvent.on(clientEvent.eventType.checkLcon, this.checkLcon, this);
        this.player = this.nodeDict["player"].getComponent("resultPlayerIcon");
        this.rival = this.nodeDict["rival"].getComponent("resultPlayerIcon");
        this.showLcon();
        this.nodeDict["vs"].active = true;
        this.nodeDict["quit"].on("click", this.quit, this);
        this.nodeDict["lose"].active = isLose;
        this.nodeDict["win"].active = !isLose;
        isLose ? cc.audioEngine.play(this.loseClip, false, 1) : cc.audioEngine.play(this.victoryClip, false, 1);
        this.showScore();
      },
      showLcon: function showLcon() {
        this.player.setData(Game.PlayerManager.self.playerId);
        this.rival.setData(Game.PlayerManager.rival.playerId);
      },
      checkLcon: function checkLcon() {
        if (null === this.player.icon.spriteFrame) {
          Game.GameManager.network.connect(GLB.IP, GLB.PORT, function() {});
          this.scheduleOnce(this.showLcon, 1);
        }
      },
      quit: function quit() {
        mvs.engine.leaveRoom("");
        var gamePanel = uiFunc.findUI("uiGamePanel");
        if (gamePanel) {
          uiFunc.closeUI("uiGamePanel");
          gamePanel.destroy();
        }
        uiFunc.closeUI(this.node.name);
        this.node.destroy();
        Game.GameManager.lobbyShow();
      },
      showScore: function showScore() {
        var self = Game.PlayerManager.self;
        var rival = Game.PlayerManager.rival;
        Game.GameManager.setRankData(self.score);
        this.nodeDict["scoreOne"].getChildByName("self").getComponent(cc.Label).string = self.score;
        this.nodeDict["scoreOne"].getChildByName("rival").getComponent(cc.Label).string = rival.score;
        var ratio = self.score / (self.score + rival.score);
        0 === self.score && 0 === rival.score && (ratio = .5);
        this.nodeDict["scoreOne"].getComponent(cc.ProgressBar).progress = ratio;
        this.nodeDict["scoreTwo"].getChildByName("self").getComponent(cc.Label).string = self.blockNumber;
        this.nodeDict["scoreTwo"].getChildByName("rival").getComponent(cc.Label).string = rival.blockNumber;
        ratio = self.blockNumber / (self.blockNumber + rival.blockNumber);
        0 === self.blockNumber && 0 === rival.blockNumber && (ratio = .5);
        this.nodeDict["scoreTwo"].getComponent(cc.ProgressBar).progress = ratio;
        self.maxCombo = self.maxCombo > 2 ? self.maxCombo - 2 : 0;
        rival.maxCombo = rival.maxCombo > 2 ? rival.maxCombo - 2 : 0;
        this.nodeDict["scoreThree"].getChildByName("self").getComponent(cc.Label).string = self.maxCombo;
        this.nodeDict["scoreThree"].getChildByName("rival").getComponent(cc.Label).string = rival.maxCombo;
        ratio = self.maxCombo / (self.maxCombo + rival.maxCombo);
        0 === self.maxCombo && 0 === rival.maxCombo && (ratio = .5);
        this.nodeDict["scoreThree"].getComponent(cc.ProgressBar).progress = ratio;
      },
      onDestroy: function onDestroy() {
        clientEvent.off(clientEvent.eventType.checkLcon, this.checkLcon, this);
      }
    });
    cc._RF.pop();
  }, {
    Matchvs: "Matchvs",
    uiPanel: "uiPanel"
  } ],
  uiWaitingForServer: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "53a79r+TudAKapJWl7FMtH4", "uiWaitingForServer");
    "use strict";
    var uiPanel = require("uiPanel");
    var mvs = require("Matchvs");
    cc.Class({
      extends: uiPanel,
      properties: {},
      onLoad: function onLoad() {
        this._super();
        this.nodeDict["sure"].on("click", this.sure, this);
        this.nodeDict["close"].on("click", this.close, this);
      },
      close: function close() {
        uiFunc.closeUI(this.node);
      },
      sure: function sure() {
        mvs.engine.leaveRoom("");
        var gamePanel = uiFunc.findUI("uiGamePanel");
        gamePanel && uiFunc.closeUI(gamePanel);
        uiFunc.closeUI(this.node);
        Game.GameManager.lobbyShow();
      }
    });
    cc._RF.pop();
  }, {
    Matchvs: "Matchvs",
    uiPanel: "uiPanel"
  } ]
}, {}, [ "DataFunc", "Globals", "Matchvs", "MatchvsEngine", "UIFunc", "clientEvent", "eventListenerSelf", "msgType", "network", "pomeloBuild", "uiPanel", "playerIcon", "rankUserInfo", "resultPlayerIcon", "roomInfo", "roomUserInfo", "uiBeginnerCourse", "uiCreateRoom", "uiExit", "uiLobbyPanel", "uiLogin", "uiMaskLayout", "uiMatching1v1Ver", "uiRankPanel", "uiResult", "uiResultPanel", "uiRoom", "uiRoomList", "uiTip", "uiVsResult", "uiWaitingForServer", "block", "dataManager", "layoutDt", "electric", "blockManager", "bubbleManager", "clickManager", "comboManager", "gameManager", "pathManager", "playerManager", "jump", "path", "player", "uiGamePanel", "matchvs.all" ]);