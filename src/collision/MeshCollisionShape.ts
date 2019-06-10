import { CollisionShape } from "./CollisionShape";
import { Transform } from "../core/Transform";
import { AssetReference } from "../serialization/AssetReference";
import { StaticMeshAsset } from "../assets/StaticMeshAsset";
import { ObjectProps } from "../core/Types";

export class MeshCollisionShape extends CollisionShape {
    tag = "Mesh";
    mesh = new AssetReference(StaticMeshAsset);

    constructor(props?: ObjectProps<MeshCollisionShape>) {
        super();
        if (props) {
            this.setState(props);
        }
    }

    checkCollisions(
        other: CollisionShape, 
        myTransform: Transform, 
        otherTransform: Transform, 
        onCollision: (particleIndex?: number) => void
    ) {
        // TODO
    }
}
