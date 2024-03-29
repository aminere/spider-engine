import { SingleTrack } from "./SingleTrack";
import { NumberKey } from "../keys/NativeKey";
import { SerializedNumberTrack } from "./AnimationTrack";
export declare class NumberTrack extends SingleTrack<NumberKey> {
    get version(): number;
    constructor();
    getSample(time: number): number | undefined;
    serialize(): SerializedNumberTrack;
    deserialize(json: SerializedNumberTrack): this;
}
