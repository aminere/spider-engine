import { Color } from "./Color";

export class FrameBuffer {
    width: number;
    height: number;
    data: Uint8Array;

    private setPixelInternal: (x: number, y: number, color: Color) => void;

    setPixel(x: number, y: number, color: Color) {
        this.setPixelInternal(x, y, color);
    }

    constructor(w: number, h: number, rgba: boolean) {
        this.width = w;
        this.height = h;
        let bytesPerPixel = rgba ? 4 : 3;
        let length = w * h * bytesPerPixel;
        this.data = new Uint8Array(length);
        this.setPixelInternal = rgba ? this.setPixelRGBA : this.setPixelRGB;
    }    

    private setPixelRGB(x: number, y: number, color: Color) {
        let index = (this.width * 3 * y) + (x * 3);
        this.data[index + 0] = color.r * 255;
        this.data[index + 1] = color.g * 255;
        this.data[index + 2] = color.b * 255;
    }

    private setPixelRGBA(x: number, y: number, color: Color) {
        let index = (this.width * 4 * y) + (x * 4);
        this.data[index + 0] = color.r * 255;
        this.data[index + 1] = color.g * 255;
        this.data[index + 2] = color.b * 255;
        this.data[index + 3] = color.a * 255;
    }
}
