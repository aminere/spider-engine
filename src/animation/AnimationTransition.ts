import { Asset } from "../assets/Asset";
import { AssetReference } from "../serialization/AssetReference";
import { Animation } from "./Animation";

export class AnimationTransition extends Asset {
    from = new AssetReference(Animation);
    to = new AssetReference(Animation);
    duration = .3;
}
