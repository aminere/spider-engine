import { AABB } from "../../math/AABB";
import { SerializableObject } from "../../core/SerializableObject";
import { Matrix44 } from "../../math/Matrix44";
import { Transform } from "../../core/Transform";
import { VertexBuffer } from "../VertexBuffer";
import { Camera } from "../camera/Camera";
export declare enum GraphicUpdateResult {
    Changed = 0,
    Unchanged = 1
}
export declare class Geometry extends SerializableObject {
    getVertexBuffer(): VertexBuffer | null;
    getBoundingBox(): AABB | null;
    getWorldTransform(transform: Transform): Matrix44;
    graphicUpdate(camera: Camera, transform: Transform): GraphicUpdateResult;
}
