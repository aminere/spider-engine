import { Texture } from "./Texture";
import { TextureFiltering } from "./GraphicTypes";
import { Color } from "./Color";
import { SerializedObject } from "../core/SerializableObject";
import { ObjectProps } from "../core/Types";
export declare enum TexturePublishFormat {
    JPEG = 0,
    PNG = 1,
    SVG = 2
}
export declare class Texture2D extends Texture {
    readonly version: number;
    readonly image: HTMLImageElement;
    publishFormat: number;
    textureData: string;
    protected _filtering: TextureFiltering;
    protected _repeat: boolean;
    private _mipMaps;
    private _publishFormat;
    private _textureData?;
    private _textureDataLoaded;
    private _image;
    private _canvas;
    private _pixels;
    constructor(props?: ObjectProps<Texture2D>);
    getWidth(): number;
    getHeight(): number;
    setProperty(name: string, value: any): void;
    isLoaded(): boolean;
    begin(stage: number): boolean;
    loadTextureData(): Promise<HTMLImageElement>;
    graphicLoad(): boolean;
    getPixel(x: number, y: number, colorOut: Color): void;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
    private setupTexture;
}
