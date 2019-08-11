import { AnimationTrack } from "./tracks/AnimationTrack";
import { Entity } from "../core/Entity";
import { Animation } from "./Animation";
import { AnimationTargets, AnimationInstance } from "./AnimationInstance";
import { AnimationTrackDefinition } from "./AnimationTrackDefinition";
import { IPlayAnimationOptions } from "./AnimationTypes";
export declare class AnimationUtils {
    static evaluateTrack(track: AnimationTrack, propertyPath: string, entity: Entity, time: number, handler: (target: object, property: string, value: any) => void): void;
    static applyTrack(track: AnimationTrackDefinition, entity: Entity, evalTime: number, playTime: number): void;
    static evaluateAnimation(animation: Animation, rootTarget: Entity, handler: (track: AnimationTrackDefinition, target: Entity) => void, targets?: AnimationTargets): void;
    static applyAnimation(animation: Animation, rootTarget: Entity, evalTime: number, playTime: number, targets?: AnimationTargets): void;
    static playAnimation(owner: Entity, anim: AnimationInstance, options?: IPlayAnimationOptions): void;
    static playAnimationInstance(owner: Entity, anim: AnimationInstance, options?: IPlayAnimationOptions): void;
    static fetchTargetsIfNecessary(entity: Entity, anim: AnimationInstance): void;
    static resetAnimationTransition(anim: AnimationInstance): void;
}
