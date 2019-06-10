import { SerializedObject } from "../core/SerializableObject";
import { AsyncEvent } from "ts-events";
import { Component } from "../core/Component";
import { AnimationInstance } from "./AnimationInstance";
import { Animation } from "./Animation";
/**
 * @hidden
 */
export declare namespace AnimationComponentInternal {
    const animationsKey = "_animations";
}
export declare class AnimationComponent extends Component {
    readonly version: number;
    readonly animations: AnimationInstance[];
    /**
     * @event
     */
    animationFinished: AsyncEvent<string>;
    private _animations;
    isLoaded(): boolean;
    destroy(): void;
    playAnimationByIndex(index: number, reset?: boolean): void;
    playAnimation(id: string | number, reset?: boolean, loopCount?: number): void;
    stopAllAnimations(waitForEnd?: boolean): void;
    stopAnimation(id: string | number, waitForEnd?: boolean): void;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
    addAnimation(animation: Animation): void;
}
