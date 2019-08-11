import { UIElement } from "./UIElement";
import { Color } from "../graphics/Color";
import { Font } from "./Font/Font";
import { SerializedObject } from "../core/SerializableObject";
import { VertexBuffer } from "../graphics/VertexBuffer";
import { Entity } from "../core/Entity";
export declare class Text extends UIElement {
    readonly version: number;
    text: string;
    alignment: number;
    color: Color;
    readonly font: Font | undefined;
    private _color;
    private _font;
    private _text;
    private _alignment;
    constructor();
    /**
     * @hidden
     */
    setProperty(name: string, value: any): void;
    setEntity(entity: Entity): void;
    destroy(): void;
    isLoaded(): boolean;
    getVertexBuffer(): VertexBuffer;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
}
