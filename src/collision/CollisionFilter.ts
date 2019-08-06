import { SerializableObject } from "../core/SerializableObject";
import { AssetReferenceArray } from "../serialization/AssetReferenceArray";
import { CollisionGroup } from "./CollisionGroup";
import { AssetReference } from "../serialization/AssetReference";

namespace Private {
    export let emptyArray = new AssetReferenceArray(CollisionGroup);
}

export class CollisionFilter extends SerializableObject {
    getIncluded() { return Private.emptyArray; }
    getExcluded() { return Private.emptyArray; }
}

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

export class MixedCollisionFilter extends CollisionFilter {

    private _excluded = new AssetReferenceArray(CollisionGroup);
    private _included = new AssetReferenceArray(CollisionGroup);

    constructor(excluded?: CollisionGroup[], included?: CollisionGroup[]) {
        super();
        if (excluded) {
            this._excluded.data = excluded.map(e => new AssetReference(CollisionGroup, e));
        }
        if (included) {
            this._included.data = included.map(e => new AssetReference(CollisionGroup, e));
        }
    }

    getExcluded() {
        return this._excluded;
    }

    getIncluded() {
        return this._included;
    }
}
