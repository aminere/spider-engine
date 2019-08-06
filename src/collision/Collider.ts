import { AssetReference } from "../serialization/AssetReference";
import { CollisionGroup } from "./CollisionGroup";
import { Component } from "../core/Component";
import { SyncEvent } from "ts-events";
import { CollisionInfo } from "./CollisionInfo";
import * as Attributes from "../core/Attributes";
import { SerializedObject } from "../core/SerializableObject";
import { ObjectProps } from "../core/Types";
import { Entity } from "../core/Entity";
import { Transform } from "../core/Transform";
import { Reference } from "../serialization/Reference";
import { CollisionFilter } from "./CollisionFilter";
import { CollisionShape } from "./CollisionShape";
import { ReferenceArray } from "../serialization/ReferenceArray";
import { BoxCollisionShape } from "./BoxCollisionShape";

export class Collider extends Component {    
    
    get version() { return 2; }

    get group() { return this._group.asset; }    
    get shapes() { 
        return this._shapes.data
            .filter(r => Boolean(r.instance))
            .map(r => r.instance as CollisionShape); 
    }

    set shapes(shapes: CollisionShape[]) {
        this._shapes.clear();
        shapes.forEach(shape => this._shapes.grow(shape));
    }

    set onCollision(callback: ((info: CollisionInfo) => void) | null) {
        this._collision.detach();
        if (callback) {
            this._collision.attach(callback);
        }
    }

    /**
     * @event
     */
    get collision() { return this._collision; }

    private _group = new AssetReference(CollisionGroup);
    private _filter = new Reference(CollisionFilter);

    @Attributes.defaultType("BoxCollisionShape")
    @Attributes.nullable(false)
    private _shapes = new ReferenceArray(CollisionShape);

    @Attributes.unserializable()
    private _collision = new SyncEvent<CollisionInfo>();    

    constructor(props?: ObjectProps<Collider>) {
        super();
        if (props) {
            this.setState(props);
        }
        if (this.shapes.length === 0) {
            this._shapes.grow(new BoxCollisionShape());
        }
    }    

    setEntity(entity: Entity) {
        super.setEntity(entity);
        entity.getOrSetComponent(Transform);
    }

    upgrade(json: SerializedObject, previousVersion: number) {
        if (previousVersion === 1) {
            Object.assign(json.properties, { _shapes: json.properties.shapes });
            delete json.properties.shapes;      
        }
        return json;
    }

    destroy() {
        super.destroy();
        this._collision.detach();
    }
}
