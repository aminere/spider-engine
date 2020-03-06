import { Component } from "../core/Component";
import { Vector3 } from "../math/Vector3";
import { Collider } from "./Collider";
import { CollisionGroup } from "./CollisionGroup";
import { SerializedObject } from "../core/SerializableObject";
export declare class CharacterCollider extends Component {
    get version(): number;
    set gravity(gravity: Vector3);
    get gravity(): Vector3;
    set radius(radius: Vector3);
    get radius(): Vector3;
    set desiredVelocity(velocity: Vector3);
    get velocity(): Vector3;
    get group(): CollisionGroup | null;
    private _gravity;
    private _radius;
    private _group;
    private _filter;
    private _velocity;
    private _desiredVelocity;
    update(_colliders: Collider[]): void;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
}
