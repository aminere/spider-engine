import { AssetReference, AssetReferenceState } from "../../serialization/AssetReference";
import { TAnimationKey } from "./AnimationKey";
import { Asset } from "../../assets/Asset";
import { IFactoryInternal } from "../../serialization/IFactory";
import { IObjectManagerInternal } from "../../core/IObjectManager";
import { EngineUtils } from "../../core/EngineUtils";
import * as Attributes from "../../core/Attributes";

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
            IObjectManagerInternal.instance.loadObjectById(value)
                .then(tuple => {
                    this.assetRef.asset = tuple[0] as Asset;
                    created();
                });
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
