declare class Color {
    r: number;
    g: number;
    b: number;
    a: number;
    constructor(r: number, g: number, b: number, a: number);
    mul(factor: number): Color;
    add(other: Color): Color;
    clamp(): void;
}
declare class RGBAImage {
    type: string;
    w: number;
    h: number;
    data: Uint8Array;
    constructor(w: number, h: number, data?: Uint8Array);
    getPixel(x: number, y: number): Color;
    sample(x: number, y: number): Color;
    setPixel(x: number, y: number, c: Color): void;
    apply(f: (color: Color) => Color): this;
    formatUint8Array(f: (data: Uint8Array, idx: number, w: number, h: number, x: number, y: number) => void): RGBAImage;
    resize(w: number, h: number): RGBAImage;
    resize_longedge(L: number): this;
    uploadTexture(ctx: WebGLRenderingContext, texId: WebGLTexture): void;
    toImageData(ctx: CanvasRenderingContext2D): ImageData;
    exposure(value: number): RGBAImage;
    brightness(value: number): RGBAImage;
    shadow(value: number): RGBAImage;
    white(val: number): RGBAImage;
    black(val: number): RGBAImage;
    tint(value: number): RGBAImage;
    temperature(value: number): RGBAImage;
    saturationRGB(value: number): RGBAImage;
    contrast(value: number): RGBAImage;
    sharpness(value: number): RGBAImage;
    render(cvs: HTMLCanvasElement): void;
    static fromImage(img: HTMLImageElement, cvs: HTMLCanvasElement): RGBAImage;
}

declare class CanvasImageEdit {
    private image;
    result: RGBAImage | undefined;
    constructor(imageSrc: string);
    ImageLoader(cvs: HTMLCanvasElement, maxEdge?: number): void;
}

export { CanvasImageEdit };
