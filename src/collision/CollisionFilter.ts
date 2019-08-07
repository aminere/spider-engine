import { SerializableObject } from "../core/SerializableObject";
import { AssetReferenceArray } from "../serialization/AssetReferenceArray";
import { CollisionGroup } from "./CollisionGroup";
import { AssetReference } from "../serialization/AssetReference";
import * as Attributes from "../core/Attributes";

namespace Private {
    export const emptyArray = new AssetReferenceArray(CollisionGroup);
}

export class CollisionFilter extends SerializableObject {
    getIncluded() { return Private.emptyArray; }
    getExcluded() { return Private.emptyArray; }
    detach() {
        this.getExcluded().detach();
        this.getIncluded().detach();
    }
    
    canCollideWith(group: CollisionGroup | null) {
        const definedGroup = Boolean(group);
        const excluded = definedGroup ? this.getExcluded().data.some(g => g.asset === group) : false;
        if (excluded) {
            return false;
        }
        if (this.getIncluded().data.length > 0) {
            return definedGroup && this.getIncluded().data.some(g => g.asset === group);
        }
        return true;
    }
}

@Attributes.displayName("Include")
export class InclusionCollisionFilter extends CollisionFilter {

    private _included = new AssetReferenceArray(CollisionGroup);

    constructor(included?: CollisionGroup[]) {
        super();
        if (included) {
            this._included.data = included.map(e => new AssetReference(CollisionGroup, e));
        }
    }

    getIncluded() {
        return this._included;
    }
}

@Attributes.displayName("Exclude")
export class ExclusionCollisionFilter extends CollisionFilter {

    private _excluded = new AssetReferenceArray(CollisionGroup);

    constructor(excluded?: CollisionGroup[]) {
        super();
        if (excluded) {
            this._excluded.data = excluded.map(e => new AssetReference(CollisionGroup, e));
        }
    }

    getExcluded() {
        return this._excluded;
    }
}
