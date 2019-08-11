import { VertexBuffer } from "../graphics/VertexBuffer";
import { Component } from "../core/Component";
import { Entity } from "../core/Entity";
export declare enum UIOverflow {
    Clip = 0,
    Scroll = 1
}
export declare class UIElement extends Component {
    readonly isTouchInside: boolean;
    readonly isTouchPressed: boolean;
    private _touchInside;
    private _touchPressed;
    setEntity(entity: Entity): void;
    getVertexBuffer(): VertexBuffer;
    setTouchInside(inside: boolean): void;
    setTouchPressed(pressed: boolean): void;
}
