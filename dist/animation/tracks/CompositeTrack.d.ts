import { SerializableObject } from "../../core/SerializableObject";
import { Reference } from "../../serialization/Reference";
import { NumberTrack } from "./NumberTrack";
import { AnimationTrack } from "./AnimationTrack";
import { ArrayProperty } from "../../serialization/ArrayProperty";
export declare class AnimationSubTrackDefinition extends SerializableObject {
    componentId: string;
    track: Reference<NumberTrack>;
    constructor(componentId?: string, track?: Reference<NumberTrack>);
}
export declare class CompositeTrack extends AnimationTrack {
    tracks: ArrayProperty<AnimationSubTrackDefinition>;
    getSample(time: number, target?: any): any;
}
