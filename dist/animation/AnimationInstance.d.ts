import { SerializableObject, SerializedObject } from "../core/SerializableObject";
import { Entity } from "../core/Entity";
import { Animation } from "./Animation";
export interface AnimationTargets {
    [targetName: string]: Entity;
}
export declare class AnimationInstance extends SerializableObject {
    readonly version: number;
    animation: Animation | null;
    loopCount: number;
    speed: number;
    autoPlay: boolean;
    isPlaying: boolean;
    localTime: number;
    playTime: number;
    readonly stopRequested: boolean;
    playCount: number;
    /**
     * @hidden
     */
    targets: AnimationTargets;
    private _isPlaying;
    private _localTime;
    private _playTime;
    private _stopRequested;
    private _playCount;
    private _animation;
    requestStop(): void;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
    isLoaded(): boolean;
    destroy(): void;
}
