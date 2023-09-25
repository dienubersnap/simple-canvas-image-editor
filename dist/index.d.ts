declare class CanvasImageEdit {
    private canvas;
    private context;
    private targetComponent;
    private image;
    constructor(imageSrc: string, targetID: string, targetCanvasID: string);
    Adjustment(bright: number, saturate: number): CanvasImageEdit;
    render(): CanvasImageEdit;
}

export { CanvasImageEdit };
