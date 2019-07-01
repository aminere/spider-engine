import { Asset } from "../assets/Asset";
import { AssetReference } from "./AssetReference";
import { SerializedAssetReference } from "./SerializedTypes";
export declare class AssetReferenceArray<T extends Asset> {
    data: AssetReference<T>[];
    grow: (instance?: T) => void;
    typeName: () => string;
    constructor(ctor: {
        new (...args: any[]): T;
    }, data?: AssetReference<T>[]);
    detach(): void;
}
export interface SerializedAssetReferenceArray {
    typeName: string;
    data: SerializedAssetReference[];
}
