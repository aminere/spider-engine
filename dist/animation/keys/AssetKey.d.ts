import { AssetReference } from "../../serialization/AssetReference";
import { TAnimationKey } from "./AnimationKey";
import { Asset } from "../../assets/Asset";
export declare class AssetKey extends TAnimationKey<string> {
    assetRef: AssetReference<Asset>;
    lerp(src: AssetKey, dest: AssetKey, factor: number): Asset | null;
    initializeReference(value: string, typeName: string, created: () => void): void;
    isLoaded(): boolean;
    getValue(): any;
}
