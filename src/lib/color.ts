/* eslint-disable max-classes-per-file */
/* eslint-disable no-plusplus */

import Calculate from './calculate';
import { hsvToRgb, rgbToHsv } from './convert';
import cv, { Mat } from "opencv-ts";

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
  imageData: ImageData;

  constructor(w: number, h: number, data?: Uint8Array, imageData? : ImageData) {
    this.type = 'RGBAImage';
    this.w = w;
    this.h = h;
    this.imageData = new ImageData(w, h)
    this.data = new Uint8Array(w * h * 4);
    if (data) {
      this.data.set(data);
    }
    if (imageData) {
      this.imageData = imageData
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

  convolution(kernel: number[][]) {
    const kRows: number = kernel.length;
    const kCols: number = kernel[0].length;
    const rowEnd: number = Math.floor(kRows / 2);
    const colEnd: number = Math.floor(kCols / 2);
    const rowIni: number = -rowEnd;
    const colIni: number = -colEnd;
    const width: number = this.w;
    const height: number = this.h;

    let weight: number;
    let rSum: number;
    let gSum: number;
    let bSum: number;
    let ri: number;
    let gi: number;
    let bi: number;
    let xi: number;
    let yi: number;
    let idxi: number;

    const dst = this.formatUint8Array((data, idx, _, __, x, y) => {
      const pixel: number = (y * width + x) * 4;
      bSum = 0;
      gSum = 0;
      rSum = 0;

      for (let row: number = rowIni; row <= rowEnd; row++) {
        for (let col: number = colIni; col <= colEnd; col++) {
          xi = x + col;
          yi = y + row;
          weight = kernel[row + rowEnd][col + colEnd];
          idxi = Calculate.getPixelIndex(xi, yi, width, height);

          if (idxi === -1) {
            bi = 0;
            gi = 0;
            ri = 0;
          } else {
            ri = this.data[idxi + 0];
            gi = this.data[idxi + 1];
            bi = this.data[idxi + 2];
          }

          rSum += weight * ri;
          gSum += weight * gi;
          bSum += weight * bi;
        }
      }

      if (rSum < 0) {
        rSum = 0;
      }

      if (gSum < 0) {
        gSum = 0;
      }

      if (bSum < 0) {
        bSum = 0;
      }

      if (rSum > 255) {
        rSum = 255;
      }

      if (gSum > 255) {
        gSum = 255;
      }

      if (bSum > 255) {
        bSum = 255;
      }

      data[pixel + 0] = rSum;
      data[pixel + 1] = gSum;
      data[pixel + 2] = bSum;

      return data;
    });
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

  // utility

  calculateBrightness(r: number, g: number, b: number) {
    //  Calculate brightness as the weighted sum of color channels
    let brightness = 0.299 * r + 0.587 * g + 0.114 * b;
    return brightness;
  }

  clamp = (num: number, min: number, max: number) =>
    Math.min(Math.max(num, min), max);

  isWhite(r: number, g: number, b: number) {
    const treshold = 200;
    if (r >= treshold && g >= treshold && b >= treshold) {
      return true;
    }

    return false;
  }

  isBlacks(r: number, g: number, b: number) {
    const treshold = 60;
    if (r <= treshold && g <= treshold && b <= treshold) {
      return true;
    }

    return false;
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

  brightness(value: number, canvas: HTMLCanvasElement) {
    let src = cv.matFromImageData(this.imageData)
    let _dst:Mat = new cv.Mat()
    let alpha = 1 + value / 200;
    let beta = 0;
    cv.convertScaleAbs(src, _dst, alpha, beta)
    // const dst = new RGBAImage(_dst.cols, _dst.rows, _dst.data)
    
    const dst = this.formatUint8Array((data, idx, _, __, x, y) => {
      data[idx] = _dst.data[idx];
      ++idx;
      data[idx] = _dst.data[idx];
      ++idx;
      data[idx] = _dst.data[idx];

      return data;
    })
    return dst
    // cv.imshow(canvas, _dst)
  }

  hightlight(value: number) {
    value /= 100
    let src = cv.matFromImageData(this.imageData)
    let _dst: Mat = new cv.Mat();
    cv.cvtColor(src, _dst, cv.COLOR_BGR2Lab);
    console.log(_dst.data , "dst")
    // Split the LAB image into L, A, and B channels
    let channels = new cv.MatVector();
    cv.split(_dst, channels);
    let l = channels.get(0);
    let a = channels.get(1)
    let b = channels.get(2)
    let newTest = cv.matFromArray(src.rows, src.cols, cv.CV_8UC1, [l,a, b] as unknown as number[])
    console.log(newTest)
    // Adjust the L channel (lightness) to change highlights
    for (let i = 0; i < l.rows; i++) {
      for (let j = 0; j < l.cols; j++) {
        l.data[i * l.cols + j] = Math.min(255, Math.max(0, l.data[i * l.cols + j] * (1 + value)));
      }
    }
    
    // Convert the LAB image back to BGR color space
    let adjustedImage = new cv.Mat()
    // Merge the LAB channels back to form the adjusted LAB image
    cv.merge(channels, adjustedImage);

    let labToBgr = new cv.Mat()
;
    cv.cvtColor(adjustedImage, labToBgr, cv.COLOR_Lab2BGR);
    const dst = new RGBAImage(this.w, this.h, labToBgr.data.slice())
    return dst
  }

  shadow(value: number) {
    const dst = this.formatUint8Array((data, idx, _, __, x, y) => {
      let { r, g, b } = this.getPixel(x, y);
      const maxFactor = 200;

      const brightness = this.calculateBrightness(r, g, b);
      if (brightness < maxFactor) {
        //const adjustedBrightness = brightness + value * (brightness - 255);
        // const pixelNew = Math.max(adjustedBrightness, 255);
        r = this.clamp(r - value, 0, 255);
        g = this.clamp(g - value, 0, 255);
        b = this.clamp(b - value, 0, 255);
      }

      data[idx] = r;
      ++idx;
      data[idx] = g;
      ++idx;
      data[idx] = b;

      return data;
    });
    return dst;
  }

  white(value: number) {
    const dst = this.formatUint8Array((data, idx, _, __, x, y) => {
      let { r, g, b } = this.getPixel(x, y);
      let luminance = this.calculateBrightness(r, g, b);

      if (luminance > 200) {
        if (this.isWhite(r, g, b)) {
          r = this.clamp(luminance + value, 0, 255);
          g = this.clamp(luminance + value, 0, 255);
          b = this.clamp(luminance + value, 0, 255);
        }
      }

      data[idx] = r;
      ++idx;
      data[idx] = g;
      ++idx;
      data[idx] = b;
      return data;
    });
    return dst;
  }

  black(value: number) {
    const dst = this.formatUint8Array((data, idx, _, __, x, y) => {
      let { r, g, b } = this.getPixel(x, y);

      let luminance = this.calculateBrightness(r, g, b);
      if (luminance < 60) {
        if (this.isBlacks(r, g, b)) {
          r = this.clamp(luminance - value, 0, 255);
          g = this.clamp(luminance - value, 0, 255);
          b = this.clamp(luminance - value, 0, 255);
        }
      }

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
      const green = g - value;
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
    let src = cv.matFromImageData(this.imageData)
    let _dst: Mat = new cv.Mat();
    let alpha = 1 + (value / 100) 
    let beta = 128 - alpha * 128
    
    console.log(alpha, beta, "value")
    cv.convertScaleAbs(src, _dst, alpha, beta)
    const dst = new RGBAImage(this.w, this.h, _dst.data.slice())
    // src.delete()
    // _dst.delete()
    return dst;
  }


  hue(value: number) {

    const dst = this.formatUint8Array((data, idx, _, __, x, y) => {
      let { r, g, b } = this.getPixel(x, y);

      let hsv = rgbToHsv(r, g, b);
      hsv.h *= 100;
      hsv.h += value;
      hsv.h = hsv.h % 100;
      hsv.h /= 100;
      let newData = hsvToRgb(hsv.h, hsv.s, hsv.v);

      data[idx] = newData.r;
      ++idx;
      data[idx] = newData.g;
      ++idx;
      data[idx] = newData.b;

      return data;
    });
    return dst;
  }

  gamma(value: number) {
    value = Math.pow(2, value / 30.5);
    const dst = this.formatUint8Array((data, idx, _, __, x, y) => {
      let { r, g, b } = this.getPixel(x, y);

      // Apply gamma adjustment to each color channel
      r = Math.pow(r / 255, value) * 255;
      g = Math.pow(g / 255, value) * 255;
      b = Math.pow(b / 255, value) * 255;

      // Ensure the color values stay within the 0-255 range
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

  //value between 0 - 100
  sepia(value: number) {
    const normalizedvalue = value / 100;

    const dst = this.formatUint8Array((data, idx, _, __, x, y) => {
      let { r, g, b } = this.getPixel(x, y);

      // Apply sepia tone effect to the RGB values
      r = Math.min(
        255,
        r * (1 - 0.607 * normalizedvalue) +
          g * (0.769 * normalizedvalue) +
          b * (0.189 * normalizedvalue),
      );
      g = Math.min(
        255,
        r * (0.349 * normalizedvalue) +
          g * (1 - 0.314 * normalizedvalue) +
          b * (0.168 * normalizedvalue),
      );
      b = Math.min(
        255,
        r * (0.272 * normalizedvalue) +
          g * (0.534 * normalizedvalue) +
          b * (1 - 0.869 * normalizedvalue),
      );

      data[idx] = r;
      ++idx;
      data[idx] = g;
      ++idx;
      data[idx] = b;

      return data;
    });
    return dst;
  }

  //value 0 - 100
  noise(value: number) {
    const adjust = Math.abs(value) * 2.55;

    const dst = this.formatUint8Array((data, idx, _, __, x, y) => {
      let { r, g, b } = this.getPixel(x, y);

      // Generate random noise within the specified range for each channel
      const rand = Calculate.randomRange(adjust * -1, adjust);

      // Apply noise to each color channel
      r += rand;
      g += rand;
      b += rand;

      // Ensure the color values stay within the 0-255 range
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

  //value between 0 - 100
  clip(value: number) {
    const adjust = Math.abs(value) * 2.55;

    const dst = this.formatUint8Array((data, idx, _, __, x, y) => {
      let { r, g, b } = this.getPixel(x, y);
      // Clip the color values based on the adjustment factor
      if (r > 255 - adjust) {
        r = 255;
      } else if (r < adjust) {
        r = 0;
      }

      if (g > 255 - adjust) {
        g = 255;
      } else if (g < adjust) {
        g = 0;
      }

      if (b > 255 - adjust) {
        b = 255;
      } else if (b < adjust) {
        b = 0;
      }

      data[idx] = r;
      ++idx;
      data[idx] = g;
      ++idx;
      data[idx] = b;

      return data;
    });
    return dst;
  }
  

  clarity(value: number) {
    let clarityKernel: number[][];
    value /= 80;
    if (value === 0) {
      // If the value is 0, no change to the image
      clarityKernel = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];
    } else if (value > 0) {
      // If the value is positive, apply clarity
      clarityKernel = [
        [0, -0.5, 0 + Math.abs(value) / 5],
        [-0.5 + Math.abs(value) / 50, 2.9, -0.5 + Math.abs(value) / 50],
        [0, -0.5, 0],
      ];
    } else {
      // If the value is negative, apply smoothing (blurring)
      clarityKernel = [
        [0.1, 0.1, 0.1],
        [0.1, 0.19 + Math.abs(value) / 50, 0.1],
        [0.1, 0.1, 0.1],
      ];
    }

    const dst = this.convolution(clarityKernel);
    return dst;
  }
  sharpness(value: number) {
    let sharpenKernel: number[][];
    switch (true) {
      case value < -10:
        // If the value is minus, apply blurring
        sharpenKernel = [
          [1 / 9, 1 / 9, 1 / 9],
          [1 / 9, 1 / 9, 1 / 9],
          [1 / 9, 1 / 9, 1 / 9],
        ];
        break;
      case value < -20:
        sharpenKernel = [
          [1 / 8, 1 / 4, 1 / 8],
          [1 / 4, 1 / 2, 1 / 4],
          [1 / 8, 1 / 4, 1 / 8],
        ];
        break;
      case value > 0 && value <= 30:
        // If the value is positive, apply sharpening
        sharpenKernel = [
          [0, -0.5, 0],
          [-0.5, 3, -0.5],
          [0, -0.5, 0],
        ];
        break;
      case value > 30 && value <= 70:
        sharpenKernel = [
          [0, -1, 0],
          [-1, 5, -1],
          [0, -1, 0],
        ];
        break;
      case value > 70:
        sharpenKernel = [
          [-1, -1, -1],
          [-1, 9, -1],
          [-1, -1, -1],
        ];
        break;
      default:
        // If the value is negative, apply smoothing (blurring)
        sharpenKernel = [
          [0, 0, 0],
          [0, 1, 0],
          [0, 0, 0],
        ];
        break;
    }

    let dst: RGBAImage = this.convolution(sharpenKernel);

    return dst;
  }

  render(cvs: HTMLCanvasElement) {
    // eslint-disable-next-line no-param-reassign
    cvs.width = this.w;
    // eslint-disable-next-line no-param-reassign
    cvs.height = this.h;
    const context = cvs.getContext('2d', {
      willReadFrequently: true,
    });
    if (context) {
      context.putImageData(this.toImageData(context), 0, 0);
    } else {
      // eslint-disable-next-line no-console
      console.error('Canvas 2D context not available.');
    }
  }

  static fromImage(img: any, cvs: HTMLCanvasElement): RGBAImage {
    const w = img.width;
    const h = img.height;
    // eslint-disable-next-line no-param-reassign
    cvs.width = w;
    // eslint-disable-next-line no-param-reassign
    cvs.height = h;

    const ctx = cvs.getContext('2d', {
      willReadFrequently: true,
      alpha: false,
    });
    if (ctx) {
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, w, h);
      const uint8Array = new Uint8Array(imgData.data);
      const newImage = new RGBAImage(w, h, uint8Array, imgData);
      return newImage;
    }
    // eslint-disable-next-line no-console
    console.error('Canvas 2D context not available.');
    return new RGBAImage(0, 0);
  }
}
