import * as Cannon from "cannon";
import { PhysicsContext } from "./PhysicsContext";
import { Component } from "../core/Component";
export declare enum RigidBodyType {
    Static = 0,
    Dynamic = 1,
    Kinematic = 2
}
/**
 * @hidden
 */
export declare class RigidBodyTypeMetadata {
    static literals: {
        Static: number;
        Dynamic: number;
        Kinematic: number;
    };
}
export declare class RigidBody extends Component {
    mass: number;
    readonly body: Cannon.Body;
    type: number;
    private _mass;
    private _type;
    private _rigidBody;
    update(context: PhysicsContext): void;
    destroy(): void;
    private onCollision;
}
