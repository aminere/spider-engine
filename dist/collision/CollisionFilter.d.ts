import { SerializableObject } from "../core/SerializableObject";
import { AssetReferenceArray } from "../serialization/AssetReferenceArray";
import { CollisionGroup } from "./CollisionGroup";
export declare class CollisionFilter extends SerializableObject {
    getIncluded(): AssetReferenceArray<CollisionGroup>;
    getExcluded(): AssetReferenceArray<CollisionGroup>;
    detach(): void;
    canCollideWith(group: CollisionGroup | null): boolean;
}
export declare class InclusionCollisionFilter extends CollisionFilter {
    private _included;
    constructor(included?: CollisionGroup[]);
    getIncluded(): AssetReferenceArray<CollisionGroup>;
}
export declare class ExclusionCollisionFilter extends CollisionFilter {
    private _excluded;
    constructor(excluded?: CollisionGroup[]);
    getExcluded(): AssetReferenceArray<CollisionGroup>;
}
