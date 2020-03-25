import { Matrix44 } from "../../math/Matrix44";
import { SerializableObject } from "../../core/SerializableObject";
import { Transform } from "../../core/Transform";
import { VoidSyncEvent } from "ts-events";
import { IFrustum } from "./IFrustum";
export declare class Projector extends SerializableObject {
    get frustum(): IFrustum;
    changed: VoidSyncEvent;
    get zNear(): number;
    get zFar(): number;
    set zNear(zNear: number);
    set zFar(zFar: number);
    protected _zNear: number;
    protected _zFar: number;
    protected _frustum: IFrustum;
    getProjectionMatrix(): Matrix44;
    updateFrustum(transform: Transform, widthToHeightRatio: number): void;
}
