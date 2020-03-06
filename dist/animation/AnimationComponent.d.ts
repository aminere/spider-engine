import { SerializedObject } from "../core/SerializableObject";
import { AsyncEvent } from "ts-events";
import { Component } from "../core/Component";
import { AnimationInstance } from "./AnimationInstance";
import { Animation } from "./Animation";
import { ITransitionOptions, IPlayAnimationOptions } from "./AnimationTypes";
/**
 * @hidden
 */
export declare namespace AnimationComponentInternal {
    const animationsKey = "_animations";
    function getAnimationInstance(id: string | number, animations: AnimationInstance[]): AnimationInstance | null;
}
export declare class AnimationComponent extends Component {
    get version(): number;
    get animations(): AnimationInstance[];
    /**
     * @event
     */
    animationFinished: AsyncEvent<string>;
    private _animations;
    isLoaded(): boolean;
    destroy(): void;
    playAnimationByIndex(index: number, options?: IPlayAnimationOptions): void;
    playAnimation(id: string | number, options?: IPlayAnimationOptions): void;
    /**
     * Plays an animation while attempting to transition from an existing active animation
     * @param sourceAnimId The index or the name of the source animation that is already playing
     * @param destAnimId The index or the name of the destination animation to play
     * @param options Transition options
     */
    transitionToAnimation(sourceAnimId: string | number, destAnimId: string | number, options: ITransitionOptions): void;
    stopAllAnimations(waitForEnd?: boolean): void;
    stopAnimation(id: string | number, waitForEnd?: boolean): void;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
    addAnimation(animation: Animation): void;
}
