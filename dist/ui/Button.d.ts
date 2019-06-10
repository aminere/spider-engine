import { UIElement } from "./UIElement";
import { UIFill } from "./UIFill";
import { SerializedObject } from "../core/SerializableObject";
import { Entity } from "../core/Entity";
import { VertexBuffer } from "../graphics/VertexBuffer";
import { ObjectProps } from "../core/Types";
export declare class Button extends UIElement {
    readonly version: number;
    normal: UIFill | undefined;
    highlighted: UIFill | undefined;
    pressed: UIFill | undefined;
    disabled: UIFill | undefined;
    pushed: boolean;
    enabled: boolean;
    readonly currentFill: UIFill | undefined;
    private _enabled;
    private _pushed;
    private _normal;
    private _highlighted;
    private _pressed;
    private _disabled;
    private _touchInteractions;
    constructor(props?: ObjectProps<Button>);
    setEntity(entity: Entity): void;
    destroy(): void;
    isLoaded(): boolean;
    getVertexBuffer(): VertexBuffer;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
}
