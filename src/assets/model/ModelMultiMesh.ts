import { ModelElement } from "./ModelElement";
import { StaticMeshAsset } from "../StaticMeshAsset";
import { Material } from "../../graphics/Material";
import { SerializableObject } from "../../core/SerializableObject";
import { AssetReference } from "../../serialization/AssetReference";
import { ArrayProperty } from "../../serialization/ArrayProperty";

export class ModelSubMesh extends SerializableObject {
    geometry = new AssetReference(StaticMeshAsset);
    material = new AssetReference(Material);

    destroy() {
        this.geometry.detach();
        this.material.detach();
    }
}

export class ModelMultiMesh extends ModelElement {    
    
    subMeshes = new ArrayProperty(ModelSubMesh);

    destroy() {
        this.subMeshes.data.forEach(m => m.destroy());
    }
}
