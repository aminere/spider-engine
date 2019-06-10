import { SerializableObject } from "../core/SerializableObject";
import { Component } from "../core/Component";
export interface SerializedComponentReference {
    entityId?: string;
    componentTypeName: string;
}
export declare class ComponentReference<T extends Component> {
    entityId: string | undefined;
    readonly componentTypeName: string;
    component: T | null;
    private _entityId?;
    private _componentTypeName;
    private _entity;
    private _resolved;
    constructor(ctor: new () => SerializableObject, entityId?: string);
}
