
import { ReferenceBase, Reference } from "./Reference";
import { ReferenceArray } from "./ReferenceArray";
import { ArrayProperty } from "./ArrayProperty";
import { SerializableObject } from "../core/SerializableObject";
import { Debug } from "../io/Debug";
import { IFactory, IFactoryInternal } from "./IFactory";
import { AssetReference } from "./AssetReference";
import { Asset } from "../assets/Asset";
import { ComponentReference } from "./ComponentReference";
import { AssetReferenceArray } from "./AssetReferenceArray";
import { Component } from "../core/Component";
import { TypeRegistration } from "../core/TypeRegistration";
import { RTTIInternal } from "../core/RTTI";
import { Constructor } from "../core/Types";

// <Type, ParentType> tuple
export type TypeDefinition<T extends SerializableObject> = [Constructor<T>, Constructor<T>?];

interface ObjectRegister {
    [typeName: string]: {
        // tslint:disable-next-line             
        createInstance: (...args: any[]) => SerializableObject;
        createReference: (data?: SerializableObject) => ReferenceBase;
        createAssetReference: () => AssetReference<Asset>;
        createComponentReference: () => ComponentReference<Component>;
        createObjectArray: (data?: SerializableObject[]) => ArrayProperty<SerializableObject>;
        createReferenceArray: (data?: ReferenceBase[]) => ReferenceArray<SerializableObject>;
        createAssetReferenceArray: (data?: AssetReference<Asset>[]) => AssetReferenceArray<Asset>;
        isAbstract?: boolean;
    };
}

namespace Private {
    export const objectRegister: ObjectRegister = {};

    export function getObjectInfo(typeName: string) {
        if (typeName in objectRegister) {
            return objectRegister[typeName];
        }
        Debug.logError(`Unknown object type: ${typeName}`);
        return null;
    }
}

export class Factory implements IFactory {

    registerObject<T extends SerializableObject, U>(ctor: Constructor<T>, parentType?: Constructor<U>, isAbstract?: boolean) {
        Private.objectRegister[ctor.name] = {
            // tslint:disable-next-line
            createInstance: (...args: any[]) => new ctor(...args),
            createReference: (data?: SerializableObject) => new Reference(ctor, data),            
            // TODO find legit was of casting from Constructor<T extends SerializableObject> to Constructor<Asset>
            // tslint:disable-next-line
            createAssetReference: () => new AssetReference(ctor as any),
            createComponentReference: () => new ComponentReference(ctor , undefined),
            createObjectArray: (data?: SerializableObject[]) => new ArrayProperty(ctor, data),
            createReferenceArray: (data?: ReferenceBase[]) => new ReferenceArray(ctor, data),
            // tslint:disable-next-line
            createAssetReferenceArray: (data?: AssetReference<Asset>[]) => new AssetReferenceArray(ctor as any, data)
        };

        if (isAbstract) {
            Private.objectRegister[ctor.name].isAbstract = isAbstract;
        }

        // collect inheritance info
        if (parentType) {
            RTTIInternal.registerRawTypeInfo(parentType.name, ctor.name);
        }
    }

    // tslint:disable-next-line             
    createObject(typeName: string, ...args: any[]): SerializableObject | null {
        const typeInfo = Private.getObjectInfo(typeName);
        const instance = (typeInfo && !typeInfo.isAbstract) ? typeInfo.createInstance(...args) : null;
        return instance;
    }

    createReference(typeName: string, data?: SerializableObject) {
        const typeInfo = Private.getObjectInfo(typeName);
        return typeInfo ? typeInfo.createReference(data) : null;
    }

    createAssetReference(typeName: string) {
        const typeInfo = Private.getObjectInfo(typeName);
        return typeInfo ? typeInfo.createAssetReference() : null;
    }

    createAssetReferenceArray(typeName: string, data?: AssetReference<Asset>[]) {
        const typeInfo = Private.getObjectInfo(typeName);
        return typeInfo ? typeInfo.createAssetReferenceArray(data) : null;
    }

    createComponentReference(typeName: string) {
        const typeInfo = Private.getObjectInfo(typeName);
        return typeInfo ? typeInfo.createComponentReference() : null;
    }

    createObjectArray(typeName: string, data?: SerializableObject[]) {
        const typeInfo = Private.getObjectInfo(typeName);
        return typeInfo ? typeInfo.createObjectArray(data) : null;
    }

    createReferenceArray(typeName: string, data?: ReferenceBase[]) {
        const typeInfo = Private.getObjectInfo(typeName);
        return typeInfo ? typeInfo.createReferenceArray(data) : null;
    }

    isAbstract(typeName: string) {
        if (typeName in Private.objectRegister) {
            const isAbstract = Private.objectRegister[typeName].isAbstract;
            return isAbstract !== undefined ? isAbstract : false;
        }
        return false;
    }
}

export class FactoryInternal {
    static create(customTypes?: TypeDefinition<SerializableObject>[]) {
        const instance = new Factory();
        IFactoryInternal.instance = instance;

        TypeRegistration.registerDefaultTypes();
        if (customTypes) {
            customTypes.forEach(([obj, parent]) => instance.registerObject(obj, parent));
        }

        RTTIInternal.buildTypeTree();
    }
}
