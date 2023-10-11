import { RGBAImage } from '../lib/color.ts';
class CanvasImageEdit {
  private image: HTMLImageElement;
  public result: RGBAImage | undefined;

  constructor() {
    this.image = new Image();
  }

  public ImageLoader(
    cvs: HTMLCanvasElement,
    imageSrc: string, // Image base64 or url
    maxEdge?: number,
  ): void {
    const that = this;
    let image = new Image();
    image.src = imageSrc;
    image.setAttribute('crossOrigin', 'anonymous');
    image.onload = function () {
      console.log(image);
      const inImg = RGBAImage.fromImage(image, cvs);
      that.result = inImg.resize_longedge(maxEdge || 640);
      that.result.render(cvs);

      // Dispatch a custom event
      const event = new Event('imageloaded');
      document.dispatchEvent(event);
    };
  }
}

export default CanvasImageEdit;
