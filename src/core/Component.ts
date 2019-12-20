import { SerializableObject } from "./SerializableObject";
import * as Attributes from "./Attributes";
import { Entity, EntityInternal } from "./Entity";
import { EngineUtils } from "./EngineUtils";
import { IFactoryInternal } from "../serialization/IFactory";

export class Component extends SerializableObject {

    get parent() { return this._entity.parent; }
    get entity() { return this._entity; }
    get id() { return this._id; }
    get active() { return this._active; }
    set active(active: boolean) { this._active = active; }   

    /**
     * @hidden
     */
    @Attributes.hidden()
    @Attributes.unserializable()
    controller?: Component;

    @Attributes.hidden()
    @Attributes.unserializable()
    private _entity!: Entity;

    @Attributes.unserializable()
    private _id = EngineUtils.makeUniqueId();

    @Attributes.hidden()
    private _active = true;

    setEntity(entity: Entity) {
        this._entity = entity;
    }

    isLoaded() {
        return EngineUtils.isObjectLoaded(this);
    }

    reset() {
        const typeName = this.constructor.name;
        const fresh = IFactoryInternal.instance.createObject(typeName) as Component;
        EntityInternal.setComponentFromInstance(this.entity, fresh);
    }

    onReplace(previous: Component) {
    }
}
