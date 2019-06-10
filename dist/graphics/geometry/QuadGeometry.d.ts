import { Geometry } from "./Geometry";
import { AABB } from "../../math/AABB";
import { VertexBuffer } from "../VertexBuffer";
export declare class QuadGeometry extends Geometry {
    private _boundingBox;
    getVertexBuffer(): VertexBuffer;
    getBoundingBox(): AABB;
}
