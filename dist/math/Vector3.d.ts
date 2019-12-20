import { Matrix44 } from "./Matrix44";
import { Quaternion } from "./Quaternion";
import { ObjectPool } from "../core/ObjectPool";
export declare namespace Vector3Internal {
    const xKey = "_x";
    const yKey = "_y";
    const zKey = "_z";
    const wKey = "_w";
}
export declare class Vector3 {
    static zero: Vector3;
    static one: Vector3;
    static right: Vector3;
    static up: Vector3;
    static forward: Vector3;
    /**
     * @hidden
     */
    static dummy: Vector3;
    /**
     * @hidden
     */
    static dummy2: Vector3;
    static pool: ObjectPool<Vector3>;
    x: number;
    y: number;
    z: number;
    readonly length: number;
    readonly lengthSq: number;
    private _x;
    private _y;
    private _z;
    private _array;
    static distance(a: Vector3, b: Vector3): number;
    static distanceSq(a: Vector3, b: Vector3): number;
    static fromPool(): Vector3;
    static fromArray(a: number[], index?: number): Vector3;
    constructor(x?: number, y?: number, z?: number);
    flip(): this;
    cross(v: Vector3): this;
    crossVectors(a: Vector3, b: Vector3): this;
    dot(other: Vector3): number;
    substract(other: Vector3): this;
    substractVectors(a: Vector3, b: Vector3): this;
    add(other: Vector3): this;
    addVectors(a: Vector3, b: Vector3): this;
    multiply(scalar: number): this;
    multiplyVector(other: Vector3): this;
    divide(scalar: number): this;
    divideVector(other: Vector3): this;
    min(): number;
    max(): number;
    normalize(): this;
    lerp(other: Vector3, factor: number): this;
    lerpVectors(v1: Vector3, v2: Vector3, factor: number): this;
    slerp(other: Vector3, factor: number): this;
    slerpVectors(start: Vector3, end: Vector3, factor: number): this;
    distFromSq(other: Vector3): number;
    distFrom(other: Vector3): number;
    set(x: number, y: number, z: number): this;
    setFromArray(a: number[], _offset?: number): this;
    setFromMatrix(m: Matrix44): this;
    setFromMatrixColumn(m: Matrix44, index: number): this;
    rotate(q: Quaternion): this;
    transform(m: Matrix44): this;
    transformDirection(m: Matrix44): this;
    copy(other: Vector3): this;
    equals(other: Vector3): boolean;
    asArray(): number[];
    toArray(a: number[], offset: number): number[];
    projectOnLine(a: Vector3, b: Vector3): number;
    projectOnVector(a: Vector3): this;
    plus(other: Vector3): Vector3;
    minus(other: Vector3): Vector3;
    reflect(normal: Vector3): void;
}
