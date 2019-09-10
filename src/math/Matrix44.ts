
import { Vector3 } from "./Vector3";
import { MathEx } from "./MathEx";
import { Quaternion } from "./Quaternion";
import { ObjectPool } from "../core/ObjectPool";

namespace Private {
    export let dummy = new Vector3();
    export let dummy2 = new Vector3();
    export let dummy3 = new Vector3();
}

export class Matrix44 {

    static identity = new Matrix44();    
    static dummy = new Matrix44();
    static pool = new ObjectPool(Matrix44, 64);

    data: number[];

    static fromArray(data: number[]) {
        let m = new Matrix44();
        m.data = data.slice();
        return m;
    }

    static fromPool() {
        return Matrix44.pool.get();
    }

    constructor(data?: number[]) {
        this.data = data || [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    }

    makeOrthoProjection(left: number, right: number, top: number, bottom: number, near: number, far: number) {
        const te = this.data;
        const w = 1.0 / (right - left);
        const h = 1.0 / (top - bottom);
        const p = 1.0 / (far - near);

        const x = (right + left) * w;
        const y = (top + bottom) * h;
        const z = (far + near) * p;

        te[0] = 2 * w; te[4] = 0; te[8] = 0; te[12] = -x;
        te[1] = 0; te[5] = 2 * h; te[9] = 0; te[13] = -y;
        te[2] = 0; te[6] = 0; te[10] = -2 * p; te[14] = -z;
        te[3] = 0; te[7] = 0; te[11] = 0; te[15] = 1;
        return this;
    }

    makePerspectiveProjection(fovRadians: number, aspectRatio: number, zNear: number, zFar: number) {
        // based on https://www.gamedev.net/articles/programming/graphics/perspective-projections-in-lh-and-rh-systems-r3598/
        const m = this.data;
        const f = 1 / Math.tan(fovRadians / 2);
        const invRange = 1 / (zNear - zFar);
        const a = (zFar + zNear) * invRange;
        // LH projection
        // const invRange = 1 / (zFar - zNear);
        // const a = -(zFar + zNear) * invRange;
        const b = (zNear * zFar * 2) * invRange;
        m[0] = f / aspectRatio; m[1] = 0.0;  m[2] = 0.0; m[3] = 0.0;
        m[4] = 0.0;             m[5] = f;    m[6] = 0.0; m[7] = 0.0;
        m[8] = 0.0;             m[9] = 0.0;  m[10] = a;  m[11] = -1; // flip for LH projection
        m[12] = 0.0;            m[13] = 0.0; m[14] = b;  m[15] = 0.0;
        return this;
        return this;
    }

    setRotation(q: Quaternion) {
        // based on Threejs
        var te = this.data;

        var x = q.x, y = q.y, z = q.z, w = q.w;
        var x2 = x + x, y2 = y + y, z2 = z + z;
        var xx = x * x2, xy = x * y2, xz = x * z2;
        var yy = y * y2, yz = y * z2, zz = z * z2;
        var wx = w * x2, wy = w * y2, wz = w * z2;

        te[0] = 1 - (yy + zz);
        te[4] = xy - wz;
        te[8] = xz + wy;

        te[1] = xy + wz;
        te[5] = 1 - (xx + zz);
        te[9] = yz - wx;

        te[2] = xz - wy;
        te[6] = yz + wx;
        te[10] = 1 - (xx + yy);

        // last column
        te[3] = 0;
        te[7] = 0;
        te[11] = 0;

        // bottom row
        te[12] = 0;
        te[13] = 0;
        te[14] = 0;
        te[15] = 1;

        return this;
    }

    getRotation(outRotation: Quaternion) {
        this.decompose(Vector3.dummy, outRotation, Vector3.dummy);
        return outRotation;
    }

    rotate(q: Quaternion) {
        return this.multiply(Matrix44.dummy.setRotation(q));
    }

    makeLookAt(forward: Vector3, up: Vector3) {
        let { dummy, dummy2, dummy3 } = Private;
        let x = dummy, y = dummy2, z = dummy3;
        // based on https://en.wikibooks.org/wiki/GLSL_Programming/Vertex_Transformations
        z.copy(forward).normalize();
        x.crossVectors(up, z);
        if (x.lengthSq === 0) {
            // eye and target are in the same vertical
            z.z += 0.0001;
            x.crossVectors(up, z);
        }
        x.normalize();
        y.crossVectors(z, x);
        let te = this.data;
        te[0] = x.x; te[4] = x.y; te[8] = x.z; te[12] = 0;
        te[1] = y.x; te[5] = y.y; te[9] = y.z; te[13] = 0;
        te[2] = z.x; te[6] = z.y; te[10] = z.z; te[14] = 0;
        te[3] = 0; te[7] = 0; te[11] = 0; te[15] = 1;
        return this;
    }

    setIdentity() {
        let m = this.data;
        m[0] = 1; m[4] = 0; m[8] = 0; m[12] = 0;
        m[1] = 0; m[5] = 1; m[9] = 0; m[13] = 0;
        m[2] = 0; m[6] = 0; m[10] = 1; m[14] = 0;
        m[3] = 0; m[7] = 0; m[11] = 0; m[15] = 1;
        return this;
    }

    set(
        n11: number,
        n12: number,
        n13: number,
        n14: number,
        n21: number,
        n22: number,
        n23: number,
        n24: number,
        n31: number,
        n32: number,
        n33: number,
        n34: number,
        n41: number,
        n42: number,
        n43: number,
        n44: number
    ) {
        var te = this.data;
        te[0] = n11; te[4] = n12; te[8] = n13; te[12] = n14;
        te[1] = n21; te[5] = n22; te[9] = n23; te[13] = n24;
        te[2] = n31; te[6] = n32; te[10] = n33; te[14] = n34;
        te[3] = n41; te[7] = n42; te[11] = n43; te[15] = n44;
        return this;
    }

    toEuler(euler: Vector3) {
        // based on Threejs, YXZ order
        let te = this.data;
        let m11 = te[0], m12 = te[4], m13 = te[8];
        let m21 = te[1], m22 = te[5], m23 = te[9];
        let m31 = te[2], m32 = te[6], m33 = te[10];

        euler.x = Math.asin(-MathEx.clamp(m23, - 1, 1));
        if (Math.abs(m23) < 0.99999) {
            euler.y = Math.atan2(m13, m33);
            euler.z = Math.atan2(m21, m22);
        } else {
            euler.y = Math.atan2(- m31, m11);
            euler.z = 0;
        }
        return euler;
    }

    scale(v: Vector3) {
        return this.scaleFromCoords(v.x, v.y, v.z);
    }

    scaleFromCoords(x: number, y: number, z: number) {
        let te = this.data;
        te[0] *= x; te[4] *= y; te[8] *= z;
        te[1] *= x; te[5] *= y; te[9] *= z;
        te[2] *= x; te[6] *= y; te[10] *= z;
        te[3] *= x; te[7] *= y; te[11] *= z;
        return this;
    }

    setPosition(v: Vector3) {
        return this.setPositionFromCoords(v.x, v.y, v.z);
    }

    getPosition(out: Vector3) {
        const te = this.data;
        out.x = te[12];
        out.y = te[13];
        out.z = te[14];
    }

    setPositionFromCoords(x: number, y: number, z: number) {
        var te = this.data;
        te[12] = x;
        te[13] = y;
        te[14] = z;
        return this;
    }

    translate(v: Vector3) {
        return this.translateFromCoords(v.x, v.y, v.z);
    }

    translateFromCoords(x: number, y: number, z: number) {
        var te = this.data;
        te[12] += x;
        te[13] += y;
        te[14] += z;
        return this;
    }

    compose(position: Vector3, rotation: Quaternion, scale: Vector3) {
        this.setRotation(rotation);
        this.scale(scale);
        this.setPosition(position);
        return this;
    }

    decompose(position: Vector3, quaternion: Quaternion, scale: Vector3) {
        let { dummy } = Private;
        let matrix = Matrix44.dummy;
        // based on Threejs
        var te = this.data;

        var sx = dummy.set(te[0], te[1], te[2]).length;
        var sy = dummy.set(te[4], te[5], te[6]).length;
        var sz = dummy.set(te[8], te[9], te[10]).length;

        // if determine is negative, we need to invert one scale
        var det = this.determinant();
        if (det < 0) {
            sx = - sx;
        }

        position.x = te[12];
        position.y = te[13];
        position.z = te[14];

        // scale the rotation part
        this.copy.call(matrix, this);
        var invSX = 1 / (sx || MathEx.EPSILON);
        var invSY = 1 / (sy || MathEx.EPSILON);
        var invSZ = 1 / (sz || MathEx.EPSILON);

        matrix.data[0] *= invSX;
        matrix.data[1] *= invSX;
        matrix.data[2] *= invSX;

        matrix.data[4] *= invSY;
        matrix.data[5] *= invSY;
        matrix.data[6] *= invSY;

        matrix.data[8] *= invSZ;
        matrix.data[9] *= invSZ;
        matrix.data[10] *= invSZ;

        quaternion.setFromMatrix(matrix);

        scale.x = sx;
        scale.y = sy;
        scale.z = sz;
        return this;
    }

    determinant() {
        // based on Threejs
        var te = this.data;
        var n11 = te[0], n12 = te[4], n13 = te[8], n14 = te[12];
        var n21 = te[1], n22 = te[5], n23 = te[9], n24 = te[13];
        var n31 = te[2], n32 = te[6], n33 = te[10], n34 = te[14];
        var n41 = te[3], n42 = te[7], n43 = te[11], n44 = te[15];
        // TODO: make this more efficient
        // ( based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm )
        return (
            n41 * (
                + n14 * n23 * n32
                - n13 * n24 * n32
                - n14 * n22 * n33
                + n12 * n24 * n33
                + n13 * n22 * n34
                - n12 * n23 * n34
            ) +
            n42 * (
                + n11 * n23 * n34
                - n11 * n24 * n33
                + n14 * n21 * n33
                - n13 * n21 * n34
                + n13 * n24 * n31
                - n14 * n23 * n31
            ) +
            n43 * (
                + n11 * n24 * n32
                - n11 * n22 * n34
                - n14 * n21 * n32
                + n12 * n21 * n34
                + n14 * n22 * n31
                - n12 * n24 * n31
            ) +
            n44 * (
                - n13 * n22 * n31
                - n11 * n23 * n32
                + n11 * n22 * n33
                + n13 * n21 * n32
                - n12 * n21 * n33
                + n12 * n23 * n31
            )
        );
    }

    transpose() {
        // based on Threejs
        var te = this.data;
        var tmp;
        tmp = te[1]; te[1] = te[4]; te[4] = tmp;
        tmp = te[2]; te[2] = te[8]; te[8] = tmp;
        tmp = te[6]; te[6] = te[9]; te[9] = tmp;

        tmp = te[3]; te[3] = te[12]; te[12] = tmp;
        tmp = te[7]; te[7] = te[13]; te[13] = tmp;
        tmp = te[11]; te[11] = te[14]; te[14] = tmp;
        return this;
    }

    multiply(other: Matrix44) {
        return this.multiplyMatrices(this, other);
    }

    multiplyMatrices(a: Matrix44, b: Matrix44) {
        // based on Threejs
        var ae = a.data;
        var be = b.data;
        var te = this.data;

        var a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12];
        var a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13];
        var a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14];
        var a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15];

        var b11 = be[0], b12 = be[4], b13 = be[8], b14 = be[12];
        var b21 = be[1], b22 = be[5], b23 = be[9], b24 = be[13];
        var b31 = be[2], b32 = be[6], b33 = be[10], b34 = be[14];
        var b41 = be[3], b42 = be[7], b43 = be[11], b44 = be[15];

        te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
        te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
        te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
        te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

        te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
        te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
        te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
        te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

        te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
        te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
        te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
        te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

        te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
        te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
        te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
        te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

        return this;
    }

    invert() {
        return this.getInverse(this);
    }

    getInverse(m: Matrix44) {
        // based on Threejs
        let te = this.data, me = m.data,
            n11 = me[0], n21 = me[1], n31 = me[2], n41 = me[3],
            n12 = me[4], n22 = me[5], n32 = me[6], n42 = me[7],
            n13 = me[8], n23 = me[9], n33 = me[10], n43 = me[11],
            n14 = me[12], n24 = me[13], n34 = me[14], n44 = me[15],
            t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44,
            t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44,
            t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44,
            t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;

        let det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;
        if (det === 0) {
            return this.setIdentity();
        }

        let detInv = 1 / det;
        te[0] = t11 * detInv;
        te[1] = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv;
        te[2] = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv;
        te[3] = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv;

        te[4] = t12 * detInv;
        te[5] = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv;
        te[6] = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv;
        te[7] = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv;

        te[8] = t13 * detInv;
        te[9] = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv;
        te[10] = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv;
        te[11] = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv;

        te[12] = t14 * detInv;
        te[13] = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv;
        te[14] = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv;
        te[15] = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv;
        return this;
    }

    getScale(out: Vector3) {
        let m = this.data;
        let x = out.set(m[0], m[1], m[2]).length;
        let y = out.set(m[4], m[5], m[6]).length;
        let z = out.set(m[8], m[9], m[10]).length;
        return out.set(x, y, z);
    }

    extractRotation(m: Matrix44) {
        // this method does not support reflection matrices
        var te = this.data;
        var me = m.data;
        let { dummy } = Private;
        var scaleX = 1 / dummy.setFromMatrixColumn(m, 0).length;
        var scaleY = 1 / dummy.setFromMatrixColumn(m, 1).length;
        var scaleZ = 1 / dummy.setFromMatrixColumn(m, 2).length;
        te[0] = me[0] * scaleX;
        te[1] = me[1] * scaleX;
        te[2] = me[2] * scaleX;
        te[3] = 0;
        te[4] = me[4] * scaleY;
        te[5] = me[5] * scaleY;
        te[6] = me[6] * scaleY;
        te[7] = 0;
        te[8] = me[8] * scaleZ;
        te[9] = me[9] * scaleZ;
        te[10] = me[10] * scaleZ;
        te[11] = 0;
        te[12] = 0;
        te[13] = 0;
        te[14] = 0;
        te[15] = 1;
        return this;
    }
    
    copyPosition(m: Matrix44) {
        var te = this.data;
        let me = m.data;
        te[12] = me[12];
        te[13] = me[13];
        te[14] = me[14];
        return this;
    }

    copy(other: Matrix44) {
        let m = this.data;
        let o = other.data;
        m[0] = o[0]; m[4] = o[4]; m[8] = o[8]; m[12] = o[12];
        m[1] = o[1]; m[5] = o[5]; m[9] = o[9]; m[13] = o[13];
        m[2] = o[2]; m[6] = o[6]; m[10] = o[10]; m[14] = o[14];
        m[3] = o[3]; m[7] = o[7]; m[11] = o[11]; m[15] = o[15];
        return this;
    }

    toArray(array: Float32Array, offset: number) {
        let te = this.data;
        array[offset] = te[0];
        array[offset + 1] = te[1];
        array[offset + 2] = te[2];
        array[offset + 3] = te[3];

        array[offset + 4] = te[4];
        array[offset + 5] = te[5];
        array[offset + 6] = te[6];
        array[offset + 7] = te[7];

        array[offset + 8] = te[8];
        array[offset + 9] = te[9];
        array[offset + 10] = te[10];
        array[offset + 11] = te[11];

        array[offset + 12] = te[12];
        array[offset + 13] = te[13];
        array[offset + 14] = te[14];
        array[offset + 15] = te[15];
        return array;
    }
}

export class SerializableMatrix44 extends Matrix44 {    
}
