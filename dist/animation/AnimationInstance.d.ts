import { SerializableObject, SerializedObject } from "../core/SerializableObject";
import { Entity } from "../core/Entity";
import { Animation } from "./Animation";
export interface AnimationTargets {
    [targetName: string]: Entity;
}
export declare class AnimationInstance extends SerializableObject {
    get version(): number;
    get animation(): Animation | null;
    set animation(value: Animation | null);
    loopCount: number;
    speed: number;
    autoPlay: boolean;
    get isPlaying(): boolean;
    set isPlaying(playing: boolean);
    get localTime(): number;
    set localTime(time: number);
    get playTime(): number;
    set playTime(time: number);
    get stopRequested(): boolean;
    get playCount(): number;
    set playCount(value: number);
    get autoPlayStatus(): boolean;
    set autoPlayStatus(autoPlay: boolean);
    /**
     * @hidden
     */
    targets?: AnimationTargets;
    private _isPlaying;
    private _localTime;
    private _playTime;
    private _stopRequested;
    private _playCount;
    private _autoPlayStatus?;
    private _animation;
    requestStop(): void;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
    isLoaded(): boolean;
    destroy(): void;
}
