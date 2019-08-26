
import { Geometry } from "./Geometry";
import { StaticMeshAsset } from "../../assets/StaticMeshAsset";
import { AssetReference } from "../../serialization/AssetReference";
import { AABB } from "../../math/AABB";
import { VertexBuffer } from "../VertexBuffer";
import { ObjectProps } from "../../core/Types";
import { SerializedObject } from "../../core/SerializableObject";

export class StaticMesh extends Geometry {

    get version() { return 2; }

    set mesh(mesh: StaticMeshAsset | null) { this._mesh.asset = mesh; }
    get mesh() { return this._mesh.asset; }

    private _mesh = new AssetReference(StaticMeshAsset);

    constructor(props?: ObjectProps<StaticMesh>) {
        super();
        if (props) {
            this.setState(props);
        }
    }

    getVertexBuffer(): VertexBuffer | null {
        const { asset } = this._mesh;
        return asset ? asset.vertexBuffer : null;
    }

    getBoundingBox(): AABB | null {
        const { asset } = this._mesh;
        return asset ? asset.boundingBox : null;
    }

    destroy() {
        this._mesh.detach();
        super.destroy();
    }

    upgrade(json: SerializedObject, previousVersion: number) {
        if (previousVersion === 1) {
            Object.assign(json.properties, { _mesh: json.properties.mesh });
            delete json.properties.mesh;
        }
        return json;
    }
}
