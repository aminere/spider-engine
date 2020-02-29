import { Entity, SerializedEntity, EntityInternal } from "../core/Entity";
import { SerializableObject, SerializedObject } from "../core/SerializableObject";
import { PropertyFactory, PropertyFactoryInternal } from "./PropertyFactory";
import { Debug } from "../io/Debug";
import { AssetReference, AssetReferenceState } from "./AssetReference";
import { Asset } from "../assets/Asset";
import { UniqueObject } from "../core/UniqueObject";
import { ObjectReference } from "./ObjectReference";
import { ObjectDefinition } from "../behavior/ObjectDefinition";
import { ReferenceBase } from "./Reference";
import { EngineEvents } from "../core/EngineEvents";
import { Component } from "../core/Component";
import { IFactoryInternal } from "./IFactory";
import { RTTI } from "../core/RTTI";
import { ObjectManagerInternal } from "../core/ObjectManager";
import { AssetIdDatabase } from "../assets/AssetIdDatabase";
import { EnumLiterals } from "../core/EnumLiterals";
import { IEntityUtilsInternal } from "../core/IEntityUtils";
import { EntityReference } from "./EntityReference";
import { ComponentReference } from "./ComponentReference";
import { ReferenceArrayBase } from "./ReferenceArray";

interface SerializedAssetReference {
    typeName: string;
    id?: string;
}

interface SerializedObjectReference extends SerializedAssetReference {
    declarationId: string;
}

namespace Private {
    export let serializeNonPersistentObjects: boolean | undefined = undefined;
    export let nonPersistentObjectCache: { [typeName: string]: SerializableObject } | null = null;
    export const mockInstanceCache: { [typeName: string]: SerializableObject } = {};
}

/**
 * @hidden
 */
export namespace SerializerUtilsInternal {
    export let serializeIdsAsPaths = false;
    export let tryUsePropertySetter = false;
}

export class SerializerUtils {    

    static serializeEntity(e: Entity, serializeNonPersistentObjects?: boolean): SerializedEntity {
        SerializerUtils.serializeNonPersistentObjects(serializeNonPersistentObjects);
        let childrenToSerialize = e.children;
        let children = childrenToSerialize.map(b => SerializerUtils.serializeEntity(b, serializeNonPersistentObjects));
        let componentsToSerialize: Component[] = [];
        e.iterateComponents(component => {
            // controlled components are created by their controller
            if (!component.controller) {
                componentsToSerialize.push(component);
            }
        });
        const sorted = IEntityUtilsInternal.instance.sortComponents(componentsToSerialize);
        const components = SerializerUtils.serializeComponents(sorted);
        SerializerUtils.serializeNonPersistentObjects(false);
        return {
            id: e.id,
            name: e.name,
            active: e.active,
            prefabId: e.prefabId,
            components: componentsToSerialize.length > 0 ? components : undefined,
            children: children.length > 0 ? children : undefined
        };
    }

    static deserializeEntity(entity: Entity, json: SerializedEntity, persistent?: boolean) {
        entity.name = json.name;
        entity.id = json.id;
        entity.initializeActive(json.active);
        entity.prefabId = json.prefabId;
        if (json.components) {
            // old format - TODO remove after all projects have been converted
            if (Array.isArray(json.components)) {
                const obj = {};
                for (const c of json.components) {
                    const typeName = c.typeName;
                    delete c.typeName;
                    obj[typeName] = c;
                }
                json.components = obj;
            }
            for (const typeName of Object.keys(json.components)) {
                const component = json.components[typeName];
                const componentInstance = IFactoryInternal.instance.createObject(typeName) as Component;
                SerializerUtils.deserializeObject(componentInstance, component);
                EntityInternal.setComponentFromInstance(entity, componentInstance);
            }
        }
        if (json.children) {
            for (const child of json.children) {
                const childInstance = new Entity();
                entity.addChild(childInstance);
                SerializerUtils.deserializeEntity(childInstance, child, persistent);
            }
        }
    }

    static serializeEntityWithPrefabRefs(e: Entity): SerializedEntity {
        if (e.prefabId) {
            return {
                id: e.id,
                name: e.name,
                active: e.active,
                prefabId: (() => {
                    let id = e.prefabId;
                    if (process.env.CONFIG === "editor") {
                        if (id && SerializerUtilsInternal.serializeIdsAsPaths) {
                            const path = AssetIdDatabase.getPath(id);
                            if (path) {
                                id = path;
                            }
                        }
                    }
                    return id;
                })()
            };
        } else {
            const children = e.children.map(b => SerializerUtils.serializeEntityWithPrefabRefs(b));
            const componentsToSerialize: Component[] = [];
            e.iterateComponents(component => {
                if (!component.controller) {
                    componentsToSerialize.push(component);
                }
            });
            const sorted = IEntityUtilsInternal.instance.sortComponents(componentsToSerialize);
            const components = SerializerUtils.serializeComponents(sorted);
            return {
                id: e.id,
                name: e.name,
                active: e.active,
                components: componentsToSerialize.length > 0 ? components : undefined,
                children: children.length > 0 ? children : undefined
            };
        }
    }

    static serializeObject(o: SerializableObject) {
        const json: SerializedObject = {
            typeName: o.constructor.name,
            version: SerializerUtils.getObjectVersion(o),
            properties: {}
        };
        SerializerUtils.serializeProperties(o, json);
        return json;
    }

    static deserializeObject(target: SerializableObject, json: SerializedObject) {
        let finalJson = json;
        const jsonVersion = json.version || 1;
        const targetVersion = SerializerUtils.getObjectVersion(target);
        if (jsonVersion < targetVersion) {
            // upgrade json to latest format
            for (let i = jsonVersion; i < targetVersion; ++i) {
                finalJson = target.upgrade(json, i);
                finalJson.version = i + 1;
            }
        }

        const properties = Object.keys(finalJson.properties);
        for (const jsonPropertyName of properties) {
            if (!SerializerUtils.isPropertySerializable(target.constructor.name, jsonPropertyName)) {
                continue;
            }
            const jsonProperty = finalJson.properties[jsonPropertyName];
            if (SerializerUtils.isDynamicProperty(target.constructor.name, jsonPropertyName)) {
                const typeName = jsonProperty.typeName;
                if (typeName) {
                    SerializerUtils.deserializeProperty(target, jsonPropertyName, typeName, jsonProperty.data);
                }
            } else {
                const typeName = SerializerUtils.getPropertyTypeName(target[jsonPropertyName]);
                if (typeName) {
                    SerializerUtils.deserializeProperty(target, jsonPropertyName, typeName, jsonProperty);
                }
            }
        }
    }

    static serializeNonPersistentObjects(enable?: boolean) {
        Private.serializeNonPersistentObjects = enable;
    }

    static clearNonPersistentObjectCache() {
        Private.nonPersistentObjectCache = null;
    }

    // tslint:disable-next-line
    static serializeProperty(data: any, _typeName?: string) {
        const typeName = _typeName || SerializerUtils.getPropertyTypeName(data);
        if (["AssetReference", "ObjectReference"].indexOf(typeName) >= 0) {
            const assetRef = (data as AssetReference<Asset>);
            let id = assetRef.id;

            // don't serialize the ID if the asset is not persistent (for ex. a shadow map created at runtime.)
            if (assetRef.asset && !assetRef.asset.isPersistent) {
                if (Private.serializeNonPersistentObjects) {
                    if (!Private.nonPersistentObjectCache) {
                        Private.nonPersistentObjectCache = {};
                    }
                    Private.nonPersistentObjectCache[assetRef.asset.id] = assetRef.asset;
                } else {
                    id = undefined;
                }
            }

            if (id && SerializerUtilsInternal.serializeIdsAsPaths) {
                const path = (() => {
                    if (process.env.CONFIG === "editor") {
                        return AssetIdDatabase.getPath(id);
                    } else {
                        return assetRef.asset?.templatePath;
                    }
                })();
                if (path) {
                    id = path;
                }
            }

            const result = {
                typeName: assetRef.typeName(),
                id: id
            };
            if (typeName === "ObjectReference") {
                Object.assign(result, {
                    declarationId: (data as ObjectReference).declarationId 
                });
            }
            return result;
        
        } else if (typeName === "Entity") {
            return SerializerUtils.serializeEntity(data as Entity);
        } else if (RTTI.isObjectOfType(typeName, "SerializableObject")) {
            return (data as SerializableObject).serialize();
        } else {
            const properties = PropertyFactory.properties;
            if (typeName in properties) {
                // TODO will it be necessary to apply ID transforms to low level properties??
                // I don't see another use case other than preserving asset references for now.
                return properties[typeName].writeProperty(data);
            } else {
                Debug.logWarning(`Cannot serialize property of type '${typeName}'`);
                // if (typeof(data) === "object") {
                //     // TODO generic native object serialization, 
                //     return data;    
                // }
                return PropertyFactoryInternal.noOp;
            }
        }
    }

    static deserializeProperty(
        // tslint:disable-next-line
        target: SerializableObject | any[],
        index: string | number,
        typeName: string,
        // tslint:disable-next-line
        data: any
    ) {
        if (["AssetReference", "ObjectReference"].indexOf(typeName) >= 0) {
            const assetRefData = data as SerializedAssetReference;
            const id = assetRefData.id;
            let assetRef = target[index] as AssetReference<Asset>;
            if (typeName === "AssetReference") {
                if (!assetRef) {
                    assetRef = IFactoryInternal.instance.createAssetReference(assetRefData.typeName) as AssetReference<Asset>;
                    target[index] = assetRef;
                }
            } else {
                const objectRefData = data as SerializedObjectReference;
                if (!assetRef) {
                    assetRef = new ObjectReference(objectRefData.declarationId);
                    target[index] = assetRef;
                } else {
                    (assetRef as ObjectReference).declarationId = objectRefData.declarationId;
                }
            }            
            assetRef.id = id;
            if (id) {
                if (Private.nonPersistentObjectCache && id in Private.nonPersistentObjectCache) {
                    assetRef.asset = Private.nonPersistentObjectCache[id] as Asset;
                    SerializerUtils.setProperty(target, index, assetRef);
                } else {
                    const loadSuccess = (obj: UniqueObject, fromCache: boolean) => {
                        const asset = obj as Asset;
                        const _assetRef = target[index] as AssetReference<Asset>;
                        _assetRef.asset = asset;
                        SerializerUtils.setProperty(target, index, _assetRef);
                        if (fromCache === false) {
                            // Only send this event on the first load
                            EngineEvents.assetLoaded.post(asset);
                        }
                    };
                    const loadError = () => {
                        const _assetRef = target[index] as AssetReference<Asset>;
                        _assetRef.setAssetFast(null);
                        _assetRef.state = AssetReferenceState.Resolved;
                        SerializerUtils.setProperty(target, index, _assetRef);
                        // get either the asset path or the typename (in case this is reference by a non-asset like an Entity component)
                        let targetInfo = (target as UniqueObject).templatePath;
                        if (targetInfo) {
                            targetInfo = `in '${targetInfo}'`;
                        } else {
                            targetInfo = `in '${target.constructor.name}'`;
                        }
                        Debug.logError(`Missing asset still referenced '${index}', id: '${id}' ${targetInfo || ""}`);
                    };
                    if (process.env.CONFIG === "editor") {
                        ObjectManagerInternal.loadObjectById(id, loadSuccess, loadError);
                    } else {
                        // in standalone, ids are resolved as paths
                        ObjectManagerInternal.loadObject(id, loadSuccess, loadError, false);
                    }                    
                }
            } else {
                assetRef.asset = null;
                SerializerUtils.setProperty(target, index, assetRef);
            }
           
        } else if (typeName === "Entity") {
            const instance = new Entity();
            SerializerUtils.deserializeEntity(instance, data as SerializedEntity, true);
            SerializerUtils.setProperty(target, index, instance);

        } else if (RTTI.isObjectOfType(typeName, "SerializableObject")) {
            const instance = IFactoryInternal.instance.createObject(typeName);
            if (instance) {
                instance.deserialize(data);
                SerializerUtils.setProperty(target, index, instance);
            }

        } else {

            if (typeName === "Number") {
                const enumLiterals = Reflect.getMetadata("enumLiterals", target, index as string) as EnumLiterals;
                if (enumLiterals) {
                    if (typeof(data) === "number") {
                        // old format
                        SerializerUtils.setProperty(target, index, data);
                    } else if (typeof(data) === "object") {
                        // old format
                        SerializerUtils.setProperty(target, index, data.value);
                    } else {
                        // deserialize enums as numbers
                        const enumValue = enumLiterals.literals[data];
                        console.assert(enumValue !== undefined);
                        SerializerUtils.setProperty(target, index, enumValue);
                    }
                    return;
                }
            }

            const properties = PropertyFactory.properties;
            const value = (typeName in properties) ? properties[typeName].readProperty(data, target, index) : data;
            if (value !== undefined) {
                SerializerUtils.setProperty(target, index, value);
            }
        }
    }

    // tslint:disable-next-line
    static getPropertyTypeName(property: any) {
        let typeName = `${typeof (property)}`;
        if (typeName === "object") {
            return property.constructor.name as string;
        } else {
            // make first letter upper case, for example string => String, number => Number
            // This is needed to be able to define property constructors in Serializer.propertyFactory 
            // (Number is a valid constructor, number is not).
            typeName = typeName[0].toUpperCase() + typeName.substring(1);
            return typeName;
        }
    }

    static copyProperty(src: SerializableObject, dest: SerializableObject, propertyId: string) {
        const typeName = SerializerUtils.getSerializablePropertyTypeName(src, propertyId);
        if (typeName === null) {
            return false;
        }
        const serialized = SerializerUtils.serializeProperty(src[propertyId], typeName);
        SerializerUtils.deserializeProperty(dest, propertyId, typeName, serialized);
        return true;
    }

    static getSerializablePropertyTypeName(obj: object, propertyId: string) {
        const property = obj[propertyId];
        if (typeof (property) === "function") {
            return null;
        }
        const unserializable = Reflect.getMetadata("unserializable", obj, propertyId);
        if (unserializable) {
            return null;
        }
        const typeName = SerializerUtils.getPropertyTypeName(property);
        return typeName;
    }

    static setProperty(
        // tslint:disable-next-line
        target: SerializableObject | any[],
        property: string | number,
        // tslint:disable-next-line
        value: any
    ) {
        const setProperty = () => {
            if (Array.isArray(target)) {
                target[property] = value;
            } else {
                target.setProperty(property as string, value);
            }
        };

        const { tryUsePropertySetter } = SerializerUtilsInternal;
        if (tryUsePropertySetter) {
            if (typeof (property) === "string" && property.startsWith("_")) {
                // if setter exists, use it!
                const propertyKey = property.slice(1);
                const propertyValue = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(target), propertyKey);
                if (propertyValue && propertyValue.set) {
                    if (value.constructor.name === "Reference") {
                        propertyValue.set.call(target, (value as ReferenceBase).getInstance());
                    } else if (value.constructor.name === "AssetReference") {
                        propertyValue.set.call(target, (value as AssetReference<Asset>).asset);
                    } else if (value.constructor.name === "EntityReference") {
                        propertyValue.set.call(target, (value as EntityReference).entity);
                    } else if (value.constructor.name === "ComponentReference") {
                        propertyValue.set.call(target, (value as ComponentReference<Component>).component);
                    } else if (value.constructor.name === "ReferenceArray") {
                        propertyValue.set.call(target, (value as ReferenceArrayBase).getData().map(r => r.getInstance()));
                    } else {
                        propertyValue.set.call(target, value);
                    }
                } else {
                    setProperty();
                }
            } else {
                setProperty();
            }
        } else {
            setProperty();
        }
    }

    static isDynamicProperty(typeName: string, property: string) {
        let mockInstance = Private.mockInstanceCache[typeName];
        if (!mockInstance) {
            mockInstance = IFactoryInternal.instance.createObject(typeName) as SerializableObject;
            Private.mockInstanceCache[typeName] = mockInstance;
        }
        return !(property in mockInstance);
    }

    static isPropertySerializable(typeName: string, property: string) {
        let mockInstance = Private.mockInstanceCache[typeName];
        if (!mockInstance) {
            mockInstance = IFactoryInternal.instance.createObject(typeName) as SerializableObject;
            Private.mockInstanceCache[typeName] = mockInstance;
        }
        return !Reflect.getMetadata("unserializable", mockInstance, property);
    }

    static getObjectVersion(obj: SerializableObject): number {
        // tslint:disable-next-line
        return obj["version"] || 1;
    }

    static serializeProperties(o: SerializableObject, json: SerializedObject) {
        for (const key of Object.keys(o)) {
            let unserializable = Reflect.getMetadata("unserializable", o, key);
            if (unserializable) {
                continue;
            }
            let property = o[key];
            if (typeof (property) === "function" || property === undefined || property === null) {
                continue;
            }
            let typeName = SerializerUtils.getPropertyTypeName(property);

            if (typeName === "Number") {
                // Serialize enum names, not values
                const enumLiterals = Reflect.getMetadata("enumLiterals", o, key) as EnumLiterals;
                if (enumLiterals) {
                    const name = Object.keys(enumLiterals.literals).find(k => enumLiterals.literals[k] === property);
                    console.assert(name);
                    property = name;
                    typeName = "String";
                }
            }

            const serializedData = SerializerUtils.serializeProperty(property, typeName);
            if (serializedData !== PropertyFactoryInternal.noOp) {
                if (SerializerUtils.isDynamicProperty(o.constructor.name, key)) {
                    json.properties[key] = {
                        typeName: typeName,
                        data: serializedData
                    };
                } else {
                    json.properties[key] = serializedData;
                }
            }
        }
    }

    static serializeComponent(o: Component) {
        const json: SerializedObject = {
            version: SerializerUtils.getObjectVersion(o),
            properties: {}
        };
        SerializerUtils.serializeProperties(o, json);
        return json;
    }

    static serializeComponents(components: Component[]) {
        return components.reduce(
            (prev, current) => ({
                ...prev, ...{ [current.constructor.name]: SerializerUtils.serializeComponent(current) }
            }),
            {} as { [typeName: string]: SerializedObject }
        );
    }
}
