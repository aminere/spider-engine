import { Component } from "../core/Component";
import { Constructor } from "../core/Types";
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
    constructor(ctor: Constructor<T>, entityId?: string);
}
