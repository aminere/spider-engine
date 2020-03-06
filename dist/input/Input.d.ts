import { SyncEvent } from "ts-events";
import { Vector2 } from "../math/Vector2";
export interface KeyEvent {
    pressed: boolean;
    keyCode: number;
}
export interface TouchEvent {
    pressed: boolean;
    x: number;
    y: number;
    swipe: boolean;
    swipeVelocity: Vector2;
    button: number;
}
export declare class Input {
    static get touchX(): number;
    static get touchY(): number;
    static set touchX(touchX: number);
    static set touchY(touchY: number);
    static touchPressed: SyncEvent<TouchEvent>;
    static touchMoved: SyncEvent<TouchEvent>;
    static touchReleased: SyncEvent<TouchEvent>;
    static wheelMoved: SyncEvent<number>;
    static keyChanged: SyncEvent<KeyEvent>;
    static detachAll(): void;
}
/**
 * @hidden
 */
export declare class InputInternal {
    static create(touchPos: Vector2): void;
    static get keyChangedInfo(): KeyEvent;
    static onTouchDown(x: number, y: number, button: number): void;
    static onTouchMove(x: number, y: number, button: number): void;
    static onTouchUp(x: number, y: number, button: number): void;
    static onMouseWheel(delta: number): void;
}
