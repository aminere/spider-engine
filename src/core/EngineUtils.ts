import { SerializableObject } from "./SerializableObject";
import { AssetReference } from "../serialization/AssetReference";
import { Asset } from "../assets/Asset";

/**
 * @hidden
 */
const uuid = require("uuid");

/**
 * @hidden
 */
export class EngineUtils {
    static isObjectLoaded(obj: SerializableObject) {
        for (const property of Object.values(obj)) {
            if (property === null) {
                continue;
            }
            const typeName = property.constructor ? property.constructor.name : null;
            if (typeName === "AssetReference") {
                const assetRef = property as AssetReference<Asset>;
                if (!EngineUtils.isAssetRefLoaded(assetRef)) {
                    return false;
                }
            }
        }
        return true;
    }

    static isAssetRefLoaded(assetRef: AssetReference<Asset>) {
        if (!assetRef.resolved) {
            return false;
        } else if (assetRef.asset) {
            if (!assetRef.asset.isLoaded()) {
                return false;
            }
        }
        return true;
    }

    static makeUniqueId() {
        return uuid() as string;
    }
}
