// src/lib/filter.ts
var Filter = class {
  static Brightness({ r, g, b, a }, adjust) {
    adjust = Math.floor(adjust / 100 * 255);
    r = Math.min(255, Math.max(0, r + adjust));
    g = Math.min(255, Math.max(0, g + adjust));
    b = Math.min(255, Math.max(0, b + adjust));
    return { r, g, b, a };
  }
  static Saturation({ r, g, b, a }, adjust) {
    const saturationCorrection = adjust * -0.01;
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
    return { r, g, b, a };
  }
};
var filter_default = Filter;

// src/core/canvasImageEdit.ts
var CanvasImageEdit = class {
  constructor(imageSrc, targetID, targetCanvasID) {
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");
    this.targetComponent = document.getElementById(
      targetID
    );
    this.image = document.getElementById(targetID);
    this.image = new Image();
    this.image.src = imageSrc;
    this.image.setAttribute("crossOrigin", "anonymous");
    this.image.onload = () => {
    };
  }
  Adjustment(bright, saturate) {
    if (this.image.width) {
      this.canvas.width = this.image.width;
      this.canvas.height = this.image.height;
      this.context.drawImage(this.image, 0, 0);
      const imageData = this.context.getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        let newData = filter_default.Brightness({ r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3] }, bright);
        data[i] = newData.r;
        data[i + 1] = newData.g;
        data[i + 2] = newData.b;
        data[i + 3] = newData.a;
      }
      this.context.putImageData(imageData, 0, 0);
      for (let i = 0; i < data.length; i += 4) {
        let newData = filter_default.Saturation({ r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3] }, saturate);
        data[i] = newData.r;
        data[i + 1] = newData.g;
        data[i + 2] = newData.b;
        data[i + 3] = newData.a;
      }
      this.context.putImageData(imageData, 0, 0);
      this.image.src = this.canvas.toDataURL("image/jpeg");
    }
    return this;
  }
  render() {
    if (this.image.width) {
      this.targetComponent.src = this.canvas.toDataURL("image/jpeg");
    }
    return this;
  }
};
var canvasImageEdit_default = CanvasImageEdit;
export {
  canvasImageEdit_default as CanvasImageEdit
};
