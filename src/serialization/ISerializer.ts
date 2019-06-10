import { VertexBuffer } from "../graphics/VertexBuffer";
import { SerializableObject, SerializedObject } from "../core/SerializableObject";

export interface ISerializer {
    copyVertexBuffer: (vb: VertexBuffer) => VertexBuffer;
    serializeObject: (o: SerializableObject) => SerializedObject;
    deserializeObject: (target: SerializableObject, json: SerializedObject) => void;
}

namespace Private {
    export let instance: ISerializer;
}

/**
 * @hidden
 */
export class ISerializerInternal {
    static set instance(instance: ISerializer) {
        Private.instance = instance;
    }
    static get instance() {
        return Private.instance;
    }
}
