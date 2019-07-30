import { Component } from "../../core/Component";
import { Entity } from "../../core/Entity";
import { IKSolverBase } from "./IKSolverBase";
import { Reference } from "../../serialization/Reference";
import * as Attributes from "../../core/Attributes";
import { ComponentReference } from "../../serialization/ComponentReference";
import { IKEffector } from "./IKEffector";
import { IKGenericSolver } from "./IKGenericSolver";

@Attributes.exclusiveWith("IKEffector")
export class IKSolver extends Component {

    set effector(effector: IKEffector | null) {        
        this._effector.component = effector;
    }

    get effector() {
        return this._effector.component;
    }

    set solver(solver: IKSolverBase | undefined) {
        const previousSolver = this._solver.instance;
        if (previousSolver) {
            Object.assign(previousSolver, {
                getEntity: () => null,
                getEffector: () => null
            });
        }
        this._solver.instance = solver;
        if (solver) {
            Object.assign(solver, {
                getEntity: () => this.entity,
                getEffector: () => this.effector
            });
        }
    }

    private _solver = new Reference(IKSolverBase, new IKGenericSolver());
    private _effector = new ComponentReference(IKEffector);

    update() {
        const solver = this._solver.instance;
        if (solver) {
            solver.update();
        }
    }

    setEntity(entity: Entity) {
        super.setEntity(entity);
        this.solver = this._solver.instance;
    }
}
