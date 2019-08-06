
import { CollisionShape } from "./CollisionShape";
import { Collider } from "./Collider";

export class CollisionInfo {
    self!: Collider;
    collider!: Collider;    
    myShape!: CollisionShape;
    otherShape!: CollisionShape;
    particleIndex?: number;
}
