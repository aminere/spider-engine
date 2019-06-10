
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

namespace Private {
    export const swipeThreshold = 20;

    export const keyEvent: KeyEvent = {
        pressed: false,
        keyCode: 0
    };

    export const touchEvent: TouchEvent = {
        pressed: false,
        x: 0,
        y: 0,
        swipe: false,
        swipeVelocity: new Vector2(),
        button: 0
    };
    
    export const initialTouchPos = new Vector2();
}

export class Input {
    static get touchX() { return Private.touchEvent.x; }
    static get touchY() { return Private.touchEvent.y; }
    static set touchX(touchX: number) { Private.touchEvent.x = touchX; }
    static set touchY(touchY: number) { Private.touchEvent.y = touchY; }    
        
    static touchPressed = new SyncEvent<TouchEvent>();   
    static touchMoved = new SyncEvent<TouchEvent>();   
    static touchReleased = new SyncEvent<TouchEvent>();   
    static wheelMoved = new SyncEvent<number>(); 
    static keyChanged = new SyncEvent<KeyEvent>();

    static detachAll() {
        Input.touchPressed.detach();
        Input.touchMoved.detach();
        Input.touchReleased.detach();
        Input.wheelMoved.detach();
        Input.keyChanged.detach();
    }
}

/**
 * @hidden
 */
export class InputInternal {
    static create(touchPos: Vector2) {        
        Private.touchEvent.x = touchPos.x;
        Private.touchEvent.y = touchPos.y;
    }
    
    static get keyChangedInfo() { return Private.keyEvent; }

    static onTouchDown(x: number, y: number, button: number) {
        if (x < 0 || y < 0) {
            // interaction outside the canvas, ignore event
            return;
        }
        Private.touchEvent.pressed = true;
        Private.touchEvent.swipe = false;
        Private.touchEvent.x = x;
        Private.touchEvent.y = y;      
        Private.touchEvent.button = button;  
        Private.initialTouchPos.set(x, y);
        Input.touchPressed.post(Private.touchEvent);
    }

    static onTouchMove(x: number, y: number, button: number) {
        if (x < 0 || y < 0) {
            // interaction outside the canvas, ignore event
            return;
        }
        Private.touchEvent.swipe = false;
        Private.touchEvent.x = x;
        Private.touchEvent.y = y;        
        Private.touchEvent.button = button;  
        Input.touchMoved.post(Private.touchEvent);
    }

    static onTouchUp(x: number, y: number, button: number) {
        if (x < 0 || y < 0) {
            // interaction outside the canvas, ignore event
            return;
        }
        const deltaX = x - Private.initialTouchPos.x;
        const deltaY = y - Private.initialTouchPos.y;
        Private.touchEvent.pressed = false;
        Private.touchEvent.swipe = Math.max(Math.abs(deltaX), Math.abs(deltaY)) > Private.swipeThreshold;
        Private.touchEvent.x = x;
        Private.touchEvent.y = y;        
        Private.touchEvent.swipeVelocity.set(deltaX, deltaY);
        Private.touchEvent.button = button;  
        Input.touchReleased.post(Private.touchEvent);
    }   

    static onMouseWheel(delta: number) {
        Input.wheelMoved.post(delta);
    }
}