/**
 * @hidden
 */
export declare namespace GamepadsInternal {
    function scanGamepads(): void;
    function initialize(): void;
    function destroy(): void;
}
export declare class Gamepads {
    static get(index: number): Gamepad | null;
    static forEach(handler: (gamePad: Gamepad, index: number) => void): void;
}
