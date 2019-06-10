
import { Matrix44 } from "./Matrix44";
import { ObjectPool } from "../core/ObjectPool";

export class Matrix33 {
    static identity = new Matrix33();

    static pool = new ObjectPool(Matrix33, 8);

    data: number[];

    static fromPool() {
        return Matrix33.pool.get();
    }

    constructor(data?: number[]) {
        this.data = data || [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ];
    }

    setIdentity() {
        this.set(
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        );
        return this;
    }

    set(
        n11: number,
        n12: number,
        n13: number,
        n21: number,
        n22: number,
        n23: number,
        n31: number,
        n32: number,
        n33: number
    ) {
        var te = this.data;
        te[0] = n11; te[3] = n12; te[6] = n13;
        te[1] = n21; te[4] = n22; te[7] = n23;
        te[2] = n31; te[5] = n32; te[8] = n33;
        return this;
    }

    setFromMatrix4(m: Matrix44) {
        var me = m.data;
        this.set(
            me[0], me[4], me[8],
            me[1], me[5], me[9],
            me[2], me[6], me[10]
        );
        return this;
    }

    multiply(m: Matrix33) {
        return this.multiplyMatrices(this, m);
    }

    multiplyMatrices(a: Matrix33, b: Matrix33) {
        var ae = a.data;
        var be = b.data;
        var te = this.data;
        var a11 = ae[0], a12 = ae[3], a13 = ae[6];
        var a21 = ae[1], a22 = ae[4], a23 = ae[7];
        var a31 = ae[2], a32 = ae[5], a33 = ae[8];
        var b11 = be[0], b12 = be[3], b13 = be[6];
        var b21 = be[1], b22 = be[4], b23 = be[7];
        var b31 = be[2], b32 = be[5], b33 = be[8];
        te[0] = a11 * b11 + a12 * b21 + a13 * b31;
        te[3] = a11 * b12 + a12 * b22 + a13 * b32;
        te[6] = a11 * b13 + a12 * b23 + a13 * b33;
        te[1] = a21 * b11 + a22 * b21 + a23 * b31;
        te[4] = a21 * b12 + a22 * b22 + a23 * b32;
        te[7] = a21 * b13 + a22 * b23 + a23 * b33;
        te[2] = a31 * b11 + a32 * b21 + a33 * b31;
        te[5] = a31 * b12 + a32 * b22 + a33 * b32;
        te[8] = a31 * b13 + a32 * b23 + a33 * b33;
        return this;
    }

    multiplyScalar(s: number) {
        let te = this.data;
        te[0] *= s; te[3] *= s; te[6] *= s;
        te[1] *= s; te[4] *= s; te[7] *= s;
        te[2] *= s; te[5] *= s; te[8] *= s;
        return this;

    }

    determinant() {
        let te = this.data;
        let a = te[0], b = te[1], c = te[2],
            d = te[3], e = te[4], f = te[5],
            g = te[6], h = te[7], i = te[8];
        return a * e * i - a * f * h - b * d * i + b * f * g + c * d * h - c * e * g;
    }

    getInverse(matrix: Matrix33) {
        let me = matrix.data,
            te = this.data,
            n11 = me[0], n21 = me[1], n31 = me[2],
            n12 = me[3], n22 = me[4], n32 = me[5],
            n13 = me[6], n23 = me[7], n33 = me[8],
            t11 = n33 * n22 - n32 * n23,
            t12 = n32 * n13 - n33 * n12,
            t13 = n23 * n12 - n22 * n13,
            det = n11 * t11 + n21 * t12 + n31 * t13;

        if (det === 0) {
            // TODO show warning??
            return this.setIdentity();
        }

        let detInv = 1 / det;
        te[0] = t11 * detInv;
        te[1] = (n31 * n23 - n33 * n21) * detInv;
        te[2] = (n32 * n21 - n31 * n22) * detInv;
        te[3] = t12 * detInv;
        te[4] = (n33 * n11 - n31 * n13) * detInv;
        te[5] = (n31 * n12 - n32 * n11) * detInv;
        te[6] = t13 * detInv;
        te[7] = (n21 * n13 - n23 * n11) * detInv;
        te[8] = (n22 * n11 - n21 * n12) * detInv;
        return this;
    }

    transpose() {
        let tmp, m = this.data;
        tmp = m[1]; m[1] = m[3]; m[3] = tmp;
        tmp = m[2]; m[2] = m[6]; m[6] = tmp;
        tmp = m[5]; m[5] = m[7]; m[7] = tmp;
        return this;
    }

    getNormalMatrix(matrix4: Matrix44) {
        return this.setFromMatrix4(matrix4).getInverse(this).transpose();
    }

    scale(sx: number, sy: number) {
        let te = this.data;
        te[0] *= sx; te[3] *= sx; te[6] *= sx;
        te[1] *= sy; te[4] *= sy; te[7] *= sy;
        return this;
    }

    rotate(theta: number) {
        let c = Math.cos(theta);
        let s = Math.sin(theta);
        let te = this.data;
        let a11 = te[0], a12 = te[3], a13 = te[6];
        let a21 = te[1], a22 = te[4], a23 = te[7];
        te[0] = c * a11 + s * a21;
        te[3] = c * a12 + s * a22;
        te[6] = c * a13 + s * a23;
        te[1] = - s * a11 + c * a21;
        te[4] = - s * a12 + c * a22;
        te[7] = - s * a13 + c * a23;
        return this;

    }

    translate(tx: number, ty: number) {
        let te = this.data;
        te[0] += tx * te[2]; te[3] += tx * te[5]; te[6] += tx * te[8];
        te[1] += ty * te[2]; te[4] += ty * te[5]; te[7] += ty * te[8];
        return this;
    }
}
