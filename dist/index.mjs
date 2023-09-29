// src/lib/calculate.ts
var Calculate = class _Calculate {
  // Calculates the distance between two points.
  // @param [Number] x1 1st point x-coordinate.
  // @param [Number] y1 1st point y-coordinate.
  // @param [Number] x2 2nd point x-coordinate.
  // @param [Number] y2 2nd point y-coordinate.
  // @return [Number] The distance between the two points.
  static distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }
  // Generates a pseudorandom number that lies within the max - mix range. The number can be either 
  // an integer or a float depending on what the user specifies.
  // @param [Number] min The lower bound (inclusive).
  // @param [Number] max The upper bound (inclusive).
  // @param [Boolean] getFloat Return a Float or a rounded Integer?
  // @return [Number] The pseudorandom number, either as a float or integer.
  static randomRange(min, max, getFloat = false) {
    const rand = min + Math.random() * (max - min);
    return getFloat ? parseFloat(rand.toFixed(1)) : Math.round(rand);
  }
  // Calculates the luminance of a single pixel using a special weighted sum.
  // @param [Object] rgba RGBA object describing a single pixel.
  // @return [Number] The luminance value of the pixel.
  static luminance(rgba) {
    return 0.299 * rgba.r + 0.587 * rgba.g + 0.114 * rgba.b;
  }
  // Generates a bezier curve given a start and end point, with control points in between.
  // Can also optionally bound the y values between a low and high bound.
  //
  // This is different than most bezier curve functions because it attempts to construct it in such 
  // a way that we can use it more like a simple input -> output system, or a one-to-one function. 
  // In other words we can provide an input color value, and immediately receive an output modified 
  // color value.
  //
  // Note that, by design, this does not force X values to be in the range [0..255]. This is to
  // generalize the function a bit more. If you give it a starting X value that isn't 0, and/or a
  // ending X value that isn't 255, you may run into problems with your filter!
  //
  // @param [Array] 2-item arrays describing the x, y coordinates of the control points. Minimum two.
  // @param [Number] lowBound (optional) Minimum possible value for any y-value in the curve.
  // @param [Number] highBound (optional) Maximum posisble value for any y-value in the curve.
  // @return [Array] Array whose index represents every x-value between start and end, and value
  //   represents the corresponding y-value.
  static bezier(start, ctrl1, ctrl2, end, lowBound, highBound) {
    let controlPoints;
    if (lowBound == null) {
      lowBound = 0;
    }
    if (highBound == null) {
      highBound = 255;
    }
    if (start[0] instanceof Array) {
      controlPoints = start;
      lowBound = ctrl1;
      highBound = ctrl2;
    } else {
      controlPoints = [start, ctrl1, ctrl2, end];
    }
    if (controlPoints.length < 2) {
      throw "Invalid number of arguments to bezier";
    }
    let bezier = {};
    const lerp = (a, b, t) => a * (1 - t) + b * t;
    const clamp = (a, min, max) => Math.min(Math.max(a, min), max);
    for (let i = 0; i < 1e3; i++) {
      const t = i / 1e3;
      let prev = controlPoints;
      while (prev.length > 1) {
        const next = [];
        for (let j = 0, end1 = prev.length - 2, asc = 0 <= end1; asc ? j <= end1 : j >= end1; asc ? j++ : j--) {
          next.push([
            lerp(prev[j][0], prev[j + 1][0], t),
            lerp(prev[j][1], prev[j + 1][1], t)
          ]);
        }
        prev = next;
      }
      bezier[Math.round(prev[0][0])] = Math.round(clamp(prev[0][1], lowBound, highBound));
    }
    const endX = controlPoints[controlPoints.length - 1][0];
    bezier = _Calculate.missingValues(bezier, endX);
    if (bezier[endX] == null) {
      bezier[endX] = bezier[endX - 1];
    }
    return bezier;
  }
  // Generates a hermite curve given a start and end point, with control points in between.
  // Can also optionally bound the y values between a low and high bound.
  //
  // This is different than most hermite curve functions because it attempts to construct it in such 
  // a way that we can use it more like a simple input -> output system, or a one-to-one function. 
  // In other words we can provide an input color value, and immediately receive an output modified 
  // color value.
  //
  // Note that, by design, this does not force X values to be in the range [0..255]. This is to
  // generalize the function a bit more. If you give it a starting X value that isn't 0, and/or a
  // ending X value that isn't 255, you may run into problems with your filter!
  //
  // @param [Array] 2-item arrays describing the x, y coordinates of the control points. Minimum two.
  // @param [Number] lowBound (optional) Minimum possible value for any y-value in the curve.
  // @param [Number] highBound (optional) Maximum possible value for any y-value in the curve.
  // @return [Array] Array whose index represents every x-value between start and end, and value
  //   represents the corresponding y-value.
  static hermite(controlPoints, lowBound, highBound) {
    if (controlPoints.length < 2) {
      throw "Invalid number of arguments to hermite";
    }
    let ret = {};
    const lerp = (a, b, t) => a * (1 - t) + b * t;
    const add = (a, b, c, d) => [a[0] + b[0] + c[0] + d[0], a[1] + b[1] + c[1] + d[1]];
    const mul = (a, b) => [a[0] * b[0], a[1] * b[1]];
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
    const clamp = (a, min, max) => Math.min(Math.max(a, min), max);
    let count = 0;
    for (let i = 0, end = controlPoints.length - 2, asc = 0 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
      const p0 = controlPoints[i];
      const p1 = controlPoints[i + 1];
      const pointsPerSegment = p1[0] - p0[0];
      let pointsPerStep = 1 / pointsPerSegment;
      if (i === controlPoints.length - 2) {
        pointsPerStep = 1 / (pointsPerSegment - 1);
      }
      let p = i > 0 ? controlPoints[i - 1] : p0;
      const m0 = mul(sub(p1, p), [0.5, 0.5]);
      p = i < controlPoints.length - 2 ? controlPoints[i + 2] : p1;
      const m1 = mul(sub(p, p0), [0.5, 0.5]);
      for (let j = 0, end1 = pointsPerSegment, asc1 = 0 <= end1; asc1 ? j <= end1 : j >= end1; asc1 ? j++ : j--) {
        const t = j * pointsPerStep;
        const fac0 = 2 * t * t * t - 3 * t * t + 1;
        const fac1 = t * t * t - 2 * t * t + t;
        const fac2 = -2 * t * t * t + 3 * t * t;
        const fac3 = t * t * t - t * t;
        const pos = add(mul(p0, [fac0, fac0]), mul(m0, [fac1, fac1]), mul(p1, [fac2, fac2]), mul(m1, [fac3, fac3]));
        ret[Math.round(pos[0])] = Math.round(clamp(pos[1], lowBound, highBound));
        count += 1;
      }
    }
    const endX = controlPoints[controlPoints.length - 1][0];
    ret = _Calculate.missingValues(ret, endX);
    return ret;
  }
  // Calculates possible missing values from a given value array. Note that this returns a copy
  // and does not mutate the original. In case no values are missing the original array is
  // returned as that is convenient.
  //
  // @param [Array] 2-item arrays describing the x, y coordinates of the control points.
  // @param [Number] end x value of the array (maximum)
  // @return [Array] Array whose index represents every x-value between start and end, and value
  //   represents the corresponding y-value.
  static missingValues(values, endX) {
    if (Object.keys(values).length < endX + 1) {
      const ret = {};
      for (let i = 0, end = endX, asc = 0 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
        if (values[i] != null) {
          ret[i] = values[i];
        } else {
          var rightCoord = [0, 0];
          const leftCoord = [i - 1, ret[i - 1]];
          for (let j = i, end1 = endX, asc1 = i <= end1; asc1 ? j <= end1 : j >= end1; asc1 ? j++ : j--) {
            if (values[j] != null) {
              rightCoord = [j, values[j]];
              break;
            }
          }
          ret[i] = leftCoord[1] + (rightCoord[1] - leftCoord[1]) / (rightCoord[0] - leftCoord[0]) * (i - leftCoord[0]);
        }
      }
      return ret;
    }
    return values;
  }
  static convolution(inputData, kernel, width, height) {
    const newData = Buffer.from(inputData);
    const kRows = kernel.length;
    const kCols = kernel[0].length;
    const rowEnd = Math.floor(kRows / 2);
    const colEnd = Math.floor(kCols / 2);
    const rowIni = -rowEnd;
    const colIni = -colEnd;
    let weight;
    let rSum;
    let gSum;
    let bSum;
    let ri;
    let gi;
    let bi;
    let xi;
    let yi;
    let idxi;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel = (y * width + x) * 4;
        bSum = 0;
        gSum = 0;
        rSum = 0;
        for (let row = rowIni; row <= rowEnd; row++) {
          for (let col = colIni; col <= colEnd; col++) {
            xi = x + col;
            yi = y + row;
            weight = kernel[row + rowEnd][col + colEnd];
            idxi = _Calculate.getPixelIndex(xi, yi, width, height);
            if (idxi === -1) {
              bi = 0;
              gi = 0;
              ri = 0;
            } else {
              ri = inputData[idxi + 0];
              gi = inputData[idxi + 1];
              bi = inputData[idxi + 2];
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
        newData[pixel + 0] = rSum;
        newData[pixel + 1] = gSum;
        newData[pixel + 2] = bSum;
      }
    }
    return newData;
  }
  static getPixelIndex(x, y, width, height) {
    if (x < 0 || x >= width || y < 0 || y >= height) {
      return -1;
    }
    return (y * width + x) * 4;
  }
};
var calculate_default = Calculate;

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
  sharpness(value) {
    let sharpenKernel;
    if (value === 0) {
      sharpenKernel = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0]
      ];
    } else if (value > 0) {
      const sharpeningFactor = value / 400;
      sharpenKernel = [
        [-1, -1, -1],
        [-1, 9 + sharpeningFactor, -1],
        [-1, -1, -1]
      ];
    } else {
      const smoothingFactor = Math.abs(value) / 400;
      sharpenKernel = [
        [0, 1 - smoothingFactor, 0],
        [0, 0, 0],
        [0 + smoothingFactor, 0, 0]
      ];
    }
    const kRows = sharpenKernel.length;
    const kCols = sharpenKernel[0].length;
    const rowEnd = Math.floor(kRows / 2);
    const colEnd = Math.floor(kCols / 2);
    const rowIni = -rowEnd;
    const colIni = -colEnd;
    const width = this.w;
    const height = this.h;
    let weight;
    let rSum;
    let gSum;
    let bSum;
    let ri;
    let gi;
    let bi;
    let xi;
    let yi;
    let idxi;
    const dst = this.formatUint8Array((data, idx, _, __, x, y) => {
      let { r, g, b } = this.getPixel(x, y);
      const pixel = (y * width + x) * 4;
      bSum = 0;
      gSum = 0;
      rSum = 0;
      for (let row = rowIni; row <= rowEnd; row++) {
        for (let col = colIni; col <= colEnd; col++) {
          xi = x + col;
          yi = y + row;
          weight = sharpenKernel[row + rowEnd][col + colEnd];
          idxi = calculate_default.getPixelIndex(xi, yi, width, height);
          if (idx === -1) {
            bi = 0;
            gi = 0;
            ri = 0;
          } else {
            ri = this.data[idx + 0];
            gi = this.data[idx + 1];
            bi = this.data[idx + 2];
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
