import { ModelElement } from "./ModelElement";
import { StaticMeshAsset } from "../StaticMeshAsset";
import { Material } from "../../graphics/Material";
import { AssetReferenceArray } from "../../serialization/AssetReferenceArray";

export class ModelMultiMesh extends ModelElement {
    
    materials = new AssetReferenceArray(Material);
    meshes = new AssetReferenceArray(StaticMeshAsset);

    destroy() {
        this.materials.detach();
        this.meshes.detach();
    }
}
