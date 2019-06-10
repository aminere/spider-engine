
namespace Private {
    export const gamepadEventsSupported = "ongamepadconnected" in window;
    export const gamepadMap: { [index: number]: Gamepad | null } = {};
    
    export function onGamepadConnected(e: Event) {
        const gamePadEvent = e as GamepadEvent;
        gamepadMap[gamePadEvent.gamepad.index] = gamePadEvent.gamepad;
    }
    
    export function onGamepadDisconnected(e: Event) {
        const gamePadEvent = e as GamepadEvent;
        delete gamepadMap[gamePadEvent.gamepad.index];
    }
}

export namespace GamepadsInternal {

    export function scanGamepads() {
        if (Private.gamepadEventsSupported) {
            return;
        }
        // tslint:disable-next-line
        const _navigator = navigator as any;
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : (_navigator.webkitGetGamepads ? _navigator.webkitGetGamepads() : []);
        let validGamePads = {};
        for (let i = 0; i < gamepads.length; i++) {
            if (gamepads[i]) {
                let index = gamepads[i].index;
                validGamePads[index] = true;
                Private.gamepadMap[index] = gamepads[i];
            }
        }
        // clear invalid gamepads
        for (let index of Object.keys(Private.gamepadMap)) {
            if (!(index in validGamePads)) {
                Private.gamepadMap[index] = null;
            }
        }
    }

    export function initialize() {
        if (Private.gamepadEventsSupported) {
            window.addEventListener("gamepadconnected", Private.onGamepadConnected);                
            window.addEventListener("gamepaddisconnected", Private.onGamepadDisconnected);
        } else {
            setTimeout(scanGamepads, 500);
        }
    }

    export function destroy() {
        if (Private.gamepadEventsSupported) {
            window.removeEventListener("gamepadconnected", Private.onGamepadConnected);
            window.removeEventListener("gamepaddisconnected", Private.onGamepadDisconnected);
        }
    }
}
export class Gamepads {
    static get(index: number): Gamepad | null {
        const gamepad = Private.gamepadMap[index];        
        if (gamepad) {
            return gamepad;
        }
        return null;
    }

    static forEach(handler: (gamePad: Gamepad, index: number) => void) {
        const gamePads = Object.values(Private.gamepadMap);
        for (let i = 0; i < gamePads.length; ++i) {
            const gamePad = gamePads[i];
            if (gamePad) {
                handler(gamePad, i);
            }
        }
    }
}
