import { IKSolverBase } from "./IKSolverBase";
import { SerializableObject } from "../../core/SerializableObject";
export declare enum Axis {
    X = 0,
    Y = 1,
    Z = 2
}
export declare class BaseRotation extends SerializableObject {
    axis: Axis;
    angle: number;
}
export declare class IKGenericSolver extends IKSolverBase {
    baseRotation: BaseRotation;
    private _ikSolver;
    private _nodes;
    private _entity;
    private _chainTransformChanged;
    private _effectorTransformChanged;
    update(): void;
    destroy(): void;
}
