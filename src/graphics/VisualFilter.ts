import { SerializableObject } from "../core/SerializableObject";
import { AssetReferenceArray } from "../serialization/AssetReferenceArray";
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
