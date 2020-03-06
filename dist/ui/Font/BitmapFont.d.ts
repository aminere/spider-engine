import { Font } from "./Font";
import { AssetReference } from "../../serialization/AssetReference";
import { Texture2D } from "../../graphics/Texture2D";
import { VertexBuffer } from "../../graphics/VertexBuffer";
import { Texture } from "../../graphics/Texture";
import { SerializedObject } from "../../core/SerializableObject";
import { FontMetrics } from "./FontMetrics";
export declare class BitmapFont extends Font {
    get version(): number;
    texture: AssetReference<Texture2D>;
    metrics: AssetReference<FontMetrics>;
    lineHeight: number;
    spacing: number;
    private _vertexBuffer;
    private _text;
    private _isDirty;
    private _maxWidth;
    private _width;
    private _height;
    private _pivotX;
    private _pivotY;
    private _alignment;
    getTexture(): Texture;
    getWidth(): number;
    getHeight(): number;
    setText(text: string): void;
    setAlignment(alignment: number): void;
    isLoaded(): boolean;
    /**
     * @hidden
     */
    destroy(): void;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
    /**
     * @hidden
     */
    tesselate(pivotX: number, pivotY: number): VertexBuffer;
    /**
     * @hidden
     */
    setProperty(name: string, value: any): void;
    /**
     * @hidden
     */
    prepareForRendering(screenScaleFactor: number, maxWidth: number): void;
    private drawText;
}
