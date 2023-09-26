/* eslint-disable max-classes-per-file */
/* eslint-disable no-plusplus */

import { hsvToRgb, rgbToHsv } from './convert';

class Color {
  r: number;

  g: number;

  b: number;

  a: number;

  constructor(r: number, g: number, b: number, a: number) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  mul(factor: number): Color {
    return new Color(
      this.r * factor,
      this.g * factor,
      this.b * factor,
      this.a * factor,
    );
  }

  add(other: Color): Color {
    return new Color(
      this.r + other.r,
      this.g + other.g,
      this.b + other.b,
      this.a + other.a,
    );
  }

  clamp() {
    this.r = Math.min(255, Math.max(0, this.r));
    this.g = Math.min(255, Math.max(0, this.g));
    this.b = Math.min(255, Math.max(0, this.b));
    this.a = Math.min(255, Math.max(0, this.a));
  }
}

export class RGBAImage {
  type: string;

  w: number;

  h: number;

  data: Uint8Array;

  constructor(w: number, h: number, data?: Uint8Array) {
    this.type = 'RGBAImage';
    this.w = w;
    this.h = h;
    this.data = new Uint8Array(w * h * 4);
    if (data) {
      this.data.set(data);
    }
  }

  getPixel(x: number, y: number): Color {
    const idx = (y * this.w + x) * 4;
    return new Color(
      this.data[idx],
      this.data[idx + 1],
      this.data[idx + 2],
      this.data[idx + 3],
    );
  }

  sample(x: number, y: number): Color {
    const ty = Math.floor(y);
    const dy = Math.ceil(y);
    const lx = Math.floor(x);
    const rx = Math.ceil(x);
    const fx = x - lx;
    const fy = y - ty;

    const c = this.getPixel(lx, ty)
      .mul((1 - fy) * (1 - fx))
      .add(this.getPixel(lx, dy).mul(fy * (1 - fx)))
      .add(this.getPixel(rx, ty).mul((1 - fy) * fx))
      .add(this.getPixel(rx, dy).mul(fy * fx));

    c.clamp();

    return c;
  }

  setPixel(x: number, y: number, c: Color) {
    const idx = (y * this.w + x) * 4;
    this.data[idx] = c.r;
    this.data[idx + 1] = c.g;
    this.data[idx + 2] = c.b;
    this.data[idx + 3] = c.a;
  }

  apply(f: (color: Color) => Color): this {
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        this.setPixel(x, y, f(this.getPixel(x, y)));
      }
    }
    return this;
  }

  formatUint8Array(
    f: (
      data: Uint8Array,
      idx: number,
      w: number,
      h: number,
      x: number,
      y: number,
    ) => void,
  ): RGBAImage {
    const dst = new RGBAImage(this.w, this.h, this.data.slice());
    const { data } = dst;
    for (let y = 0, idx = 0; y < this.h; ++y) {
      for (let x = 0; x < this.w; ++x, idx += 4) {
        f(data, idx, this.w, this.h, x, y);
      }
    }

    return dst;
  }

  resize(w: number, h: number): RGBAImage {
    const iw = this.w;
    const ih = this.h;
    const dst = new RGBAImage(w, h);
    const ystep = 1.0 / (h - 1);
    const xstep = 1.0 / (w - 1);
    for (let i = 0; i < h; i++) {
      const y = i * ystep;
      for (let j = 0; j < w; j++) {
        const x = j * xstep;
        dst.setPixel(j, i, this.sample(x * (iw - 1), y * (ih - 1)));
      }
    }
    return dst;
  }

  resize_longedge(L: number): this {
    let nw;
    let nh;
    if (this.w > this.h && this.w > L) {
      nw = L;
      nh = Math.round((L / this.w) * this.h);
      this.resize(nw, nh);
    }
    if (this.h > L) {
      nh = L;
      nw = Math.round((L / this.h) * this.w);
      this.resize(nw, nh);
    }
    return this;
  }

  uploadTexture(ctx: WebGLRenderingContext, texId: WebGLTexture) {
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
      this.data,
    );
  }

  toImageData(ctx: CanvasRenderingContext2D): ImageData {
    const imgData = ctx.createImageData(this.w, this.h);
    imgData.data.set(this.data);
    return imgData;
  }

  //image adjustment filter
  exposure(value: number) {
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

  brightness(value: number) {
    const brightnessFactor = Math.floor((value / 100) * 255);

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

  shadow(value: number) {
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

  white(val: number) {
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

  black(val: number) {
    const normalizedvalue = (val + 100) / 100;

    const dst = this.formatUint8Array((data, idx, _, __, x, y) => {
      let { r, g, b } = this.getPixel(x, y);

      const red = (r / 255) * normalizedvalue * 255;
      const green = (g / 255) * normalizedvalue * 255;
      const blue = (b / 255) * normalizedvalue * 255;
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
  tint(value: number) {
    const dst = this.formatUint8Array((data, idx, _, __, x, y) => {
      const { r, b } = this.getPixel(x, y);
      let { g } = this.getPixel(x, y);
      const green = g + value
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
  temperature(value: number) {
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

  saturationRGB(value: number) {
    const saturationCorrection = value * -0.01;

    const dst = this.formatUint8Array((data, idx, _, __, x, y) => {
      let { r, g, b } = this.getPixel(x, y);

      const max = Math.max(r, g, b);
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

  // Detail
  contrast(value: number) {
    const contrastFactor = ((value + 100) / 100) ** 2;

    const dst = this.formatUint8Array((data, idx, _, __, x, y) => {
      let { r, g, b } = this.getPixel(x, y);

      // Apply contrast adjustment to each color channel
      r = (r / 255 - 0.5) * contrastFactor + 0.5;
      g = (g / 255 - 0.5) * contrastFactor + 0.5;
      b = (b / 255 - 0.5) * contrastFactor + 0.5;

      // Ensure the color values stay within the 0-255 range
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

  render(cvs: HTMLCanvasElement) {
    // eslint-disable-next-line no-param-reassign
    cvs.width = this.w;
    // eslint-disable-next-line no-param-reassign
    cvs.height = this.h;
    const context = cvs.getContext('2d');
    if (context) {
      context.putImageData(this.toImageData(context), 0, 0);
    } else {
      // eslint-disable-next-line no-console
      console.error('Canvas 2D context not available.');
    }
  }

  static fromImage(img: HTMLImageElement, cvs: HTMLCanvasElement): RGBAImage {
    const w = img.width;
    const h = img.height;
    // eslint-disable-next-line no-param-reassign
    cvs.width = w;
    // eslint-disable-next-line no-param-reassign
    cvs.height = h;

    const ctx = cvs.getContext('2d', { willReadFrequently: true });
    if (ctx) {
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, w, h);
      const uint8Array = new Uint8Array(imgData.data);
      const newImage = new RGBAImage(w, h, uint8Array);
      return newImage;
    }
    // eslint-disable-next-line no-console
    console.error('Canvas 2D context not available.');
    return new RGBAImage(0, 0);
  }
}
