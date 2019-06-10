
import { Asset } from "./Asset";
import * as Attributes from "../core/Attributes";
import { SerializedObjectType } from "../serialization/SerializedTypes";
import { SerializerUtils } from "../serialization/SerializerUtils";
import { Entity, SerializedEntity } from "../core/Entity";
import { SerializedObject } from "../core/SerializableObject";

export interface SerializedPrefab {
    typeName: string;
    version: number;
    id: string;
    name: string;
    root: SerializedEntity;
}

@Attributes.editable(false)
@Attributes.creatable(false)
export class Prefab extends Asset {  
    
    get version() { return 2; }

    root: Entity;

    constructor() {
        super();
        this.root = new Entity();
    }

    isLoaded() {
        return this.root.isLoaded();
    }

    serialize(): SerializedPrefab {
        return {
            typeName: this.constructor.name,
            version: this.version,
            id: this.id,
            name: this.name,
            root: SerializerUtils.serializeEntity(this.root)
        };
    }
    
    deserialize(_json: SerializedObjectType) {
        const json = _json as SerializedPrefab;
        if (json.version === 1) {
            const oldJson = (_json as SerializedObject);
            // tslint:disable-next-line
            json.root = oldJson.properties.root as any;
            // tslint:disable-next-line
            json.id = oldJson.properties.id as any;
            // tslint:disable-next-line
            json.name = oldJson.properties.name as any;
        }
        this.id = json.id;
        this.name = json.name;
        SerializerUtils.deserializeEntity(this.root, json.root, true);
        return Promise.resolve(this);
    }
}
