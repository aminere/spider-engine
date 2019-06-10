import { Vector3 } from "../math/Vector3";
import { Collider } from "./Collider";
import { CollisionShape } from "./CollisionShape";
export declare class RaycastResult {
    position: Vector3;
    normal: Vector3;
    collider: Collider;
    shape: CollisionShape;
}
