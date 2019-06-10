import { UIElement } from "./UIElement";
import * as Attributes from "../core/Attributes";
import { Reference } from "../serialization/Reference";
import { UIFill } from "./UIFill";
import { Layout } from "./Layout";
import { UIFillUtils } from "./UIFillUtils";
import { Entity, EntityInternal } from "../core/Entity";
import { TouchInteractions } from "./TouchInteractions";
import { Color } from "../graphics/Color";
import { VertexBuffer } from "../graphics/VertexBuffer";

export class CheckBox extends UIElement {

    get checked() { return this._checked.instance; }
    get unchecked() { return this._unchecked.instance; }    
    set isChecked(checked: boolean) { this._isChecked = checked; }
    get isChecked() { return this._isChecked; }
    get enabled() { return this._touchInteractions.active; }
    set enabled(enabled: boolean) {
        this._enabled = this._touchInteractions.active = enabled;        
    }

    get currentFill() {
        return this._isChecked ? this.checked : this.unchecked;
    }

    get currentColor() {
        if (!this.enabled) {
            return this.disabledColor;
        } else if (this.isTouchPressed) {
            return this.pressedColor;
        } else if (this.isTouchInside) {
            return this.highlightColor;
        }
        return Color.white;
    }
    
    highlightColor = new Color().copy(Color.white);
    pressedColor = new Color().copy(Color.white);
    disabledColor = new Color().copy(Color.grey);

    private _enabled = true;
    private _isChecked = false;
    private _checked = new Reference(UIFill);
    private _unchecked = new Reference(UIFill);
    
    @Attributes.unserializable()
    private _touchInteractions!: TouchInteractions;

    /**
     * @hidden
     */
    setEntity(entity: Entity) {
        super.setEntity(entity);
        this._touchInteractions = new TouchInteractions({
            active: this._enabled,
            controller: this
        });
        EntityInternal.setComponentFromInstance(entity, this._touchInteractions);
    }

    /**
     * @hidden
     */
    destroy() {
        this.entity.clearComponent(TouchInteractions);
        super.destroy();
    }

    isLoaded() {
        if (this.checked) {
            if (!this.checked.isLoaded()) {
                return false;
            }
        }
        if (this.unchecked) {
            if (!this.unchecked.isLoaded()) {
                return false;
            }
        }
        return true;
    }

    getVertexBuffer(): VertexBuffer {
        return UIFillUtils.getVertexBuffer(this.entity.getComponent(Layout) as Layout, this.currentFill);
    }
    
    setTouchPressed(pressed: boolean) {
        const wasPressed = this.isTouchPressed;
        super.setTouchPressed(pressed);
        if (!pressed && wasPressed) {
            // toggle check box
            if (this.enabled) {
                this.isChecked = !this.isChecked;
            }
        }
    }
}
