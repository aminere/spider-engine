import { Vector3 } from "../math/Vector3";
import { Collider } from "./Collider";
import { CollisionShape } from "./CollisionShape";

export class RaycastResult {
    position = new Vector3();
    normal = new Vector3();
    collider!: Collider;
    shape!: CollisionShape;
}
