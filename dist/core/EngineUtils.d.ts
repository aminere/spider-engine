import { SerializableObject } from "./SerializableObject";
import { AssetReference } from "../serialization/AssetReference";
import { Asset } from "../assets/Asset";
/**
 * @hidden
 */
export declare class EngineUtils {
    static isObjectLoaded(obj: SerializableObject): boolean;
    static isAssetRefLoaded(assetRef: AssetReference<Asset>): boolean;
    static makeUniqueId(): string;
}
