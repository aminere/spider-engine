import { AssetReferenceArray } from "../serialization/AssetReferenceArray";
import { VisualFilter } from "./VisualFilter";
import { VisualGroup } from "./VisualGroup";
export declare class InclusionVisualFilter extends VisualFilter {
    private _included;
    constructor(included?: VisualGroup[]);
    getIncluded(): AssetReferenceArray<VisualGroup>;
}
export declare class ExclusionVisualFilter extends VisualFilter {
    private _excluded;
    constructor(excluded?: VisualGroup[]);
    getExcluded(): AssetReferenceArray<VisualGroup>;
}
