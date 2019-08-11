import { UIElement } from "./UIElement";
import { UIFill } from "./UIFill";
import { SerializedObject } from "../core/SerializableObject";
import { VertexBuffer } from "../graphics/VertexBuffer";
import { ObjectProps } from "../core/Types";
import { Entity } from "../core/Entity";
export declare class Image extends UIElement {
    readonly version: number;
    fill: UIFill | undefined;
    private _fill;
    constructor(props?: ObjectProps<Image>);
    setEntity(entity: Entity): void;
    isLoaded(): boolean;
    getVertexBuffer(): VertexBuffer;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
}
