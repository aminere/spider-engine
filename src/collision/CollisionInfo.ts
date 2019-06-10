import { Collider } from "./Collider";
import { CollisionShape } from "./CollisionShape";

export class CollisionInfo {
    self!: Collider;
    collider!: Collider;    
    myShape!: CollisionShape;
    otherShape!: CollisionShape;
    particleIndex?: number;
}
