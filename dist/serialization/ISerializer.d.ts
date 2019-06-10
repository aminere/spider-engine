import { VertexBuffer } from "../graphics/VertexBuffer";
import { SerializableObject, SerializedObject } from "../core/SerializableObject";
export interface ISerializer {
    copyVertexBuffer: (vb: VertexBuffer) => VertexBuffer;
    serializeObject: (o: SerializableObject) => SerializedObject;
    deserializeObject: (target: SerializableObject, json: SerializedObject) => void;
}
/**
 * @hidden
 */
export declare class ISerializerInternal {
    static instance: ISerializer;
}
