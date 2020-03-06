import { UIElement } from "./UIElement";
import { UIFill } from "./UIFill";
import { Entity } from "../core/Entity";
import { Color } from "../graphics/Color";
import { VertexBuffer } from "../graphics/VertexBuffer";
export declare class CheckBox extends UIElement {
    get checked(): UIFill | undefined;
    get unchecked(): UIFill | undefined;
    set isChecked(checked: boolean);
    get isChecked(): boolean;
    get enabled(): boolean;
    set enabled(enabled: boolean);
    get currentFill(): UIFill | undefined;
    get currentColor(): Color;
    highlightColor: Color;
    pressedColor: Color;
    disabledColor: Color;
    private _enabled;
    private _isChecked;
    private _checked;
    private _unchecked;
    private _touchInteractions;
    /**
     * @hidden
     */
    setEntity(entity: Entity): void;
    /**
     * @hidden
     */
    destroy(): void;
    isLoaded(): boolean;
    getVertexBuffer(): VertexBuffer;
    setTouchPressed(pressed: boolean): void;
}
