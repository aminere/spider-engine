import { UIElement } from "./UIElement";
import * as Attributes from "../core/Attributes";
import { Reference } from "../serialization/Reference";
import { UIFill } from "./UIFill";
import { Layout } from "./Layout";
import { UIFillUtils } from "./UIFillUtils";
import { SerializedObject } from "../core/SerializableObject";
import { Entity, EntityInternal } from "../core/Entity";
import { TouchInteractions } from "./TouchInteractions";
import { VertexBuffer } from "../graphics/VertexBuffer";
import { ObjectProps } from "../core/Types";

@Attributes.displayName("Button")
@Attributes.helpUrl("https://docs.spiderengine.io/2d/button.html")
export class Button extends UIElement {

    get version() { return 3; }
    
    get normal() { return this._normal.instance; }
    get highlighted() { return this._highlighted.instance; }
    get pressed() { return this._pressed.instance; }
    get disabled() { return this._disabled.instance; }
    set normal(fill: UIFill | undefined) { this._normal.instance = fill; }
    set highlighted(fill: UIFill | undefined) { this._highlighted.instance = fill; }
    set pressed(fill: UIFill | undefined) { this._pressed.instance = fill; }
    set disabled(fill: UIFill | undefined) { this._disabled.instance = fill; }
    set pushed(pushed: boolean) { this._pushed = pushed; }
    get pushed() { return this._pushed; }
    get enabled() { return this._touchInteractions.active; }
    set enabled(enabled: boolean) {
        this._enabled = this._touchInteractions.active = enabled;        
    }

    get currentFill() {
        if (!this.enabled) {
            return this.disabled || this.normal;
        }

        if (this.isTouchPressed || this._pushed) {
            return this.pressed || this.normal;
        } else if (this.isTouchInside) {
            // TODO if both the normal and highlighted states are of the same sprite sheet, make sure the current tile matches
            return this.highlighted || this.normal;
        }

        return this.normal;
    }    
    
    private _enabled = true;
    private _pushed = false;
    private _normal = new Reference(UIFill);
    private _highlighted = new Reference(UIFill);
    private _pressed = new Reference(UIFill);
    private _disabled = new Reference(UIFill);   
    
    @Attributes.unserializable()
    private _touchInteractions!: TouchInteractions;

    constructor(props?: ObjectProps<Button>) {
        super();
        if (props) {
            this.setState(props);
        }
    }

    setEntity(entity: Entity) {
        super.setEntity(entity);     
        entity.getOrSetComponent(Layout);
        
        this._touchInteractions = new TouchInteractions({
            active: this._enabled,
            controller: this
        });
        EntityInternal.setComponentFromInstance(entity, this._touchInteractions);
    }

    destroy() {
        this.entity.clearComponent(TouchInteractions);
        super.destroy();
    }

    isLoaded() {
        if (this.normal) {
            if (!this.normal.isLoaded()) {
                return false;
            }
        }
        if (this.highlighted) {
            if (!this.highlighted.isLoaded()) {
                return false;
            }
        }
        if (this.pressed) {
            if (!this.pressed.isLoaded()) {
                return false;
            }
        }
        if (this.disabled) {
            if (!this.disabled.isLoaded()) {
                return false;
            }
        }
        return true;
    }

    getVertexBuffer(): VertexBuffer {
        return UIFillUtils.getVertexBuffer(this.entity.getComponent(Layout) as Layout, this.currentFill);
    }

    upgrade(json: SerializedObject, previousVersion: number) {
        if (previousVersion === 1) {
            Object.assign(json.properties, { 
                _normal: json.properties.normal,
                _highlighted: json.properties.highlighted,
                _pressed: json.properties.pressed,
                _disabled: json.properties.disabled
            });
            delete json.properties.normal;
            delete json.properties.highlighted;
            delete json.properties.pressed;
            delete json.properties.disabled;
        } else if (previousVersion === 2) {
            Object.assign(json.properties, { 
                _enabled: json.properties.enabled
            });
            delete json.properties.enabled;
        }
        return json;
    }
}
