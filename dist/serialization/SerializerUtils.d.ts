import { Entity, SerializedEntity } from "../core/Entity";
import { SerializableObject, SerializedObject } from "../core/SerializableObject";
import { Component } from "../core/Component";
/**
 * @hidden
 */
export declare namespace SerializerUtilsInternal {
    let serializeIdsAsPaths: boolean;
}
export declare class SerializerUtils {
    static serializeEntity(e: Entity, serializeNonPersistentObjects?: boolean): SerializedEntity;
    static deserializeEntity(entity: Entity, json: SerializedEntity, persistent?: boolean): void;
    static serializeEntityWithPrefabRefs(e: Entity): SerializedEntity;
    static serializeObject(o: SerializableObject): SerializedObject;
    static deserializeObject(target: SerializableObject, json: SerializedObject): void;
    static serializeNonPersistentObjects(enable?: boolean): void;
    static clearNonPersistentObjectCache(): void;
    static serializeProperty(data: any, _typeName?: string): any;
    static deserializeProperty(target: SerializableObject | any[], index: string | number, typeName: string, data: any, tryUseSetter?: boolean): void;
    static getPropertyTypeName(property: any): string;
    static copyProperty(src: SerializableObject, dest: SerializableObject, propertyId: string): boolean;
    static getSerializablePropertyTypeName(obj: object, propertyId: string): string | null;
    static setProperty(target: SerializableObject | any[], property: string | number, value: any, tryUseSetter?: boolean): void;
    static isDynamicProperty(typeName: string, property: string): boolean;
    static isPropertySerializable(typeName: string, property: string): boolean;
    static getObjectVersion(obj: SerializableObject): number;
    static serializeProperties(o: SerializableObject, json: SerializedObject): void;
    static serializeComponent(o: Component): SerializedObject;
    static serializeComponents(components: Component[]): {
        [typeName: string]: SerializedObject;
    };
}
