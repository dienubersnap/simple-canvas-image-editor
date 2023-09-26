"use strict";
function _class_call_check(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function _defineProperties(target, props) {
    for(var i = 0; i < props.length; i++){
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function _create_class(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = function(target, all) {
    for(var name in all)__defProp(target, name, {
        get: all[name],
        enumerable: true
    });
};
var __copyProps = function(to, from, except, desc) {
    if (from && typeof from === "object" || typeof from === "function") {
        var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
        try {
            var _loop = function() {
                var key = _step.value;
                if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
                    get: function() {
                        return from[key];
                    },
                    enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
                });
            };
            for(var _iterator = __getOwnPropNames(from)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true)_loop();
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally{
            try {
                if (!_iteratorNormalCompletion && _iterator.return != null) {
                    _iterator.return();
                }
            } finally{
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    }
    return to;
};
var __toCommonJS = function(mod) {
    return __copyProps(__defProp({}, "__esModule", {
        value: true
    }), mod);
};
// src/index.ts
var src_exports = {};
__export(src_exports, {
    CanvasImageEdit: function() {
        return canvasImageEdit_default;
    }
});
module.exports = __toCommonJS(src_exports);
// src/lib/convert.ts
function rgbToHsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var v = max;
    var d = max - min;
    var s = max === 0 ? 0 : d / max;
    var h = 0;
    if (max === min) {
        h = 0;
    } else {
        switch(max){
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }
    return {
        h: h,
        s: s,
        v: v
    };
}
function hsvToRgb(h, s, v) {
    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);
    var _ref = {
        r: 0,
        g: 0,
        b: 0
    }, r = _ref.r, g = _ref.g, b = _ref.b;
    switch(i % 6){
        case 0:
            r = v;
            g = t;
            b = p;
            break;
        case 1:
            r = q;
            g = v;
            b = p;
            break;
        case 2:
            r = p;
            g = v;
            b = t;
            break;
        case 3:
            r = p;
            g = q;
            b = v;
            break;
        case 4:
            r = t;
            g = p;
            b = v;
            break;
        case 5:
            r = v;
            g = p;
            b = q;
            break;
    }
    return {
        r: Math.floor(r * 255),
        g: Math.floor(g * 255),
        b: Math.floor(b * 255)
    };
}
// src/lib/color.ts
var Color = /*#__PURE__*/ function() {
    function _Color(r, g, b, a) {
        _class_call_check(this, _Color);
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    _create_class(_Color, [
        {
            key: "mul",
            value: function mul(factor) {
                return new _Color(this.r * factor, this.g * factor, this.b * factor, this.a * factor);
            }
        },
        {
            key: "add",
            value: function add(other) {
                return new _Color(this.r + other.r, this.g + other.g, this.b + other.b, this.a + other.a);
            }
        },
        {
            key: "clamp",
            value: function clamp() {
                this.r = Math.min(255, Math.max(0, this.r));
                this.g = Math.min(255, Math.max(0, this.g));
                this.b = Math.min(255, Math.max(0, this.b));
                this.a = Math.min(255, Math.max(0, this.a));
            }
        }
    ]);
    return _Color;
}();
var RGBAImage = /*#__PURE__*/ function() {
    function _RGBAImage(w, h, data) {
        _class_call_check(this, _RGBAImage);
        this.type = "RGBAImage";
        this.w = w;
        this.h = h;
        this.data = new Uint8Array(w * h * 4);
        if (data) {
            this.data.set(data);
        }
    }
    _create_class(_RGBAImage, [
        {
            key: "getPixel",
            value: function getPixel(x, y) {
                var idx = (y * this.w + x) * 4;
                return new Color(this.data[idx], this.data[idx + 1], this.data[idx + 2], this.data[idx + 3]);
            }
        },
        {
            key: "sample",
            value: function sample(x, y) {
                var ty = Math.floor(y);
                var dy = Math.ceil(y);
                var lx = Math.floor(x);
                var rx = Math.ceil(x);
                var fx = x - lx;
                var fy = y - ty;
                var c = this.getPixel(lx, ty).mul((1 - fy) * (1 - fx)).add(this.getPixel(lx, dy).mul(fy * (1 - fx))).add(this.getPixel(rx, ty).mul((1 - fy) * fx)).add(this.getPixel(rx, dy).mul(fy * fx));
                c.clamp();
                return c;
            }
        },
        {
            key: "setPixel",
            value: function setPixel(x, y, c) {
                var idx = (y * this.w + x) * 4;
                this.data[idx] = c.r;
                this.data[idx + 1] = c.g;
                this.data[idx + 2] = c.b;
                this.data[idx + 3] = c.a;
            }
        },
        {
            key: "apply",
            value: function apply(f) {
                for(var y = 0; y < this.h; y++){
                    for(var x = 0; x < this.w; x++){
                        this.setPixel(x, y, f(this.getPixel(x, y)));
                    }
                }
                return this;
            }
        },
        {
            key: "formatUint8Array",
            value: function formatUint8Array(f) {
                var dst = new _RGBAImage(this.w, this.h, this.data.slice());
                var data = dst.data;
                for(var y = 0, idx = 0; y < this.h; ++y){
                    for(var x = 0; x < this.w; ++x, idx += 4){
                        f(data, idx, this.w, this.h, x, y);
                    }
                }
                return dst;
            }
        },
        {
            key: "resize",
            value: function resize(w, h) {
                var iw = this.w;
                var ih = this.h;
                var dst = new _RGBAImage(w, h);
                var ystep = 1 / (h - 1);
                var xstep = 1 / (w - 1);
                for(var i = 0; i < h; i++){
                    var y = i * ystep;
                    for(var j = 0; j < w; j++){
                        var x = j * xstep;
                        dst.setPixel(j, i, this.sample(x * (iw - 1), y * (ih - 1)));
                    }
                }
                return dst;
            }
        },
        {
            key: "resize_longedge",
            value: function resize_longedge(L) {
                var nw;
                var nh;
                if (this.w > this.h && this.w > L) {
                    nw = L;
                    nh = Math.round(L / this.w * this.h);
                    this.resize(nw, nh);
                }
                if (this.h > L) {
                    nh = L;
                    nw = Math.round(L / this.h * this.w);
                    this.resize(nw, nh);
                }
                return this;
            }
        },
        {
            key: "uploadTexture",
            value: function uploadTexture(ctx, texId) {
                ctx.bindTexture(ctx.TEXTURE_2D, texId);
                ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.NEAREST);
                ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.NEAREST);
                ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE);
                ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);
                ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, this.w, this.h, 0, ctx.RGBA, ctx.UNSIGNED_BYTE, this.data);
            }
        },
        {
            key: "toImageData",
            value: function toImageData(ctx) {
                var imgData = ctx.createImageData(this.w, this.h);
                imgData.data.set(this.data);
                return imgData;
            }
        },
        {
            //image adjustment filter
            key: "exposure",
            value: function exposure(value) {
                var _this = this;
                var exposureFactor = Math.pow(2, value / 100);
                var dst = this.formatUint8Array(function(data, idx, _, __, x, y) {
                    var _this_getPixel = _this.getPixel(x, y), r = _this_getPixel.r, g = _this_getPixel.g, b = _this_getPixel.b;
                    r = Math.min(255, Math.max(0, Math.floor(r * exposureFactor)));
                    g = Math.min(255, Math.max(0, Math.floor(g * exposureFactor)));
                    b = Math.min(255, Math.max(0, Math.floor(b * exposureFactor)));
                    data[idx] = r;
                    ++idx;
                    data[idx] = g;
                    ++idx;
                    data[idx] = b;
                    return data;
                });
                return dst;
            }
        },
        {
            key: "brightness",
            value: function brightness(value) {
                var _this = this;
                var brightnessFactor = Math.floor(value / 100 * 255);
                var dst = this.formatUint8Array(function(data, idx, _, __, x, y) {
                    var _this_getPixel = _this.getPixel(x, y), r = _this_getPixel.r, g = _this_getPixel.g, b = _this_getPixel.b;
                    r = Math.min(255, Math.max(0, r + brightnessFactor));
                    g = Math.min(255, Math.max(0, g + brightnessFactor));
                    b = Math.min(255, Math.max(0, b + brightnessFactor));
                    data[idx] = r;
                    ++idx;
                    data[idx] = g;
                    ++idx;
                    data[idx] = b;
                    return data;
                });
                return dst;
            }
        },
        {
            key: "shadow",
            value: function shadow(value) {
                var _this = this;
                var normalizedvalue = Math.pow(2, value / 100);
                var dst = this.formatUint8Array(function(data, idx, _, __, x, y) {
                    var _this_getPixel = _this.getPixel(x, y), r = _this_getPixel.r, g = _this_getPixel.g, b = _this_getPixel.b;
                    var red = Math.pow(r / 255, 1 / normalizedvalue) * 255;
                    var green = Math.pow(g / 255, 1 / normalizedvalue) * 255;
                    var blue = Math.pow(b / 255, 1 / normalizedvalue) * 255;
                    r = Math.min(255, Math.max(0, red));
                    g = Math.min(255, Math.max(0, green));
                    b = Math.min(255, Math.max(0, blue));
                    data[idx] = r;
                    ++idx;
                    data[idx] = g;
                    ++idx;
                    data[idx] = b;
                    return data;
                });
                return dst;
            }
        },
        {
            key: "white",
            value: function white(val) {
                var _this = this;
                var dst = this.formatUint8Array(function(data, idx, _, __, x, y) {
                    var _this_getPixel = _this.getPixel(x, y), r = _this_getPixel.r, g = _this_getPixel.g, b = _this_getPixel.b;
                    var hsv = rgbToHsv(r, g, b);
                    hsv.v = Math.min(1, Math.max(0, hsv.v + val / 100));
                    var newColor = hsvToRgb(hsv.h, hsv.s, hsv.v);
                    data[idx] = newColor.r;
                    ++idx;
                    data[idx] = newColor.g;
                    ++idx;
                    data[idx] = newColor.b;
                    return data;
                });
                return dst;
            }
        },
        {
            key: "black",
            value: function black(val) {
                var _this = this;
                var normalizedvalue = (val + 100) / 100;
                var dst = this.formatUint8Array(function(data, idx, _, __, x, y) {
                    var _this_getPixel = _this.getPixel(x, y), r = _this_getPixel.r, g = _this_getPixel.g, b = _this_getPixel.b;
                    var red = r / 255 * normalizedvalue * 255;
                    var green = g / 255 * normalizedvalue * 255;
                    var blue = b / 255 * normalizedvalue * 255;
                    r = Math.min(255, Math.max(0, red));
                    g = Math.min(255, Math.max(0, green));
                    b = Math.min(255, Math.max(0, blue));
                    data[idx] = r;
                    ++idx;
                    data[idx] = g;
                    ++idx;
                    data[idx] = b;
                    return data;
                });
                return dst;
            }
        },
        {
            // tint
            key: "tint",
            value: function tint(value) {
                var _this = this;
                var dst = this.formatUint8Array(function(data, idx, _, __, x, y) {
                    var _this_getPixel = _this.getPixel(x, y), r = _this_getPixel.r, b = _this_getPixel.b;
                    var g = _this.getPixel(x, y).g;
                    var green = g + value;
                    g = Math.min(255, Math.max(0, green));
                    data[idx] = r;
                    ++idx;
                    data[idx] = g;
                    ++idx;
                    data[idx] = b;
                    return data;
                });
                return dst;
            }
        },
        {
            //temperature
            key: "temperature",
            value: function temperature(value) {
                var _this = this;
                var dst = this.formatUint8Array(function(data, idx, _, __, x, y) {
                    var _this_getPixel = _this.getPixel(x, y), r = _this_getPixel.r, b = _this_getPixel.b;
                    var g = _this.getPixel(x, y).g;
                    var red = r;
                    var blue = b;
                    red = r + value;
                    blue = b - value;
                    r = Math.min(255, Math.max(0, red));
                    b = Math.min(255, Math.max(0, blue));
                    data[idx] = r;
                    ++idx;
                    data[idx] = g;
                    ++idx;
                    data[idx] = b;
                    return data;
                });
                return dst;
            }
        },
        {
            key: "saturationRGB",
            value: function saturationRGB(value) {
                var _this = this;
                var saturationCorrection = value * -0.01;
                var dst = this.formatUint8Array(function(data, idx, _, __, x, y) {
                    var _this_getPixel = _this.getPixel(x, y), r = _this_getPixel.r, g = _this_getPixel.g, b = _this_getPixel.b;
                    var max = Math.max(r, g, b);
                    if (r !== max) r += (max - r) * saturationCorrection;
                    if (g !== max) g += (max - g) * saturationCorrection;
                    if (b !== max) b += (max - b) * saturationCorrection;
                    r = Math.min(255, Math.max(0, r));
                    g = Math.min(255, Math.max(0, g));
                    b = Math.min(255, Math.max(0, b));
                    data[idx] = r;
                    ++idx;
                    data[idx] = g;
                    ++idx;
                    data[idx] = b;
                    return data;
                });
                return dst;
            }
        },
        {
            // Detail
            key: "contrast",
            value: function contrast(value) {
                var _this = this;
                var contrastFactor = Math.pow((value + 100) / 100, 2);
                var dst = this.formatUint8Array(function(data, idx, _, __, x, y) {
                    var _this_getPixel = _this.getPixel(x, y), r = _this_getPixel.r, g = _this_getPixel.g, b = _this_getPixel.b;
                    r = (r / 255 - 0.5) * contrastFactor + 0.5;
                    g = (g / 255 - 0.5) * contrastFactor + 0.5;
                    b = (b / 255 - 0.5) * contrastFactor + 0.5;
                    r = Math.min(255, Math.max(0, r * 255));
                    g = Math.min(255, Math.max(0, g * 255));
                    b = Math.min(255, Math.max(0, b * 255));
                    data[idx] = r;
                    ++idx;
                    data[idx] = g;
                    ++idx;
                    data[idx] = b;
                    return data;
                });
                return dst;
            }
        },
        {
            key: "render",
            value: function render(cvs) {
                cvs.width = this.w;
                cvs.height = this.h;
                var context = cvs.getContext("2d");
                if (context) {
                    context.putImageData(this.toImageData(context), 0, 0);
                } else {
                    console.error("Canvas 2D context not available.");
                }
            }
        }
    ], [
        {
            key: "fromImage",
            value: function fromImage(img, cvs) {
                var w = img.width;
                var h = img.height;
                cvs.width = w;
                cvs.height = h;
                var ctx = cvs.getContext("2d", {
                    willReadFrequently: true
                });
                if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    var imgData = ctx.getImageData(0, 0, w, h);
                    var uint8Array = new Uint8Array(imgData.data);
                    var newImage = new _RGBAImage(w, h, uint8Array);
                    return newImage;
                }
                console.error("Canvas 2D context not available.");
                return new _RGBAImage(0, 0);
            }
        }
    ]);
    return _RGBAImage;
}();
// src/core/canvasImageEdit.ts
var CanvasImageEdit = /*#__PURE__*/ function() {
    function CanvasImageEdit(imageSrc) {
        _class_call_check(this, CanvasImageEdit);
        this.result = void 0;
        this.image = new Image();
        this.image.src = imageSrc;
        this.image.setAttribute("crossOrigin", "anonymous");
    }
    _create_class(CanvasImageEdit, [
        {
            key: "ImageLoader",
            value: function ImageLoader(cvs, maxEdge) {
                var that = this;
                this.image.onload = function() {
                    var inImg = RGBAImage.fromImage(that.image, cvs);
                    that.result = inImg.resize_longedge(maxEdge || 640);
                    that.result.render(cvs);
                    var event = new Event("imageloaded");
                    document.dispatchEvent(event);
                };
            }
        }
    ]);
    return CanvasImageEdit;
}();
var canvasImageEdit_default = CanvasImageEdit;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
    CanvasImageEdit: CanvasImageEdit
});
