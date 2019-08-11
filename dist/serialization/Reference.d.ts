import { SerializableObject, SerializedObject } from "../core/SerializableObject";
import { Constructor } from "../core/Types";
export declare class ReferenceBase {
    baseTypeName: () => string;
    getInstance: () => SerializableObject | undefined;
}
export declare class Reference<T extends SerializableObject> extends ReferenceBase {
    instance?: T;
    constructor(ctor: Constructor<T>, instance?: T);
}
export interface SerializedReference {
    baseTypeName: string;
    data?: SerializedObject;
}
