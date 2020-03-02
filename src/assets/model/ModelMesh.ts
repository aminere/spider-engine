import { ModelElement } from "./ModelElement";
import { AssetReference } from "../../serialization/AssetReference";
import { StaticMeshAsset } from "../StaticMeshAsset";
import { Material } from "../../graphics/Material";
import { SerializedObject } from "../../core/SerializableObject";
import { EngineUtils } from "../../core/EngineUtils";

export class ModelMesh extends ModelElement {
    
    get version() { return 2; }

    material = new AssetReference(Material);
    mesh = new AssetReference(StaticMeshAsset);

    destroy() {
        this.material.detach();
        this.mesh.detach();
    }

    isLoaded() {
        return EngineUtils.isAssetRefLoaded(this.material) 
            && EngineUtils.isAssetRefLoaded(this.mesh);
    }

    upgrade(json: SerializedObject, previousVersion: number) {
        if (previousVersion === 1) {
            // convert from array of ModelMeshes to an reference array of ModelElements
            let children = {
                typeName: "ModelElement",
                data: []
            };
            for (let mesh of json.properties.children.data) {
                let child = {
                    baseTypeName: "ModelElement",
                    data: {
                        typeName: json.properties.children.typeName
                    }
                };
                Object.assign(child.data, mesh);
                // tslint:disable-next-line
                (children.data as any).push(child);
            }
            json.properties.children = children;
        }
        return json;
    }
}
