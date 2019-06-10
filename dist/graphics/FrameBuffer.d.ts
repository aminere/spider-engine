import { Color } from "./Color";
export declare class FrameBuffer {
    width: number;
    height: number;
    data: Uint8Array;
    private setPixelInternal;
    setPixel(x: number, y: number, color: Color): void;
    constructor(w: number, h: number, rgba: boolean);
    private setPixelRGB;
    private setPixelRGBA;
}
