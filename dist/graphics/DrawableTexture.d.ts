import { Texture } from "./Texture";
import { Color } from "./Color";
export declare class DrawableTexture extends Texture {
    set rgba(rgba: boolean);
    get rgba(): boolean;
    set width(width: number);
    set height(height: number);
    set data(data: Uint8Array);
    get data(): Uint8Array;
    private _width;
    private _height;
    private _rgba;
    private _filtering;
    private _data;
    private _structureDirty;
    private _pixelsDirty;
    private _bytesPerPixel;
    getWidth(): number;
    getHeight(): number;
    begin(stage: number): boolean;
    setPixel(x: number, y: number, color: Color): void;
    private updateStructure;
    private uploadTexturePixels;
}
