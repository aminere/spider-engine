import { Texture } from "./Texture";
import { Size } from "../core/Size";
import { VoidAsyncEvent } from "ts-events";
export declare class RenderTarget extends Texture {
    set width(width: Size);
    set height(height: Size);
    get valid(): boolean;
    /**
     * @event
     */
    sizeChanged: VoidAsyncEvent;
    private _rgba;
    private _width;
    private _height;
    private _filtering;
    private _frameBuffer;
    private _depthBuffer;
    private _loadError;
    private _actualWidth;
    private _actualHeight;
    getWidth(): number;
    getHeight(): number;
    constructor(width?: Size, height?: Size, rgba?: boolean, persistent?: boolean, filtering?: number);
    bind(gl: WebGLRenderingContext): boolean;
    begin(stage: number): boolean;
    graphicLoad(): boolean;
    graphicUnload(): void;
    private resize;
}
