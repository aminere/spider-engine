import { Vector3 } from "../math/Vector3";
import { BoxCollisionShape } from "./BoxCollisionShape";
import { SphereCollisionShape } from "./SphereCollisionShape";
import { Transform } from "../core/Transform";
export declare class CollisionUtils {
    static boxIntersectsWithSphereShape(box: BoxCollisionShape, boxTransform: Transform, sphere: SphereCollisionShape, sphereTransform: Transform): boolean;
    static boxIntersectsWithSphere(box: BoxCollisionShape, boxWorldPos: Vector3, center: Vector3, radius: number): boolean;
    static boxIntersectsWithBox(box1: BoxCollisionShape, boxWorldPos1: Vector3, box2: BoxCollisionShape, boxWorldPos2: Vector3): boolean;
    static sphereIntersectsWithSphereShape(sphere1: SphereCollisionShape, sphere1Transform: Transform, sphere2: SphereCollisionShape, sphere2Transform: Transform): boolean;
    static sphereIntersectsWithSphere(sphere1Center: Vector3, sphere1Radius: number, sphere2Center: Vector3, sphere2Radius: number): boolean;
}
