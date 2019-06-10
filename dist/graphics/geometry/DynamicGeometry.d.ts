import { Geometry } from "./Geometry";
import { VertexBuffer } from "../VertexBuffer";
import { AABB } from "../../math/AABB";
export declare class DynamicGeometry extends Geometry {
    vertexBuffer: VertexBuffer;
    private _vb;
    private _boundingBox;
    getVertexBuffer(): VertexBuffer;
    getBoundingBox(): AABB;
}
