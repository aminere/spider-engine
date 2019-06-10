import { CollisionShape } from "./CollisionShape";
import { Vector3 } from "../math/Vector3";
import { Transform } from "../core/Transform";
import { ObjectProps } from "../core/Types";
export declare class SphereCollisionShape extends CollisionShape {
    tag: string;
    center: Vector3;
    radius: number;
    constructor(props?: ObjectProps<SphereCollisionShape>);
    checkCollisions(other: CollisionShape, myTransform: Transform, otherTransform: Transform, onCollision: (particleIndex?: number) => void): void;
}
