import { CollisionShape } from "./CollisionShape";
import { Collider } from "./Collider";
export declare class CollisionInfo {
    self: Collider;
    collider: Collider;
    myShape: CollisionShape;
    otherShape: CollisionShape;
    particleIndex?: number;
}
