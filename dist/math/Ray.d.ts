import { Vector3 } from "./Vector3";
import { Matrix44 } from "./Matrix44";
import { AABB } from "./AABB";
import { Plane, PlaneClassification } from "./Plane";
export declare class RayPlaneCollisionResult {
    intersection: Vector3 | null;
    classification: PlaneClassification;
}
export declare class RayAABBCollisionResult {
    intersection1: Vector3;
    intersection2: Vector3;
    normal1: Vector3;
    normal2: Vector3;
}
export declare class RaySphereCollisionResult extends RayAABBCollisionResult {
}
export declare class Ray {
    /**
     * @hidden
     */
    static dummy: Ray;
    origin: Vector3;
    direction: Vector3;
    readonly destination: Vector3;
    length: number;
    private _origin;
    private _direction;
    private _destination;
    private _length;
    static fromPerspectiveView(fovRadians: number, inverseView: Matrix44, viewX: number, viewY: number, viewW: number, viewH: number): Ray;
    static fromOrthographicView(orthoSizeY: number, inverseView: Matrix44, viewX: number, viewY: number, viewW: number, viewH: number): Ray;
    constructor(origin?: Vector3, direction?: Vector3, length?: number);
    set(origin: Vector3, direction: Vector3, length?: number): void;
    copy(other: Ray): this;
    transform(matrix: Matrix44): void;
    setFromPerspectiveView(fovRadians: number, inverseView: Matrix44, viewX: number, viewY: number, viewW: number, viewH: number): this;
    setFromOrthographicView(orthoSizeY: number, inverseView: Matrix44, viewX: number, viewY: number, viewW: number, viewH: number): this;
    castOnSphere(center: Vector3, radius: number): RaySphereCollisionResult | null;
    castOnPlane(plane: Plane): RayPlaneCollisionResult;
    castOnAABB(aabb: AABB): RayAABBCollisionResult | null;
    private getAABBNormal;
}
