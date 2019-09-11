import { Asset } from "./Asset";
import { Entity, SerializedEntity, EntityInternal } from "../core/Entity";
import {
    PrefabInstances, 
    SerializedObjectType,
    ObjectOverride,    
    PrefabInstance
} from "../serialization/SerializedTypes";
import { SerializerUtils } from "../serialization/SerializerUtils";
import { AsyncUtils } from "../core/AsyncUtils";
import { Prefab } from "./Prefab";
import * as Attributes from "../core/Attributes";
import { Reference, SerializedReference } from "../serialization/Reference";
import { Environment, ColorEnvironment } from "../graphics/Environment";
import { Fog } from "../graphics/Fog";
import { Shader } from "../graphics/Shader";
import { SerializedObject } from "../core/SerializableObject";
import { Component } from "../core/Component";
import { IObjectManagerInternal } from "../core/IObjectManager";
import { EngineUtils } from "../core/EngineUtils";

/**
 * @hidden
 */
export interface PrefabToLoadInfo {
    prefabId: string;
    instanceInScene: Entity;
}

/**
 * @hidden
 */
export interface SerializedScene {
    typeName: string;
    version: number;
    id: string;
    name: string;
    root: SerializedEntity;
    prefabInstances?: PrefabInstances;
    environment: SerializedReference;
    fog: SerializedReference;
}

export class Scene extends Asset {    

    // version 4: added fog
    // version 5: made fog & environment properties private and added setters to catch property changes.    
    get version() { return 5; }

    @Attributes.hidden()
    root: Entity;

    /**
     * @hidden
     */
    @Attributes.hidden()
    prefabInstances?: PrefabInstances;

    set fog(fog: Fog | undefined) { 
        if (fog !== this._fog.instance) {
            const oldType = this._fog.instance ? this._fog.instance.constructor.name : undefined;
            const newType = fog ? fog.constructor.name : undefined;
            if (oldType !== newType) {
                IObjectManagerInternal.instance.forEach(o => {
                    if (o.isA(Shader)) {
                        (o as Shader).invalidateProgram();
                    }
                });
            }            
            this._fog.instance = fog;
        }        
    }

    get fog() {
        return this._fog.instance;
    }

    get environment() {
        return this._environment.instance;
    }

    private _environment: Reference<Environment>;
    private _fog: Reference<Fog>;

    @Attributes.unserializable()
    private _isLoadedCache = false;

    constructor() {
        super();
        this.root = new Entity();
        this.root.name = "root";
        this._environment = new Reference(Environment, new ColorEnvironment());
        this._fog = new Reference(Fog);
    }

    isLoaded() {
        if (this._isLoadedCache) {
            return this._isLoadedCache;
        }
        const isLoaded = this.root.isLoaded();
        if (isLoaded) {
            this._isLoadedCache = true;
        }
        return isLoaded;
    }    
    
    serialize(): SerializedScene {
        const serializedScene: SerializedScene = {
            typeName: this.constructor.name,
            version: this.version,
            id: this.id,
            name: this.name,
            root: SerializerUtils.serializeEntityWithPrefabRefs(this.root),
            environment: SerializerUtils.serializeProperty(this._environment),
            fog: SerializerUtils.serializeProperty(this._fog)
        };

        if (process.env.NODE_ENV === "development") {
            if (this.prefabInstances) {
                const keys = Object.keys(this.prefabInstances);
                for (const prefabInstance of keys) {
                    if (this.root.findChildById(prefabInstance) === undefined) {
                        console.assert(false, "Unused prefab instance");
                        delete this.prefabInstances[prefabInstance];
                    }
                }
            }
        }
        
        if (this.prefabInstances && Object.keys(this.prefabInstances).length > 0) {
            serializedScene.prefabInstances = this.prefabInstances;
        }
        return serializedScene;
    }
    
    deserialize(_json: SerializedObjectType) {
        const json = _json as SerializedScene;
        if (json.version === 1) {
            let oldJson = (_json as SerializedObject);
            // tslint:disable-next-line
            json.root = oldJson.properties.root as any;
            // tslint:disable-next-line
            json.id = oldJson.properties.id as any;
            // tslint:disable-next-line
            json.name = oldJson.properties.name as any;
        } else if (json.version === 2) {
            // nothing to do
        } else if (json.version === 3) {
            SerializerUtils.deserializeProperty(this, "_environment", "Reference", json.environment);
        } else {
            SerializerUtils.deserializeProperty(this, "_environment", "Reference", json.environment);
            SerializerUtils.deserializeProperty(this, "_fog", "Reference", json.fog);
        }

        this.id = json.id;
        this.name = json.name;
        // TODO: should this be a deep copy??
        this.prefabInstances = json.prefabInstances;
        SerializerUtils.deserializeEntity(this.root, json.root, true);
        
        const prefabsToLoad: PrefabToLoadInfo[] = [];
        this.root.traverse(e => {
            if (e.prefabId) {
                prefabsToLoad.push({
                    prefabId: e.prefabId,
                    instanceInScene: e
                });
                return false;
            }
            return true;
        });

        return new Promise<Scene>(resolve => {
            AsyncUtils.processBatch(
                prefabsToLoad,
                (info, success, error) => {
                    this.setEntityFromPrefab(info.instanceInScene, info.prefabId)
                        .then(success)
                        .catch(error);
                },
                hasErrors => resolve(this)
            );
        });        
    }    

    destroy() {
        this.root.destroy();
        super.destroy();
    }
    
    setEntityFromPrefab(entity: Entity, prefabId: string) {
        return Promise.resolve()
            .then(() => {
                if (process.env.CONFIG === "editor") {
                    return IObjectManagerInternal.instance.loadObjectById(prefabId);
                } else {
                    // in standalone, ids are resolved as paths
                    return IObjectManagerInternal.instance.loadObject(prefabId);
                }                 
            })
            .then(([prefab]) => {
                this.setEntityFromPrefabInstance(entity, prefab as Prefab);
                return prefab as Prefab;
            });
    }

    setEntityFromPrefabInstance(entity: Entity, prefab: Prefab) {
        entity.prefabId = prefab.id;
        // Entity instance in the scene has authority over active status
        // entity.active = prefab.root.active;
        const prefabInstanceInfo = this.prefabInstances ? this.prefabInstances[entity.id] : undefined;
        let prefabIdToInstanceId = prefabInstanceInfo ? prefabInstanceInfo.prefabIdToInstanceId : undefined;
        
        let existingIdMap = true;
        if (!prefabIdToInstanceId) {
            existingIdMap = false;
            prefabIdToInstanceId = {};
        }

        let uniquePrefabRoot: Entity;
        if (existingIdMap) {
            uniquePrefabRoot = prefab.root.copyWithIdMap(prefabIdToInstanceId);
        } else {
            uniquePrefabRoot = prefab.root.copy(prefabIdToInstanceId, true) as Entity;
        }
        
        console.assert(entity.children.length === 0);
        for (const child of uniquePrefabRoot.children) {
            // Move in place, optim because addChild mutates the previous parents' children
            child.parent = entity;
            entity.children.push(child);
        }

        // Transfer the root components to the root instance in the scene
        uniquePrefabRoot.iterateComponents(c => EntityInternal.setComponentFromInstance(entity, c));

        if (existingIdMap) {
            // apply overrides
            const _prefabInstanceInfo = prefabInstanceInfo as PrefabInstance;
            entity.traverse(
                e => {
                    if (_prefabInstanceInfo.overrides && e.id in _prefabInstanceInfo.overrides) {
                        this.overrideEntity(e, _prefabInstanceInfo.overrides[e.id]);
                    }
                    return true;
                },
                true
            );
        } else {
            // record instantiation info
            if (!this.prefabInstances) {
                this.prefabInstances = {};
            }
            entity.id = prefabIdToInstanceId[prefab.root.id];
            console.assert(entity.id !== undefined);
            this.prefabInstances[entity.id] = {
                prefabIdToInstanceId: prefabIdToInstanceId
            };
        }
    }

    copy() {
        const copy = new Scene();
        copy.templatePath = this.templatePath;
        copy.root = this.root.copy();        
        return copy;
    }

    private overrideEntity(instance: Entity, override: ObjectOverride) {
        for (const overridenObjectTypeName of Object.keys(override)) {
            for (const overridenPropertyName of Object.keys(override[overridenObjectTypeName])) {
                const overridenPropertyData = override[overridenObjectTypeName][overridenPropertyName];
                let target: Component | Entity | null = null;
                if (overridenObjectTypeName === "Entity") {
                    target = instance;  
                } else if (instance.hasComponent(overridenObjectTypeName)) {
                    target = EntityInternal.getComponentByName(instance, overridenObjectTypeName) as Component;
                } else {
                    // component doesn't exist on the entity, create it
                    target = EntityInternal.setComponentByName(instance, overridenObjectTypeName);
                }
                if (overridenPropertyName in target) {
                    const typeName = SerializerUtils.getPropertyTypeName(target[overridenPropertyName]);
                    SerializerUtils.deserializeProperty(target, overridenPropertyName, typeName, overridenPropertyData);
                }
            }
        }
    }
}
