import { Component } from "../core/Component";
import { Vector3 } from "../math/Vector3";
import { Collider } from "./Collider";
import { CollisionGroup } from "./CollisionGroup";
import { SerializedObject } from "../core/SerializableObject";
export declare class CharacterCollider extends Component {
    readonly version: number;
    gravity: Vector3;
    radius: Vector3;
    desiredVelocity: Vector3;
    readonly velocity: Vector3;
    readonly group: CollisionGroup | null;
    private _gravity;
    private _radius;
    private _group;
    private _filter;
    private _velocity;
    private _desiredVelocity;
    update(_colliders: Collider[]): void;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
}
