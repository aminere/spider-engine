import { Collider } from "./Collider";
import { CharacterCollider } from "./CharacterCollider";
/**
 * @hidden
 */
export declare namespace CollisionSystemInternal {
    function clearCollisions(): void;
}
export declare class CollisionSystem {
    static update(colliders: Collider[], characterColliders: CharacterCollider[]): void;
}
