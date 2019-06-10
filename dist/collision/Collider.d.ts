import { CollisionShape } from "./CollisionShape";
import { CollisionGroup } from "./CollisionGroup";
import { Component } from "../core/Component";
import { SyncEvent } from "ts-events";
import { CollisionInfo } from "./CollisionInfo";
import { SerializedObject } from "../core/SerializableObject";
import { ObjectProps } from "../core/Types";
export declare class Collider extends Component {
    readonly version: number;
    readonly group: CollisionGroup | null;
    shapes: CollisionShape[];
    onCollision: ((info: CollisionInfo) => void) | null;
    /**
     * @event
     */
    readonly collision: SyncEvent<CollisionInfo>;
    private _group;
    private _shapes;
    private _collision;
    constructor(props?: ObjectProps<Collider>);
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
    addShape(shape: CollisionShape): void;
    destroy(): void;
}
