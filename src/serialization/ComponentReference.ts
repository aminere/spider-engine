import { Entity, EntityInternal } from "../core/Entity";
import { Debug } from "../io/Debug";
import { SerializableObject } from "../core/SerializableObject";
import { Entities } from "../core/Entities";
import { Component } from "../core/Component";
import { RTTI } from "../core/RTTI";

export interface SerializedComponentReference {
    entityId?: string;
    componentTypeName: string;
}

export class ComponentReference<T extends Component> {    

    get entityId() { return this._entityId; }
    set entityId(id: string | undefined) { 
        if (id === this._entityId) {
            return;
        }

        this._entityId = id; 
        this._resolved = false;
    }
    get componentTypeName() { return this._componentTypeName; }

    set component(component: T | null) {        
        if (component) {
            if (process.env.CONFIG === "editor") {
                console.assert(RTTI.isObjectOfType(component.constructor.name, this._componentTypeName));
            }
            this._componentTypeName = component.constructor.name;
            this._entity = component.entity;
            this._entityId = component.entity.id;
        } else {
            delete this._entity;
            delete this._entityId;
        }
        this._resolved = true;
    }

    get component(): T | null {
        if (!this._entityId) {
            return null;
        }
        if (!this._resolved) {
            this._entity = Entities.get(this._entityId);
            if (!this._entity) {
                Debug.logWarning(`A missing entity (id: '${this._entityId}') is still referenced by the scene`);
            }
            this._resolved = true;
        }
        return this._entity ? EntityInternal.getComponentByName(this._entity, this._componentTypeName) as T : null;
    }

    private _entityId?: string;
    private _componentTypeName: string;

    private _entity: Entity | null = null;
    private _resolved = false;

    constructor(ctor: new() => SerializableObject, entityId?: string) {        
        this._componentTypeName = ctor.name;
        this._entityId = entityId;
        this._resolved = false;
    }
}
