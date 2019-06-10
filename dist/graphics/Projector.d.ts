import { Matrix44 } from "../math/Matrix44";
import { SerializableObject } from "../core/SerializableObject";
import { Transform } from "../core/Transform";
import { Frustum } from "./Frustum";
import { VoidSyncEvent } from "ts-events";
export declare class Projector extends SerializableObject {
    readonly frustum: Frustum;
    changed: VoidSyncEvent;
    zNear: number;
    zFar: number;
    protected _frustum: Frustum;
    getProjectionMatrix(): Matrix44;
    updateFrustum(transform: Transform, widthToHeightRatio: number): void;
}
