import { SerializableObject } from "./SerializableObject";
import { Entity } from "./Entity";
export declare class Component extends SerializableObject {
    get parent(): Entity | undefined;
    get entity(): Entity;
    get id(): string;
    get active(): boolean;
    set active(active: boolean);
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
    onReplace(previous: Component): void;
}
