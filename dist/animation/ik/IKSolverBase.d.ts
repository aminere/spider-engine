import { SerializableObject } from "../../core/SerializableObject";
import { Entity } from "../../core/Entity";
import { IKEffector } from "./IKEffector";
export declare class IKSolverBase extends SerializableObject {
    protected getEntity: () => Entity | null;
    protected getEffector: () => IKEffector | null;
    update(): void;
}
