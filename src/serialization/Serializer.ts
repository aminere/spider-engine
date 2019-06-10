import { ISerializer, ISerializerInternal } from "./ISerializer";
import { VertexBuffer } from "../graphics/VertexBuffer";
import { PropertyFactory } from "./PropertyFactory";
import { SerializableObject, SerializedObject } from "../core/SerializableObject";
import { SerializerUtils } from "./SerializerUtils";

export class Serializer implements ISerializer {

    copyVertexBuffer(vb: VertexBuffer) {
        let data = PropertyFactory.properties.VertexBuffer.writeProperty(vb);
        let copy = PropertyFactory.properties.VertexBuffer.readProperty(JSON.parse(JSON.stringify(data)));
        return copy;
    }

    serializeObject(o: SerializableObject) {
        return SerializerUtils.serializeObject(o);
    }

    deserializeObject(target: SerializableObject, json: SerializedObject) {
        SerializerUtils.deserializeObject(target, json);
    }
}

/**
 * @hidden
 */
export namespace SerializerInternal {
    export function create() {
        ISerializerInternal.instance = new Serializer();
    }
}
