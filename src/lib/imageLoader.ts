//this file is not used yet

import { RGBAImage } from "./color.ts";

// Define the ImageLoader class
export default class ImageLoader {
    private maxEdge: number
  
    public result: RGBAImage | undefined
  
    constructor(maxWidth?: number) {
      this.maxEdge = maxWidth || 640
      this.result = undefined
    }
  
    // Load an image with the specified canvas object
    public loadImage(imgSrc: string, cvs: HTMLCanvasElement): void {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const that = this
      // Create an Image object
      const img = new Image()
  
      // eslint-disable-next-line func-names
      img.onload = function () {
        const inImg = RGBAImage.fromImage(img, cvs)
        that.result = inImg.resize_longedge(that.maxEdge)
        that.result.render(cvs)
  
        // Dispatch a custom event
        const event = new Event("imageloaded")
        document.dispatchEvent(event)
      }
  
      img.src = imgSrc
    }
  }