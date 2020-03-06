import { Component } from "../core/Component";
import { Constructor } from "../core/Types";
export interface SerializedComponentReference {
    entityId?: string;
    typeName: string;
}
export declare class ComponentReference<T extends Component> {
    get entityId(): string | undefined;
    set entityId(id: string | undefined);
    get typeName(): string;
    set component(component: T | null);
    get component(): T | null;
    private _entityId?;
    private _typeName;
    private _entity;
    private _resolved;
    constructor(ctor: Constructor<T>, entityId?: string);
}
