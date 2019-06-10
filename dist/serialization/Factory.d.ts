import { ReferenceBase } from "./Reference";
import { ReferenceArray } from "./ReferenceArray";
import { ArrayProperty } from "./ArrayProperty";
import { SerializableObject } from "../core/SerializableObject";
import { IFactory } from "./IFactory";
import { AssetReference } from "./AssetReference";
import { Asset } from "../assets/Asset";
import { ComponentReference } from "./ComponentReference";
import { AssetReferenceArray } from "./AssetReferenceArray";
import { Component } from "../core/Component";
import { Constructor } from "../core/Types";
export declare type TypeDefinition<T extends SerializableObject> = [Constructor<T>, Constructor<T>?];
export declare class Factory implements IFactory {
    registerObject<T extends SerializableObject, U>(ctor: Constructor<T>, parentType?: Constructor<U>, isAbstract?: boolean): void;
    createObject(typeName: string, ...args: any[]): SerializableObject | null;
    createReference(typeName: string, data?: SerializableObject): ReferenceBase | null;
    createAssetReference(typeName: string): AssetReference<Asset> | null;
    createAssetReferenceArray(typeName: string, data?: AssetReference<Asset>[]): AssetReferenceArray<Asset> | null;
    createComponentReference(typeName: string): ComponentReference<Component> | null;
    createObjectArray(typeName: string, data?: SerializableObject[]): ArrayProperty<SerializableObject> | null;
    createReferenceArray(typeName: string, data?: ReferenceBase[]): ReferenceArray<SerializableObject> | null;
    isAbstract(typeName: string): boolean;
}
/**
 * @hidden
 */
export declare class FactoryInternal {
    static create(customTypes?: TypeDefinition<SerializableObject>[]): void;
}
