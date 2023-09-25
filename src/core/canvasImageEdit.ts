import Filter from "../lib/filter.ts";
class CanvasImageEdit {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private targetComponent: HTMLImageElement;
  private image: HTMLImageElement;

  constructor(imageSrc: string, targetID: string, targetCanvasID: string) {
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d')!;
    this.targetComponent = document.getElementById(
      targetID,
    ) as HTMLImageElement;
    // for image target
    this.image = document.getElementById(targetID) as HTMLImageElement;
    this.image = new Image();
    this.image.src = imageSrc;
    this.image.setAttribute('crossOrigin', 'anonymous');
    this.image.onload = () => {
    };
  }

  
  public Adjustment(bright: number, saturate: number): CanvasImageEdit {
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
        let newData = Filter.Brightness({r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3]}, bright)
        data[i] = newData.r
        data[i + 1] = newData.g
        data[i + 2] = newData.b
        data[i + 3] = newData.a
      }

      this.context.putImageData(imageData, 0, 0);
      for (let i = 0; i < data.length; i += 4) {
        let newData = Filter.Saturation({r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3]}, saturate)
        data[i] = newData.r
        data[i + 1] = newData.g
        data[i + 2] = newData.b
        data[i + 3] = newData.a
      }
      this.context.putImageData(imageData, 0, 0)
      this.image.src = this.canvas.toDataURL("image/jpeg")
    }
    return this
  }

  public render(): CanvasImageEdit {
    
    if (this.image.width) {
      this.targetComponent.src = this.canvas.toDataURL('image/jpeg');
    }
    
    return this;
  }
}

export default CanvasImageEdit;
