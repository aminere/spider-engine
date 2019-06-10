import { Vector3 } from "../math/Vector3";
import { BoxCollisionShape } from "./BoxCollisionShape";
import { SphereCollisionShape } from "./SphereCollisionShape";
import { Collider } from "./Collider";
import { VertexBuffer } from "../graphics/VertexBuffer";
import { CollisionGroup } from "./CollisionGroup";
import { Transform } from "../core/Transform";
/**
 * @hidden
 */
export declare class CollisionUtils {
    static readonly boxMesh: VertexBuffer;
    static readonly sphereMesh: VertexBuffer;
    static boxIntersectsWithSphereShape(box: BoxCollisionShape, boxTransform: Transform, sphere: SphereCollisionShape, sphereTransform: Transform): boolean;
    static boxIntersectsWithSphere(box: BoxCollisionShape, boxWorldPos: Vector3, center: Vector3, radius: number): boolean;
    static boxIntersectsWithBox(box1: BoxCollisionShape, boxWorldPos1: Vector3, box2: BoxCollisionShape, boxWorldPos2: Vector3): boolean;
    static sphereIntersectsWithSphereShape(sphere1: SphereCollisionShape, sphere1Transform: Transform, sphere2: SphereCollisionShape, sphere2Transform: Transform): boolean;
    static sphereIntersectsWithSphere(sphere1Center: Vector3, sphere1Radius: number, sphere2Center: Vector3, sphere2Radius: number): boolean;
    static moveSphere(_position: Vector3, _radius: number, _velocity: Vector3, _colliders: Collider[], positionOut: Vector3, velocityOut: Vector3, contactNormal?: Vector3, include?: CollisionGroup[], exclude?: CollisionGroup[]): boolean;
}
