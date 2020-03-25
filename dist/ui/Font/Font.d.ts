import { SerializableObject } from "../../core/SerializableObject";
import { Texture } from "../../graphics/texture/Texture";
export declare class Font extends SerializableObject {
    getTexture(): Texture;
    setText(text: string): void;
    setAlignment(alignment: number): void;
    getWidth(): number;
    getHeight(): number;
    isLoaded(): boolean;
    /**
     * @hidden
     */
    prepareForRendering(screenScaleFactor: number, maxWidth: number): void;
}
