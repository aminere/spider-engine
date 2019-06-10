import { Geometry } from "../Geometry";
import { AABB } from "../../../math/AABB";
export declare class BoxGeometry extends Geometry {
    private _boundingBox;
    getVertexBuffer(): import("../../VertexBuffer").VertexBuffer;
    getBoundingBox(): AABB;
}
