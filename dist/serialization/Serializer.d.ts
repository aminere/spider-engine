import { ISerializer } from "./ISerializer";
import { VertexBuffer } from "../graphics/VertexBuffer";
import { SerializableObject, SerializedObject } from "../core/SerializableObject";
export declare class Serializer implements ISerializer {
    copyVertexBuffer(vb: VertexBuffer): VertexBuffer;
    serializeObject(o: SerializableObject): SerializedObject;
    deserializeObject(target: SerializableObject, json: SerializedObject): void;
}
export declare namespace SerializerInternal {
    function create(): void;
}
