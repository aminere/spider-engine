import { Geometry } from "./Geometry";
import { VertexBuffer } from "../VertexBuffer";
import { AABB } from "../../math/AABB";
import { ObjectProps } from "../../core/Types";
export declare class DynamicGeometry extends Geometry {
    vertexBuffer: VertexBuffer;
    private _vb;
    private _boundingBox;
    constructor(props?: ObjectProps<DynamicGeometry>);
    getVertexBuffer(): VertexBuffer;
    getBoundingBox(): AABB;
}
