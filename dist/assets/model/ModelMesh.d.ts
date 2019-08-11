import { ModelElement } from "./ModelElement";
import { AssetReference } from "../../serialization/AssetReference";
import { StaticMeshAsset } from "../StaticMeshAsset";
import { Material } from "../../graphics/Material";
import { SerializedObject } from "../../core/SerializableObject";
export declare class ModelMesh extends ModelElement {
    readonly version: number;
    material: AssetReference<Material>;
    mesh: AssetReference<StaticMeshAsset>;
    destroy(): void;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
}
