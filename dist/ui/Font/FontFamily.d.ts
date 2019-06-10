import { Font } from "./Font";
import { FontShadow } from "./FontShadow";
import { FontTexture } from "./FontTexture";
export declare class FontFamily extends Font {
    family: string;
    size: number;
    bold: boolean;
    italic: boolean;
    shadow: FontShadow | undefined;
    texture: FontTexture;
    private _shadow;
    constructor();
    setText(text: string): void;
    setAlignment(alignment: number): void;
    getTexture(): FontTexture;
    getWidth(): number;
    getHeight(): number;
    /**
     * @hidden
     */
    setProperty(name: string, value: any): void;
    /**
     * @hidden
     */
    prepareForRendering(screenScaleFactor: number, maxWidth: number): void;
    /**
     * @hidden
     */
    destroy(): void;
    private onShadowPropertyChanged;
}
