import { Asset } from "./Asset";
import { SerializedObjectType } from "../serialization/SerializedTypes";
import { Entity, SerializedEntity } from "../core/Entity";
export interface SerializedPrefab {
    typeName: string;
    version: number;
    id: string;
    name: string;
    root: SerializedEntity;
}
export declare class Prefab extends Asset {
    readonly version: number;
    root: Entity;
    constructor();
    isLoaded(): boolean;
    serialize(): SerializedPrefab;
    deserialize(_json: SerializedObjectType): Promise<this>;
}
