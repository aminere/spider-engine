import { SerializableObject } from "../core/SerializableObject";
import { AssetReferenceArray } from "../serialization/AssetReferenceArray";
import { VisualGroup } from "./VisualGroup";
export declare class VisualFilter extends SerializableObject {
    getIncluded(): AssetReferenceArray<VisualGroup>;
    getExcluded(): AssetReferenceArray<VisualGroup>;
    detach(): void;
    canRender(group: VisualGroup | null): boolean;
}
