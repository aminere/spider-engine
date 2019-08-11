import { CollisionShape } from "./CollisionShape";
import { Transform } from "../core/Transform";
export declare class PlaneCollisionShape extends CollisionShape {
    checkCollisions(other: CollisionShape, myTransform: Transform, otherTransform: Transform, onCollision: (particleIndex?: number) => void): void;
}
