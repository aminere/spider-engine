import { AssetReference, AssetReferenceState } from "../../serialization/AssetReference";
import { TAnimationKey } from "./AnimationKey";
import { Asset } from "../../assets/Asset";
import { IFactoryInternal } from "../../serialization/IFactory";
import { EngineUtils } from "../../core/EngineUtils";
import * as Attributes from "../../core/Attributes";
import { UniqueObject } from "../../core/UniqueObject";
import { ObjectManagerInternal } from "../../core/ObjectManager";

export class AssetKey extends TAnimationKey<string> {
    @Attributes.unserializable()
    assetRef!: AssetReference<Asset>;

    lerp(src: AssetKey, dest: AssetKey, factor: number) {
        return src.assetRef ? src.assetRef.asset : null;
    }

    initializeReference(value: string, typeName: string, created: () => void) {
        super.setValue(value);
        if (!this.assetRef) {
            this.assetRef = IFactoryInternal.instance.createAssetReference(typeName) as AssetReference<Asset>;
            this.assetRef.state = AssetReferenceState.Loading;
        }
        if (value !== undefined) {
            const loadSuccess = (obj: UniqueObject, fromCache: boolean) => {
                this.assetRef.asset = obj as Asset;
                created();
            };
            if (process.env.CONFIG === "editor") {
                ObjectManagerInternal.loadObjectById(value, loadSuccess, created);
            } else {
                // in standalone, ids are resolved as paths
                ObjectManagerInternal.loadObject(value, loadSuccess, created, false);
            } 
        } else {
            this.assetRef.asset = null;
            created();
        }
    }

    isLoaded() {
        return EngineUtils.isAssetRefLoaded(this.assetRef);
    }

    getValue() {
        // prevent compiler from complaining
        // even if the track data is made of strings, we evaluate as (asset | null) at runtime.
        // tslint:disable-next-line
        return this.assetRef.asset as any;
    }
}
