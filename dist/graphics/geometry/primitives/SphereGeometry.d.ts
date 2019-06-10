import { Geometry } from "../Geometry";
import { AABB } from "../../../math/AABB";
export declare class SphereGeometry extends Geometry {
    private _boundingBox;
    getVertexBuffer(): import("../../VertexBuffer").VertexBuffer;
    getBoundingBox(): AABB;
}
