import { Vector3 } from "./Vector3";
import { ObjectPool } from "../core/ObjectPool";
export declare enum PlaneClassification {
    Front = 0,
    Back = 1,
    Planar = 2
}
export declare class Plane {
    static pool: ObjectPool<Plane>;
    normal: Vector3;
    distFromOrigin: number;
    static fromPool(): Plane;
    constructor(normal?: Vector3, distFromOrigin?: number);
    set(normal: Vector3, distFromOrigin: number): this;
    setFromPoint(normal: Vector3, point: Vector3): this;
    setFromPoints(v1: Vector3, v2: Vector3, v3: Vector3): this;
    copy(other: Plane): void;
    classifyPoint(v: Vector3): PlaneClassification;
    getSignedDistance(v: Vector3): number;
}
