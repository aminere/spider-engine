import { CollisionShape } from "./CollisionShape";
import { Vector3 } from "../math/Vector3";
import { Transform } from "../core/Transform";
import { ObjectProps } from "../core/Types";
export declare class BoxCollisionShape extends CollisionShape {
    tag: string;
    center: Vector3;
    extent: Vector3;
    constructor(props?: ObjectProps<BoxCollisionShape>);
    checkCollisions(other: CollisionShape, myTransform: Transform, otherTransform: Transform, onCollision: (particleIndex?: number) => void): void;
}
