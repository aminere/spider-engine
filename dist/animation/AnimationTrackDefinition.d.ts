import { Reference } from "../serialization/Reference";
import { SerializableObject, SerializedObject } from "../core/SerializableObject";
import { AnimationTrack } from "./tracks/AnimationTrack";
export declare class AnimationTrackDefinition extends SerializableObject {
    readonly version: number;
    readonly id: string;
    propertyPath: string;
    track: Reference<AnimationTrack>;
    targetName?: string;
    private _id;
    constructor();
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
}
