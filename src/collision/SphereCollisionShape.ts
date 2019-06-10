import { CollisionShape } from "./CollisionShape";
import { Vector3 } from "../math/Vector3";
import { BoxCollisionShape } from "./BoxCollisionShape";
import { Transform } from "../core/Transform";
import { CollisionUtils } from "./CollisionUtils";
import { ObjectProps } from "../core/Types";

export class SphereCollisionShape extends CollisionShape {
    tag = "Sphere";
    center = new Vector3();
    radius = 1;    

    constructor(props?: ObjectProps<SphereCollisionShape>) {
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
            let box = other as BoxCollisionShape;
            if (CollisionUtils.boxIntersectsWithSphereShape(box, otherTransform, this, myTransform)) {
                onCollision();
            }
        } else if (other.isA(SphereCollisionShape)) {
            let sphere = other as SphereCollisionShape;
            if (CollisionUtils.sphereIntersectsWithSphereShape(this, myTransform, sphere, otherTransform)) {
                onCollision();
            }
        }
    }
}
