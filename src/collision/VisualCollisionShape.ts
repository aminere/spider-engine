import { CollisionShape } from "./CollisionShape";
import { Transform } from "../core/Transform";
import { ComponentReference } from "../serialization/ComponentReference";
import { Visual } from "../graphics/Visual";
import { Entity } from "../core/Entity";
import { ObjectProps } from "../core/Types";

export class VisualCollisionShape extends CollisionShape {
    tag = "Visual";

    set visualEntity(entity: Entity) { this._visual.component = entity.getComponent(Visual); }
    get visual() { return this._visual.component; }

    private _visual = new ComponentReference<Visual>(Visual);

    constructor(props?: ObjectProps<VisualCollisionShape>) {
        super();
        if (props) {
            this.setState(props);
        }
    }

    checkCollisions(
        other: CollisionShape, 
        myTransform: Transform, 
        otherTransform: Transform, 
        onCollision: (particleIndex?: number) => void
    ) {
        // TODO
    }
}
