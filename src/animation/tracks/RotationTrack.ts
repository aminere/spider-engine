import { CompositeTrack, AnimationSubTrackDefinition } from "./CompositeTrack";
import { Quaternion, RotationOrder } from "../../math/Quaternion";
import { NumberTrack } from "./NumberTrack";
import { Reference } from "../../serialization/Reference";

export class RotationTrack extends CompositeTrack {

    eulerOrder: RotationOrder = "YXZ";

    constructor() {
        super();
        this.tracks.grow(new AnimationSubTrackDefinition("x", new Reference(NumberTrack, new NumberTrack())));
        this.tracks.grow(new AnimationSubTrackDefinition("y", new Reference(NumberTrack, new NumberTrack())));
        this.tracks.grow(new AnimationSubTrackDefinition("z", new Reference(NumberTrack, new NumberTrack())));
    }

    getSample(time: number, target?: Quaternion) {
        // TODO use quatenion slep
        // determine src & dest quaternion without calling getSample() on individual tracks!
        let xTrack = this.tracks.data[0].track.instance as NumberTrack;
        let yTrack = this.tracks.data[1].track.instance as NumberTrack;
        let zTrack = this.tracks.data[2].track.instance as NumberTrack;
        return (target as Quaternion).setFromEulerAngles(
            xTrack.getSample(time) || 0,
            yTrack.getSample(time) || 0,
            zTrack.getSample(time) || 0,
            this.eulerOrder
        );
    }
}
