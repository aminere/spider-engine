
import * as Attributes from "../core/Attributes";
import { AssetReference } from "../serialization/AssetReference";
import { AssetReferenceArray } from "../serialization/AssetReferenceArray";
import { VisualFilter } from "./VisualFilter";
import { VisualGroup } from "./VisualGroup";

@Attributes.displayName("Include")
export class InclusionVisualFilter extends VisualFilter {

    private _included = new AssetReferenceArray(VisualGroup);

    constructor(included?: VisualGroup[]) {
        super();
        if (included) {
            this._included.data = included.map(e => new AssetReference(VisualGroup, e));
        }
    }

    getIncluded() {
        return this._included;
    }
}

@Attributes.displayName("Exclude")
export class ExclusionVisualFilter extends VisualFilter {

    private _excluded = new AssetReferenceArray(VisualGroup);

    constructor(excluded?: VisualGroup[]) {
        super();
        if (excluded) {
            this._excluded.data = excluded.map(e => new AssetReference(VisualGroup, e));
        }
    }

    getExcluded() {
        return this._excluded;
    }
}
