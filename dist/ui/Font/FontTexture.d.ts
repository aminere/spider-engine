import { Texture } from "../../graphics/Texture";
import { FontShadow } from "./FontShadow";
export declare class FontTexture extends Texture {
    scaleFactor: number;
    maxWidth: number;
    family: string;
    text: string;
    size: number;
    bold: boolean;
    italic: boolean;
    alignment: number;
    shadow: FontShadow | undefined;
    private _canvas;
    private _isDirty;
    private _text;
    private _fontSize;
    private _bold;
    private _italic;
    private _shadow?;
    private _fontFamily;
    private _maxWidth;
    private _alignment;
    private _scaleFactor;
    dirtify(): void;
    getWidth(): number;
    getHeight(): number;
    /**
     * @hidden
     */
    begin(stage: number): boolean;
    /**
     * @hidden
     */
    destroy(): void;
    private tryUpdateTextureInEditor;
    private updateTexture;
    private getTextHeight;
    private drawText;
}
