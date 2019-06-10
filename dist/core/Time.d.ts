/**
 * @hidden
 */
export declare namespace TimeInternal {
    function updateDeltaTime(): void;
    function resetCurrentFrame(): void;
    function incrementCurrentFrame(): void;
}
export declare class Time {
    static readonly time: number;
    static readonly deltaTime: number;
    static readonly smoothDeltaTime: number;
    static readonly fps: number;
    static readonly currentFrame: number;
}
