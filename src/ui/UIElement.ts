
import * as Attributes from "../core/Attributes";
import { Layout } from "./Layout";
import { UIFillUtils } from "./UIFillUtils";
import { VertexBuffer } from "../graphics/VertexBuffer";
import { Component } from "../core/Component";
import { Entity } from "../core/Entity";
import { Transform } from "../core/Transform";

export enum UIOverflow {
    Clip,
    Scroll
}

/**
 * @hidden
 */
export class UIOverflowMetadata {
    static literals = {
        Clip: 0,
        Scroll: 1        
    };
}

export class UIElement extends Component {
        
    get isTouchInside() { return this._touchInside; }
    get isTouchPressed() { return this._touchPressed; }

    @Attributes.unserializable()
    private _touchInside = false;
    @Attributes.unserializable()
    private _touchPressed = false;

    setEntity(entity: Entity) {        
        super.setEntity(entity);
        entity.clearComponent(Transform);
        entity.getOrSetComponent(Layout);
    }

    getVertexBuffer(): VertexBuffer {
        return UIFillUtils.getVertexBuffer(this.entity.getComponent(Layout) as Layout);        
    }    

    setTouchInside(inside: boolean) {
        this._touchInside = inside;        
    }

    setTouchPressed(pressed: boolean) {
        this._touchPressed = pressed;
    }
}
