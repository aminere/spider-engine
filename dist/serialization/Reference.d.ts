import { SerializableObject, SerializedObject } from "../core/SerializableObject";
/**
 * @hidden
 */
export declare class ReferenceBase {
    baseTypeName: () => string;
    getInstance: () => SerializableObject | undefined;
}
/**
 * @hidden
 */
export declare class Reference<T extends SerializableObject> extends ReferenceBase {
    instance?: T;
    constructor(ctor: {
        new (): T;
    }, instance?: T);
}
/**
 * @hidden
 */
export interface SerializedReference {
    baseTypeName: string;
    data?: SerializedObject;
}
