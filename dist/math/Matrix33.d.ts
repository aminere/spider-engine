import { Matrix44 } from "./Matrix44";
import { ObjectPool } from "../core/ObjectPool";
export declare class Matrix33 {
    static identity: Matrix33;
    static pool: ObjectPool<Matrix33>;
    data: number[];
    static fromPool(): Matrix33;
    constructor(data?: number[]);
    setIdentity(): this;
    set(n11: number, n12: number, n13: number, n21: number, n22: number, n23: number, n31: number, n32: number, n33: number): this;
    setFromMatrix4(m: Matrix44): this;
    multiply(m: Matrix33): this;
    multiplyMatrices(a: Matrix33, b: Matrix33): this;
    multiplyScalar(s: number): this;
    determinant(): number;
    getInverse(matrix: Matrix33): this;
    transpose(): this;
    getNormalMatrix(matrix4: Matrix44): this;
    scale(sx: number, sy: number): this;
    rotate(theta: number): this;
    translate(tx: number, ty: number): this;
}
