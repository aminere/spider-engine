import { Asset } from "../assets/Asset";
import { AssetReference } from "../serialization/AssetReference";
import { Animation } from "./Animation";
export declare class AnimationTransition extends Asset {
    from: AssetReference<Animation>;
    to: AssetReference<Animation>;
    duration: number;
}
