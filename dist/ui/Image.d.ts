import { UIElement } from "./UIElement";
import { UIFill } from "./UIFill";
import { SerializedObject } from "../core/SerializableObject";
import { VertexBuffer } from "../graphics/VertexBuffer";
import { ObjectProps } from "../core/Types";
export declare class Image extends UIElement {
    readonly version: number;
    fill: UIFill | undefined;
    private _fill;
    constructor(props?: ObjectProps<Image>);
    isLoaded(): boolean;
    getVertexBuffer(): VertexBuffer;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
}
