import { SerializableObject } from "../../core/SerializableObject";
import { Entity } from "../../core/Entity";
import { IKEffector } from "./IKEffector";

export class IKSolverBase extends SerializableObject {
    protected getEntity = () => { return null as Entity | null; };
    protected getEffector = () => { return null as IKEffector | null; };

    update() {        
    }
}
