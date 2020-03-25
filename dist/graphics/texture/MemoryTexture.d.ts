import { Texture } from "./Texture";
export declare class MemoryTexture extends Texture {
    private _data;
    private _width;
    private _height;
    private _internalFormat;
    private _format;
    private _type;
    private _isDirty;
    constructor(data: Float32Array, width: number, height: number, internalFormat: number, format: number, type: number);
    getWidth(): number;
    getHeight(): number;
    begin(stage: number): boolean;
    dirtify(): void;
    private updateTexture;
}
