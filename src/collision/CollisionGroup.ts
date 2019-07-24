
import { Asset } from "../assets/Asset";
import * as Attributes from "../core/Attributes";

@Attributes.displayName("Collision Group")
export class CollisionGroup extends Asset {
    isAllowed(include?: CollisionGroup[], exclude?: CollisionGroup[]) {
        let excluded = exclude ? exclude.some(g => g === this) : false;
        if (excluded) {
            return false;
        }
        return include ? include.some(g => g === this) : true;
    }
}
