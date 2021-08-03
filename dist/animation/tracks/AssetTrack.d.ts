import { AssetKey } from "../keys/AssetKey";
import { SingleTrack } from "./SingleTrack";
import { AnimationKey } from "../keys/AnimationKey";
import { SerializedAnimationTrack } from "./AnimationTrack";
export declare class AssetTrack extends SingleTrack<AssetKey> {
    get typeName(): string;
    private _typeName;
    constructor(typeName: string);
    createKey(time: number, value: string, created?: (key: AnimationKey) => void): void;
    isLoaded(): boolean;
    serialize(): SerializedAnimationTrack;
    deserialize(json: SerializedAnimationTrack): this;
}
