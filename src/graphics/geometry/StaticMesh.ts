
import { Geometry } from "./Geometry";
import { StaticMeshAsset } from "../../assets/StaticMeshAsset";
import { AssetReference } from "../../serialization/AssetReference";
import { AABB } from "../../math/AABB";
import { VertexBuffer } from "../VertexBuffer";

export class StaticMesh extends Geometry {

    mesh = new AssetReference(StaticMeshAsset);

    getVertexBuffer(): VertexBuffer | null {
        let mesh = this.mesh.asset;
        return mesh ? mesh.vertexBuffer : null;
    }

    getBoundingBox(): AABB | null {
        let mesh = this.mesh.asset;
        return mesh ? mesh.boundingBox : null;
    }

    destroy() {
        this.mesh.detach();
        super.destroy();
    }
}
