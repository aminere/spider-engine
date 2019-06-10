import { CollisionShape } from "./CollisionShape";
import { Transform } from "../core/Transform";
import { Plane } from "../math/Plane";
import { ObjectProps } from "../core/Types";

export class PlaneCollisionShape extends CollisionShape {
    plane = new Plane();
    
    constructor(props?: ObjectProps<PlaneCollisionShape>) {
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
