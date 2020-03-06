import { Geometry } from "./Geometry";
import { StaticMeshAsset } from "../../assets/StaticMeshAsset";
import { AABB } from "../../math/AABB";
import { VertexBuffer } from "../VertexBuffer";
import { ObjectProps } from "../../core/Types";
import { SerializedObject } from "../../core/SerializableObject";
export declare class StaticMesh extends Geometry {
    get version(): number;
    set mesh(mesh: StaticMeshAsset | null);
    get mesh(): StaticMeshAsset | null;
    private _mesh;
    constructor(props?: ObjectProps<StaticMesh>);
    getVertexBuffer(): VertexBuffer | null;
    getBoundingBox(): AABB | null;
    destroy(): void;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
}
