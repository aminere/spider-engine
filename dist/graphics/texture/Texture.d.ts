import { GraphicAsset } from "../GraphicAsset";
export declare class Texture extends GraphicAsset {
    get textureId(): WebGLTexture | null;
    protected _textureId: WebGLTexture | null;
    getWidth(): number;
    getHeight(): number;
    begin(stage: number): boolean;
    graphicUnload(): void;
}
