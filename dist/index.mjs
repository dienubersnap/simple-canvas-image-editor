// src/lib/convert.ts
function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;
  let h = 0;
  if (max === min) {
    h = 0;
  } else {
    switch (max) {
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
  return { h, s, v };
}
function hsvToRgb(h, s, v) {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let { r, g, b } = { r: 0, g: 0, b: 0 };
  switch (i % 6) {
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
var Color = class _Color {
  constructor(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
  mul(factor) {
    return new _Color(
      this.r * factor,
      this.g * factor,
      this.b * factor,
      this.a * factor
    );
  }
  add(other) {
    return new _Color(
      this.r + other.r,
      this.g + other.g,
      this.b + other.b,
      this.a + other.a
    );
  }
  clamp() {
    this.r = Math.min(255, Math.max(0, this.r));
    this.g = Math.min(255, Math.max(0, this.g));
    this.b = Math.min(255, Math.max(0, this.b));
    this.a = Math.min(255, Math.max(0, this.a));
  }
};
var RGBAImage = class _RGBAImage {
  constructor(w, h, data) {
    this.type = "RGBAImage";
    this.w = w;
    this.h = h;
    this.data = new Uint8Array(w * h * 4);
    if (data) {
      this.data.set(data);
    }
  }
  getPixel(x, y) {
    const idx = (y * this.w + x) * 4;
    return new Color(
      this.data[idx],
      this.data[idx + 1],
      this.data[idx + 2],
      this.data[idx + 3]
    );
  }
  sample(x, y) {
    const ty = Math.floor(y);
    const dy = Math.ceil(y);
    const lx = Math.floor(x);
    const rx = Math.ceil(x);
    const fx = x - lx;
    const fy = y - ty;
    const c = this.getPixel(lx, ty).mul((1 - fy) * (1 - fx)).add(this.getPixel(lx, dy).mul(fy * (1 - fx))).add(this.getPixel(rx, ty).mul((1 - fy) * fx)).add(this.getPixel(rx, dy).mul(fy * fx));
    c.clamp();
    return c;
  }
  setPixel(x, y, c) {
    const idx = (y * this.w + x) * 4;
    this.data[idx] = c.r;
    this.data[idx + 1] = c.g;
    this.data[idx + 2] = c.b;
    this.data[idx + 3] = c.a;
  }
  apply(f) {
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        this.setPixel(x, y, f(this.getPixel(x, y)));
      }
    }
    return this;
  }
  formatUint8Array(f) {
    const dst = new _RGBAImage(this.w, this.h, this.data.slice());
    const { data } = dst;
    for (let y = 0, idx = 0; y < this.h; ++y) {
      for (let x = 0; x < this.w; ++x, idx += 4) {
        f(data, idx, this.w, this.h, x, y);
      }
    }
    return dst;
  }
  resize(w, h) {
    const iw = this.w;
    const ih = this.h;
    const dst = new _RGBAImage(w, h);
    const ystep = 1 / (h - 1);
    const xstep = 1 / (w - 1);
    for (let i = 0; i < h; i++) {
      const y = i * ystep;
      for (let j = 0; j < w; j++) {
        const x = j * xstep;
        dst.setPixel(j, i, this.sample(x * (iw - 1), y * (ih - 1)));
      }
    }
    return dst;
  }
  resize_longedge(L) {
    let nw;
    let nh;
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
  uploadTexture(ctx, texId) {
    ctx.bindTexture(ctx.TEXTURE_2D, texId);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.NEAREST);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.NEAREST);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);
    ctx.texImage2D(
      ctx.TEXTURE_2D,
      0,
      ctx.RGBA,
      this.w,
      this.h,
      0,
      ctx.RGBA,
      ctx.UNSIGNED_BYTE,
      this.data
    );
  }
  toImageData(ctx) {
    const imgData = ctx.createImageData(this.w, this.h);
    imgData.data.set(this.data);
    return imgData;
  }
  //image adjustment filter
  exposure(value) {
    const exposureFactor = 2 ** (value / 100);
    const dst = this.formatUint8Array((data, idx, _, __, x, y) => {
      let { r, g, b } = this.getPixel(x, y);
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
  brightness(value) {
    const brightnessFactor = Math.floor(value / 100 * 255);
    const dst = this.formatUint8Array((data, idx, _, __, x, y) => {
      let { r, g, b } = this.getPixel(x, y);
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
  shadow(value) {
    const normalizedvalue = 2 ** (value / 100);
    const dst = this.formatUint8Array((data, idx, _, __, x, y) => {
      let { r, g, b } = this.getPixel(x, y);
      const red = (r / 255) ** (1 / normalizedvalue) * 255;
      const green = (g / 255) ** (1 / normalizedvalue) * 255;
      const blue = (b / 255) ** (1 / normalizedvalue) * 255;
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
  white(val) {
    const dst = this.formatUint8Array((data, idx, _, __, x, y) => {
      const { r, g, b } = this.getPixel(x, y);
      const hsv = rgbToHsv(r, g, b);
      hsv.v = Math.min(1, Math.max(0, hsv.v + val / 100));
      const newColor = hsvToRgb(hsv.h, hsv.s, hsv.v);
      data[idx] = newColor.r;
      ++idx;
      data[idx] = newColor.g;
      ++idx;
      data[idx] = newColor.b;
      return data;
    });
    return dst;
  }
  black(val) {
    const normalizedvalue = (val + 100) / 100;
    const dst = this.formatUint8Array((data, idx, _, __, x, y) => {
      let { r, g, b } = this.getPixel(x, y);
      const red = r / 255 * normalizedvalue * 255;
      const green = g / 255 * normalizedvalue * 255;
      const blue = b / 255 * normalizedvalue * 255;
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
  // tint
  tint(value) {
    const dst = this.formatUint8Array((data, idx, _, __, x, y) => {
      const { r, b } = this.getPixel(x, y);
      let { g } = this.getPixel(x, y);
      const green = g + value;
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
  //temperature
  temperature(value) {
    const dst = this.formatUint8Array((data, idx, _, __, x, y) => {
      let { r, b } = this.getPixel(x, y);
      const { g } = this.getPixel(x, y);
      let red = r;
      let blue = b;
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
  saturationRGB(value) {
    const saturationCorrection = value * -0.01;
    const dst = this.formatUint8Array((data, idx, _, __, x, y) => {
      let { r, g, b } = this.getPixel(x, y);
      const max = Math.max(r, g, b);
      if (r !== max)
        r += (max - r) * saturationCorrection;
      if (g !== max)
        g += (max - g) * saturationCorrection;
      if (b !== max)
        b += (max - b) * saturationCorrection;
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
  // Detail
  contrast(value) {
    const contrastFactor = ((value + 100) / 100) ** 2;
    const dst = this.formatUint8Array((data, idx, _, __, x, y) => {
      let { r, g, b } = this.getPixel(x, y);
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
  render(cvs) {
    cvs.width = this.w;
    cvs.height = this.h;
    const context = cvs.getContext("2d");
    if (context) {
      context.putImageData(this.toImageData(context), 0, 0);
    } else {
      console.error("Canvas 2D context not available.");
    }
  }
  static fromImage(img, cvs) {
    const w = img.width;
    const h = img.height;
    cvs.width = w;
    cvs.height = h;
    const ctx = cvs.getContext("2d", { willReadFrequently: true });
    if (ctx) {
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, w, h);
      const uint8Array = new Uint8Array(imgData.data);
      const newImage = new _RGBAImage(w, h, uint8Array);
      return newImage;
    }
    console.error("Canvas 2D context not available.");
    return new _RGBAImage(0, 0);
  }
};

// src/core/canvasImageEdit.ts
var CanvasImageEdit = class {
  constructor(imageSrc) {
    this.result = void 0;
    this.image = new Image();
    this.image.src = imageSrc;
    this.image.setAttribute("crossOrigin", "anonymous");
  }
  ImageLoader(cvs, maxEdge) {
    const that = this;
    this.image.onload = function() {
      const inImg = RGBAImage.fromImage(that.image, cvs);
      that.result = inImg.resize_longedge(maxEdge || 640);
      that.result.render(cvs);
      const event = new Event("imageloaded");
      document.dispatchEvent(event);
    };
  }
};
var canvasImageEdit_default = CanvasImageEdit;
export {
  canvasImageEdit_default as CanvasImageEdit
};
