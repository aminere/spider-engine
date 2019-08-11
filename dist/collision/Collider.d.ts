import { CollisionGroup } from "./CollisionGroup";
import { Component } from "../core/Component";
import { SyncEvent } from "ts-events";
import { CollisionInfo } from "./CollisionInfo";
import { SerializedObject } from "../core/SerializableObject";
import { ObjectProps } from "../core/Types";
import { Entity } from "../core/Entity";
import { CollisionFilter } from "./CollisionFilter";
import { CollisionShape } from "./CollisionShape";
export declare class Collider extends Component {
    readonly version: number;
    readonly group: CollisionGroup | null;
    shapes: CollisionShape[];
    readonly filter: CollisionFilter | undefined;
    onCollision: ((info: CollisionInfo) => void) | null;
    /**
     * @event
     */
    readonly collision: SyncEvent<CollisionInfo>;
    private _group;
    private _filter;
    private _shapes;
    private _collision;
    constructor(props?: ObjectProps<Collider>);
    setEntity(entity: Entity): void;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
    destroy(): void;
}
