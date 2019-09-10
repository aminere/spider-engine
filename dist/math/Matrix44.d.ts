import { Vector3 } from "./Vector3";
import { Quaternion } from "./Quaternion";
import { ObjectPool } from "../core/ObjectPool";
export declare class Matrix44 {
    static identity: Matrix44;
    static dummy: Matrix44;
    static pool: ObjectPool<Matrix44>;
    data: number[];
    static fromArray(data: number[]): Matrix44;
    static fromPool(): Matrix44;
    constructor(data?: number[]);
    makeOrthoProjection(left: number, right: number, top: number, bottom: number, near: number, far: number): this;
    makePerspectiveProjection(fovRadians: number, aspectRatio: number, zNear: number, zFar: number): this;
    setRotation(q: Quaternion): this;
    getRotation(outRotation: Quaternion): Quaternion;
    rotate(q: Quaternion): this;
    makeLookAt(forward: Vector3, up: Vector3): this;
    setIdentity(): this;
    set(n11: number, n12: number, n13: number, n14: number, n21: number, n22: number, n23: number, n24: number, n31: number, n32: number, n33: number, n34: number, n41: number, n42: number, n43: number, n44: number): this;
    toEuler(euler: Vector3): Vector3;
    scale(v: Vector3): this;
    scaleFromCoords(x: number, y: number, z: number): this;
    setPosition(v: Vector3): this;
    getPosition(out: Vector3): void;
    setPositionFromCoords(x: number, y: number, z: number): this;
    translate(v: Vector3): this;
    translateFromCoords(x: number, y: number, z: number): this;
    compose(position: Vector3, rotation: Quaternion, scale: Vector3): this;
    decompose(position: Vector3, quaternion: Quaternion, scale: Vector3): this;
    determinant(): number;
    transpose(): this;
    multiply(other: Matrix44): this;
    multiplyMatrices(a: Matrix44, b: Matrix44): this;
    invert(): this;
    getInverse(m: Matrix44): this;
    getScale(out: Vector3): Vector3;
    extractRotation(m: Matrix44): this;
    copyPosition(m: Matrix44): this;
    copy(other: Matrix44): this;
    toArray(array: Float32Array, offset: number): Float32Array;
}
export declare class SerializableMatrix44 extends Matrix44 {
}
