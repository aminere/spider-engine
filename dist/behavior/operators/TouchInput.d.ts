import { BehaviorNode } from "../BehaviorNode";
export declare class TouchInput extends BehaviorNode {
    private _x;
    private _y;
    private _wheelDelta;
    private _button;
    private _isPressed;
    private _pressed;
    private _released;
    private _moved;
    private _wheel;
    private _swipe;
    private _swipeVelocity;
    constructor();
    onBehaviorStarted(): void;
    destroy(): void;
    private onTouchPressed;
    private onTouchMoved;
    private onTouchReleased;
    private onMouseWheel;
}
