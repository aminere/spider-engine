import { Geometry } from "./Geometry";
import { StaticMeshAsset } from "../../assets/StaticMeshAsset";
import { AssetReference } from "../../serialization/AssetReference";
import { AABB } from "../../math/AABB";
import { VertexBuffer } from "../VertexBuffer";
export declare class StaticMesh extends Geometry {
    mesh: AssetReference<StaticMeshAsset>;
    getVertexBuffer(): VertexBuffer | null;
    getBoundingBox(): AABB | null;
    destroy(): void;
}
