import { CollisionShape } from "./CollisionShape";
import { Transform } from "../core/Transform";
import { Plane } from "../math/Plane";
import { ObjectProps } from "../core/Types";
export declare class PlaneCollisionShape extends CollisionShape {
    plane: Plane;
    constructor(props?: ObjectProps<PlaneCollisionShape>);
    checkCollisions(other: CollisionShape, myTransform: Transform, otherTransform: Transform, onCollision: (particleIndex?: number) => void): void;
}
