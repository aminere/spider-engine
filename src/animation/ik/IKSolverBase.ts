import { SerializableObject } from "../../core/SerializableObject";
import { Entity } from "../../core/Entity";

export class IKSolverBase extends SerializableObject {
    protected getEntity = () => { return null as Entity | null; };
    protected getEffector = () => { return null as Entity | null; };

    update() {        
    }
}
