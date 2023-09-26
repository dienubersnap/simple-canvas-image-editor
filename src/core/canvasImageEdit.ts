import { RGBAImage } from "../lib/color.ts";
class CanvasImageEdit {
  private image: HTMLImageElement;
  public result: RGBAImage | undefined

  constructor(imageSrc: string) {
    this.result = undefined;
    this.image = new Image();
    this.image.src = imageSrc;
    this.image.setAttribute('crossOrigin', 'anonymous');
  }

  public ImageLoader(cvs: HTMLCanvasElement, maxEdge?: number): void {
    const that = this;
    this.image.onload = function () {
      const inImg = RGBAImage.fromImage(that.image, cvs)
      that.result = inImg.resize_longedge(maxEdge || 640)
      that.result.render(cvs)

      // Dispatch a custom event
      const event = new Event("imageloaded")
      document.dispatchEvent(event)
    }
  }

}

export default CanvasImageEdit;
