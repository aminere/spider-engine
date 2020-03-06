import { AnimationKey } from "../keys/AnimationKey";
import { ArrayProperty } from "../../serialization/ArrayProperty";
import { AnimationTrack, SerializedAnimationTrack, SerializedNumberTrack } from "./AnimationTrack";
import { BooleanKey, StringKey } from "../keys/NativeKey";
import { Constructor } from "../../core/Types";
export declare class SingleTrack<T extends AnimationKey> extends AnimationTrack {
    get version(): number;
    keys: ArrayProperty<T>;
    internalCreateKey: () => AnimationKey;
    constructor(ctor: Constructor<T>);
    getKeys(): T[];
    createKey(time: number, value: any, created?: (key: AnimationKey) => void): void;
    removeKey(key: AnimationKey): void;
    sortByTime(removeDuplicates?: boolean): void;
    serialize(): SerializedAnimationTrack | SerializedNumberTrack;
    deserialize(json: SerializedAnimationTrack | SerializedNumberTrack): Promise<this>;
}
export declare class BooleanTrack extends SingleTrack<BooleanKey> {
    constructor();
}
export declare class StringTrack extends SingleTrack<StringKey> {
    constructor();
}
