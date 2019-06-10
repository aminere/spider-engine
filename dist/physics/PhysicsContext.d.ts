import { Vector3 } from "../math/Vector3";
import * as Cannon from "cannon";
import { Component } from "../core/Component";
export declare enum PhysicsBroadPhaseType {
    Naive = 0,
    Grid = 1,
    SAP = 2
}
/**
 * @hidden
 */
export declare class PhysicsBroadPhaseTypeMetadata {
    static literals: {
        Naive: number;
        Grid: number;
        SAP: number;
    };
}
export declare class PhysicsContext extends Component {
    broadPhase: number;
    gravity: Vector3;
    solverIterations: number;
    world: Cannon.World;
    private _gravity;
    private _broadPhase;
    private _solverIterations;
    private _world;
    update(): void;
    destroy(): void;
    private beginContact;
    private endContact;
}
