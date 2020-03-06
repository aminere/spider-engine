/**
 * @hidden
 */
export declare namespace TimeInternal {
    function updateDeltaTime(): void;
    function resetCurrentFrame(): void;
    function incrementCurrentFrame(): void;
}
export declare class Time {
    static get time(): number;
    static get deltaTime(): number;
    static get smoothDeltaTime(): number;
    static get fps(): number;
    static get currentFrame(): number;
}
