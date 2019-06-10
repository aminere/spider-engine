import { Vector3 } from "./Vector3";
import { ObjectPool } from "../core/ObjectPool";
export declare class Triangle {
    static pool: ObjectPool<Triangle>;
    a: Vector3;
    b: Vector3;
    c: Vector3;
    static fromPool(): Triangle;
    constructor(a?: Vector3, b?: Vector3, c?: Vector3);
    set(a: Vector3, b: Vector3, c: Vector3): this;
    contains(p: Vector3, tolerance?: number): boolean;
    getClosestPoint(p: Vector3): Vector3;
    getBarycentricCoords(p: Vector3): Vector3;
}
