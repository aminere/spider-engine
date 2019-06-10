import { CollisionShape } from "./CollisionShape";
import { Vector3 } from "../math/Vector3";
import { SphereCollisionShape } from "./SphereCollisionShape";
import { CollisionUtils } from "./CollisionUtils";
import { Transform } from "../core/Transform";
import { ObjectProps } from "../core/Types";

export class BoxCollisionShape extends CollisionShape {
    tag = "Box";
    center = new Vector3();
    extent = new Vector3(1, 1, 1);    

    constructor(props?: ObjectProps<BoxCollisionShape>) {
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
        if (other.isA(BoxCollisionShape)) {
            const box = other as BoxCollisionShape;
            if (CollisionUtils.boxIntersectsWithBox(this, myTransform.worldPosition, box, otherTransform.worldPosition)) {
                onCollision();
            }
        } else if (other.isA(SphereCollisionShape)) {
            const sphere = other as SphereCollisionShape;
            if (CollisionUtils.boxIntersectsWithSphereShape(this, myTransform, sphere, otherTransform)) {
                onCollision();
            }
        }
    }
}
