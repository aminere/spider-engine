import { ModelElement } from "./ModelElement";
import { StaticMeshAsset } from "../StaticMeshAsset";
import { Material } from "../../graphics/Material";
import { SerializableObject } from "../../core/SerializableObject";
import { AssetReference } from "../../serialization/AssetReference";
import { ArrayProperty } from "../../serialization/ArrayProperty";
export declare class ModelSubMesh extends SerializableObject {
    geometry: AssetReference<StaticMeshAsset>;
    material: AssetReference<Material>;
    destroy(): void;
}
export declare class ModelMultiMesh extends ModelElement {
    subMeshes: ArrayProperty<ModelSubMesh>;
    destroy(): void;
}
