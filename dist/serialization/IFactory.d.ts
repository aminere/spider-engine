import { SerializableObject } from "../core/SerializableObject";
import { AssetReference } from "./AssetReference";
import { Asset } from "../assets/Asset";
import { ReferenceBase } from "./Reference";
import { ComponentReference } from "./ComponentReference";
import { ArrayProperty } from "./ArrayProperty";
import { ReferenceArray } from "./ReferenceArray";
import { AssetReferenceArray } from "./AssetReferenceArray";
import { Component } from "../core/Component";
import { Constructor } from "../core/Types";
export interface IFactory {
    registerObject: <T extends SerializableObject, U>(ctor: Constructor<T>, parentType?: Constructor<U>, isAbstract?: boolean) => void;
    createObject: (typeName: string, ...args: any[]) => SerializableObject | null;
    createReference: (typeName: string, data?: SerializableObject) => ReferenceBase | null;
    createAssetReference: (typeName: string) => AssetReference<Asset> | null;
    createAssetReferenceArray: (typeName: string, data?: AssetReference<Asset>[]) => AssetReferenceArray<Asset> | null;
    createComponentReference: (typeName: string) => ComponentReference<Component> | null;
    createObjectArray: (typeName: string, data?: SerializableObject[]) => ArrayProperty<SerializableObject> | null;
    createReferenceArray: (typeName: string, data?: ReferenceBase[]) => ReferenceArray<SerializableObject> | null;
    isAbstract: (typeName: string) => boolean;
}
/**
 * @hidden
 */
export declare class IFactoryInternal {
    static instance: IFactory;
}
