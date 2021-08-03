import { Entity } from "../core/Entity";
import { Debug } from "../io/Debug";
import { Entities } from "../core/Entities";

export class EntityReference {    

    get id() { return this._id; }
    set id(id: string | undefined) { 
        if (id === this._id) {
            return;
        }

        this._id = id;
        this._resolved = false;
    }

    get entity() {
        if (!this._id) {
            return null;
        }
        if (!this._resolved) {
            this._entity = Entities.get(this._id);
            if (!this._entity) {
                Debug.log(`A missing entity (id: '${this._id}') is still referenced by the scene.`);
            }
            this._resolved = true;
        }        
        return this._entity;
    }

    set entity(entity: Entity | null) {
        if (entity) {
            this._id = entity.id;
            this._entity = entity;            
        } else {
            delete this._id;
            this._entity = null;
        }
        this._resolved = true;
    }

    private _id?: string;

    private _entity: Entity | null = null;
    private _resolved = false;    

    constructor(id?: string) {        
        this._id = id;
        this._resolved = false;
    }
}
