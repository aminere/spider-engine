import { CollisionShape } from "./CollisionShape";
import { Transform } from "../core/Transform";
import { AssetReference } from "../serialization/AssetReference";
import { StaticMeshAsset } from "../assets/StaticMeshAsset";
import { ObjectProps } from "../core/Types";
export declare class MeshCollisionShape extends CollisionShape {
    tag: string;
    mesh: AssetReference<StaticMeshAsset>;
    constructor(props?: ObjectProps<MeshCollisionShape>);
    checkCollisions(other: CollisionShape, myTransform: Transform, otherTransform: Transform, onCollision: (particleIndex?: number) => void): void;
}
