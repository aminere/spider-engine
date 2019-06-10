import { SerializableObject } from "./SerializableObject";
import { Entity } from "./Entity";
export declare class Component extends SerializableObject {
    readonly parent: Entity | undefined;
    readonly entity: Entity;
    readonly id: string;
    active: boolean;
    /**
     * @hidden
     */
    controller?: Component;
    private _entity;
    private _id;
    private _active;
    setEntity(entity: Entity): void;
    isLoaded(): boolean;
    reset(): void;
}
