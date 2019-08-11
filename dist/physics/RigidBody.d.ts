import * as Cannon from "cannon";
import { PhysicsContext } from "./PhysicsContext";
import { Component } from "../core/Component";
export declare enum RigidBodyType {
    Static,
    Dynamic,
    Kinematic
}
export declare class RigidBody extends Component {
    mass: number;
    readonly body: Cannon.Body;
    type: number;
    private _mass;
    private _type;
    private _rigidBody;
    private _cannonPlaneRotationAdjustment;
    update(context: PhysicsContext): void;
    destroy(): void;
    private onCollision;
    private applyTransformToRigidBody;
}
