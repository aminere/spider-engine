import { Vector3 } from "./Vector3";
import { Matrix44 } from "./Matrix44";
import { ObjectPool } from "../core/ObjectPool";
import { RotationOrder } from "./Types";
export declare class Quaternion {
    static identity: Quaternion;
    static dummy: Quaternion;
    static pool: ObjectPool<Quaternion>;
    readonly length: number;
    readonly lengthSq: number;
    x: number;
    y: number;
    z: number;
    w: number;
    private _x;
    private _y;
    private _z;
    private _w;
    static fromPool(): Quaternion;
    /**
     *
     * @param x Rotation around the x axis in Radians
     * @param y Rotation around the y axis in Radians
     * @param z Rotation around the z axis in Radians
     * @param order Rotation order
     */
    static fromEulerAngles(x: number, y: number, z: number, order?: RotationOrder): Quaternion;
    static fromAxisAngle(axis: Vector3, radians: number): Quaternion;
    static fromUnitVectors(from: Vector3, to: Vector3): Quaternion;
    constructor(x?: number, y?: number, z?: number, w?: number);
    set(x: number, y: number, z: number, w: number): void;
    setFromAxisAngle(axis: Vector3, radians: number): this;
    /**
     *
     * @param x Rotation around the x axis in Radians
     * @param y Rotation around the y axis in Radians
     * @param z Rotation around the z axis in Radians
     * @param order Rotation order
     */
    setFromEulerAngles(x: number, y: number, z: number, order?: RotationOrder): this;
    setFromEulerVector(euler: Vector3): this;
    setFromUnitVectors(from: Vector3, to: Vector3): this;
    setFromMatrix(m: Matrix44): this;
    lookAt(forward: Vector3, up: Vector3): this;
    normalize(): this;
    multiply(other: Quaternion): this;
    multiplyQuaternions(b: Quaternion, a: Quaternion): this;
    toEuler(euler: Vector3): Vector3;
    equals(other: Quaternion): boolean;
    copy(other: Quaternion): this;
    invert(): this;
    getInverse(out: Quaternion): Quaternion;
    conjugate(): this;
    slerpQuaternions(a: Quaternion, b: Quaternion, t: number): this;
    slerp(qb: Quaternion, t: number): this;
}
