import { Asset } from "./Asset";
import { Entity, SerializedEntity } from "../core/Entity";
import { PrefabInstances, SerializedObjectType } from "../serialization/SerializedTypes";
import { Prefab } from "./Prefab";
import { SerializedReference } from "../serialization/Reference";
import { Environment } from "../graphics/Environment";
import { Fog } from "../graphics/Fog";
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
export declare class Scene extends Asset {
    readonly version: number;
    root: Entity;
    /**
     * @hidden
     */
    prefabInstances?: PrefabInstances;
    fog: Fog | undefined;
    readonly environment: Environment | undefined;
    private _environment;
    private _fog;
    private _isLoadedCache;
    constructor();
    isLoaded(): boolean;
    serialize(): SerializedScene;
    deserialize(_json: SerializedObjectType): Promise<Scene>;
    destroy(): void;
    setEntityFromPrefab(entity: Entity, prefabId: string): Promise<Prefab>;
    setEntityFromPrefabInstance(entity: Entity, prefab: Prefab): void;
    copy(): Scene;
    private overrideEntity;
}
