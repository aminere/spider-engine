import { Component } from "../../core/Component";
import { Entity } from "../../core/Entity";
import { IKSolverBase } from "./IKSolverBase";
import { IKEffector } from "./IKEffector";
export declare class IKSolver extends Component {
    effector: IKEffector | null;
    solver: IKSolverBase | undefined;
    private _solver;
    private _effector;
    update(): void;
    setEntity(entity: Entity): void;
}
