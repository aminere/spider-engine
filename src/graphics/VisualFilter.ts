import { SerializableObject } from "../core/SerializableObject";
import { AssetReferenceArray } from "../serialization/AssetReferenceArray";
import { AssetReference } from "../serialization/AssetReference";
import * as Attributes from "../core/Attributes";
import { VisualGroup } from "./VisualGroup";

namespace Private {
    export const emptyArray = new AssetReferenceArray(VisualGroup);
}

export class VisualFilter extends SerializableObject {
    getIncluded() { return Private.emptyArray; }
    getExcluded() { return Private.emptyArray; }
    detach() {
        this.getExcluded().detach();
        this.getIncluded().detach();
    }

    canRender(group: VisualGroup | null) {
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
