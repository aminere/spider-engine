import { AnimationTrack } from "./tracks/AnimationTrack";
import { Entity } from "../core/Entity";
import { Animation } from "./Animation";
import { AnimationTargets, AnimationInstance } from "./AnimationInstance";
export declare class AnimationUtils {
    static applyTrack(track: AnimationTrack, propertyPath: string, entity: Entity, time: number): void;
    static applyAnimation(animation: Animation, rootTarget: Entity, time: number, targets?: AnimationTargets): void;
    static playAnimation(owner: Entity, anim: AnimationInstance, reset?: boolean, loopCount?: number): void;
}
