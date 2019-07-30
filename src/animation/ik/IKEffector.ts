import { Component } from "../../core/Component";
import * as Attributes from "../../core/Attributes";
import { Entity } from "../../core/Entity";
import { Transform } from "../../core/Transform";

@Attributes.exclusiveWith("IKSolver")
export class IKEffector extends Component {
    setEntity(entity: Entity) {
        super.setEntity(entity);
        entity.getOrSetComponent(Transform);
    }
}
