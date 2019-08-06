
import { Asset } from "../assets/Asset";
import * as Attributes from "../core/Attributes";
import { CollisionFilter } from "./CollisionFilter";

@Attributes.displayName("Collision Group")
export class CollisionGroup extends Asset {
    isAllowed(filter?: CollisionFilter) {
        const excluded = filter ? filter.getExcluded().data.some(g => g.asset === this) : false;
        if (excluded) {
            return false;
        }
        return filter ? filter.getIncluded().data.some(g => g.asset === this) : true;
    }
}
