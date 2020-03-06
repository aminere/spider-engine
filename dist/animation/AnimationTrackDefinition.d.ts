import { Reference } from "../serialization/Reference";
import { SerializableObject, SerializedObject } from "../core/SerializableObject";
import { AnimationTrack } from "./tracks/AnimationTrack";
import { AnimationTrackTransition } from "./AnimationTypes";
export declare class AnimationTrackDefinition extends SerializableObject {
    get version(): number;
    get id(): string;
    propertyPath: string;
    track: Reference<AnimationTrack>;
    targetName?: string;
    transition: AnimationTrackTransition;
    private _id;
    constructor();
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
}
