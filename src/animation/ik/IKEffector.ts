import { Component } from "../../core/Component";
import * as Attributes from "../../core/Attributes";
import { Entity } from "../../core/Entity";
import { Transform } from "../../core/Transform";
import { MathEx } from "../../math/MathEx";

@Attributes.exclusiveWith("IKSolver")
export class IKEffector extends Component {

    set influence(influence: number) {
        this._influence = MathEx.clamp(influence, 0, 1);
    }

    get influence() {
        return this._influence;
    }

    private _influence = 1;

    setEntity(entity: Entity) {
        super.setEntity(entity);
        entity.getOrSetComponent(Transform);
    }
}
