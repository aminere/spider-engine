import { SerializableObject } from "../../core/SerializableObject";
import { Reference } from "../../serialization/Reference";
import { NumberTrack } from "./NumberTrack";
import { AnimationTrack } from "./AnimationTrack";
import { ArrayProperty } from "../../serialization/ArrayProperty";

export class AnimationSubTrackDefinition extends SerializableObject {

    componentId: string;
    track: Reference<NumberTrack>;

    constructor(componentId?: string, track?: Reference<NumberTrack>) {
        super();

        this.componentId = componentId || "";
        this.track = track || new Reference(NumberTrack);
    }
}

export class CompositeTrack extends AnimationTrack {
    tracks = new ArrayProperty(AnimationSubTrackDefinition);

    // tslint:disable-next-line
    getSample(time: number, target?: any) {
        for (const subTrack of this.tracks.data) {
            const subValue = (subTrack.track.instance as NumberTrack).getSample(time);
            if (subValue !== undefined) {
                target[subTrack.componentId] = subValue;
            }
        }
        return target;
    }
}