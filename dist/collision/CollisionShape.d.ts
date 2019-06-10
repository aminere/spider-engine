import { SerializableObject } from "../core/SerializableObject";
import { CollisionTestPriority } from "./CollisionTestPriority";
import { Transform } from "../core/Transform";
export declare class CollisionShape extends SerializableObject {
    getTestPriority(): CollisionTestPriority;
    checkCollisions(other: CollisionShape, myTransform: Transform, otherTransform: Transform, onCollision: (particleIndex?: number) => void): void;
}
