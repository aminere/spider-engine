import { Vector3 } from "../math/Vector3";
import { Quaternion } from "../math/Quaternion";

export interface IPlayAnimationOptions {
    /**
     * Normalized time in the range [0, 1]
     * Indicates where to start the animation
     * If undefined, attempts to resume the animation wherever it was stopped
     */
    startTime?: number;
}

export interface ITransitionOptions extends IPlayAnimationOptions {
    duration: number;
}

export type BlendableType = Vector3 | Quaternion | number;

export interface AnimationTrackTransition {
    sourceValue: BlendableType;
    blend: (source: BlendableType, dest: BlendableType, factor: number) => BlendableType;
    duration: number;
}
