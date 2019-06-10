
import { SerializedArrayProperty } from "./ArrayProperty";
import { SerializedComponentReference } from "./ComponentReference";
import { SerializedObject } from "../core/SerializableObject";
import { SerializedPrefab } from "../assets/Prefab";
import { SerializedScene } from "../assets/Scene";
import { SerializedAnimationTrack, SerializedNumberTrack } from "../animation/tracks/AnimationTrack";
import { SerializedReference } from "./Reference";
import { SerializedReferenceArray } from "./ReferenceArray";
import { SerializedAssetReferenceArray } from "./AssetReferenceArray";
import { SerializedAsset } from "../assets/Asset";
import { SerializedVertexBuffer } from "../graphics/VertexBuffer";
import { SerializedUISize } from "../ui/UISize";
import { SerializedSize } from "../core/Size";
import { SerializedNativeArray } from "./NativeArray";
import { SerializedGamepadData } from "../assets/GamepadDataLoad";

/**
 * @hidden
 */
export interface PropertyOverride {
    // tslint:disable-next-line
    [propertyName: string]: any;
}

/**
 * @hidden
 */
export interface ObjectOverride {
    [typeName: string]: PropertyOverride;
}

/**
 * @hidden
 */
export interface EntityOverride {
    [idInScene: string]: ObjectOverride;
}

/**
 * @hidden
 */
export interface PrefabIdToInstanceId {
    [idInPrefab: string]: string;
}

/**
 * @hidden
 */
export interface PrefabInstance {
    prefabIdToInstanceId: PrefabIdToInstanceId;
    overrides?: EntityOverride;
}

/**
 * @hidden
 */
export interface PrefabInstances {    
    [idInScene: string]: PrefabInstance;
}

export type SerializedObjectType = SerializedObject 
| SerializedPrefab 
| SerializedScene 
| SerializedAnimationTrack
| SerializedNumberTrack
| SerializedGamepadData;

export interface SerializedAssetReference {
    typeName: string;
    id: string;
}

export type SerializedPropertyType = SerializedArrayProperty    
    | SerializedReference
    | SerializedReferenceArray
    | SerializedAssetReference
    | SerializedAssetReferenceArray
    | SerializedAsset
    | SerializedVertexBuffer
    | SerializedUISize
    | SerializedSize
    | SerializedComponentReference
    | SerializedNativeArray;
