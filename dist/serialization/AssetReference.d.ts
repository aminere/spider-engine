import { Asset } from "../assets/Asset";
import { SyncEvent } from "ts-events";
import { Constructor } from "../core/Types";
export declare enum AssetReferenceState {
    Loading = 0,
    Resolved = 1
}
export interface AssetChangedEvent {
    oldAsset: Asset | null;
    newAsset: Asset | null;
}
export declare class AssetReference<T extends Asset> {
    typeName: () => string;
    get id(): string | undefined;
    set id(id: string | undefined);
    get asset(): T | null;
    set asset(asset: T | null);
    get state(): AssetReferenceState;
    set state(state: AssetReferenceState);
    get isResolved(): boolean;
    /**
     * @event
     */
    assetChanged: SyncEvent<AssetChangedEvent>;
    private _id?;
    private _asset;
    private _state;
    constructor(ctor: Constructor<T>, instance?: T);
    clear(): void;
    setAssetFast(asset: T | null): void;
    detach(): void;
    private onAssetDeleted;
}
