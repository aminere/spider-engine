import { SerializedObjectType } from "../serialization/SerializedTypes";
import { ObjectProps } from "./Types";
export interface SerializedProperty {
    typeName?: string;
    data: any;
}
export interface SerializedObject {
    typeName?: string;
    version: number;
    properties: {
        [propertyName: string]: SerializedProperty;
    };
}
export declare class SerializableObject {
    isA<T>(type: {
        new (...args: any[]): T;
    }): boolean;
    copy(): SerializableObject;
    destroy(): void;
    setProperty(name: string, value: any): void;
    serialize(): SerializedObjectType;
    deserialize(json: SerializedObjectType): Promise<SerializableObject> | SerializableObject;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
    setState<T>(props: ObjectProps<T>): void;
}
