import { Vector3 } from "../math/Vector3";
import * as Cannon from "cannon";
import { Component } from "../core/Component";
export declare enum PhysicsBroadPhaseType {
    Naive = 0,
    Grid = 1,
    SAP = 2
}
export declare class PhysicsContext extends Component {
    set broadPhase(broadPhase: number);
    set gravity(gravity: Vector3);
    set solverIterations(iterations: number);
    get world(): Cannon.World;
    set world(world: Cannon.World);
    private _gravity;
    private _broadPhase;
    private _solverIterations;
    private _world;
    update(): void;
    destroy(): void;
    private beginContact;
    private endContact;
}
