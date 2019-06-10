import { BehaviorNode } from "../BehaviorNode";
export declare class KeyInput extends BehaviorNode {
    private _keyCode;
    private _keyDown;
    private _keyUp;
    constructor();
    onBehaviorStarted(): void;
    destroy(): void;
    private onKeyChanged;
}
