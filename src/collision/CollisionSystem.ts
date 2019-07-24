import { ObjectPool } from "../core/ObjectPool";
import { CollisionInfo } from "./CollisionInfo";
import { Components } from "../core/Components";
import { Collider } from "./Collider";
import { BehaviorComponent } from "../behavior/BehaviorComponent";
import { CollisionShape } from "./CollisionShape";
import { CharacterCollider } from "./CharacterCollider";

namespace Private {
    export const collisions = new ObjectPool(CollisionInfo, 64);

    export function checkCollision(a: Collider, b: Collider) {
        for (const shape1 of a.shapes) {            
            if (!shape1) {
                continue;
            }
            for (const shape2 of b.shapes) {
                if (!shape2) {
                    continue;
                }
                if (shape1.getTestPriority() > shape2.getTestPriority()) {
                    shape1.checkCollisions(shape2, a.entity.transform, b.entity.transform, particleIndex => {
                        const collision = collisions.get();
                        collision.self = a;
                        collision.collider = b;
                        collision.myShape = shape1 as CollisionShape;
                        collision.otherShape = shape2 as CollisionShape;
                        collision.particleIndex = particleIndex;
                    });
                } else {
                    shape2.checkCollisions(shape1, b.entity.transform, a.entity.transform, particleIndex => {
                        const collision = collisions.get();
                        collision.self = a;
                        collision.collider = b;
                        collision.myShape = shape1 as CollisionShape;
                        collision.otherShape = shape2 as CollisionShape;
                        collision.particleIndex = particleIndex;
                    });
                }
            }
        }
    }    
}

/**
 * @hidden
 */
export namespace CollisionSystemInternal {
    export function clearCollisions() {
        Private.collisions.flush();
    }
}

export class CollisionSystem {
    static update() {

        // Check for Collisions
        Private.collisions.flush();
        const collisionChecked: { [id: string]: { [id: string]: boolean } } = {};
        const colliders = Components.ofType(Collider);
        for (const collider1 of colliders) {
            for (const collider2 of colliders) {
                if (collider1 === collider2) {
                    continue;
                }

                const collider1Checked = collisionChecked[collider1.id];
                if (collider1Checked && collider2.id in collider1Checked) {
                    continue;
                }

                // collision test
                Private.checkCollision(collider1, collider2);

                if (collider1Checked) {
                    collider1Checked[collider2.id] = true;
                } else {
                    collisionChecked[collider1.id] = {
                        [collider2.id]: true
                    };
                }

                const collider2Checked = collisionChecked[collider2.id];
                if (collider2Checked) {
                    collider2Checked[collider1.id] = true;
                } else {
                    collisionChecked[collider2.id] = {
                        [collider1.id]: true
                    };
                }
            }
        }

        // Handle more complex colliders
        Components.ofType(CharacterCollider).forEach(c => c.update());

        // call collision callbacks
        for (let i = 0; i < Private.collisions.size; ++i) {
            const collision = Private.collisions.peek(i);
            collision.self.collision.post(collision);
            const myBehavior = collision.self.entity.getComponent(BehaviorComponent);
            if (myBehavior) {
                myBehavior.onCollision(collision);
            }
            
            const otherCollision: CollisionInfo = {
                self: collision.collider,
                collider: collision.self,
                myShape: collision.otherShape,
                otherShape: collision.myShape,
                particleIndex: collision.particleIndex
            };
            collision.collider.collision.post(otherCollision);
            const otherBehavior = collision.collider.entity.getComponent(BehaviorComponent);
            if (otherBehavior) {
                otherBehavior.onCollision(otherCollision);
            }
        }
    }
}
