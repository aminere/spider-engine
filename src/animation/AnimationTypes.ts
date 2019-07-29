import { Vector3 } from "../math/Vector3";
import { Quaternion } from "../math/Quaternion";

export interface ITransitionOptions {
    duration: number;

    /**
     * Determine the number of times the destination animation will loop
     * If 0 or undefined, destination animation will loop indefinitely
     */
    loopCount?: number;
}

export type BlendableType = Vector3 | Quaternion | number;

export interface AnimationTrackTransition {
    sourceValue: BlendableType;
    blend: (source: BlendableType, dest: BlendableType, factor: number) => BlendableType;
    duration: number;
}
