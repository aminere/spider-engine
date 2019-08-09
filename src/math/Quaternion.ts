import { Vector3 } from "./Vector3";
import { Matrix44 } from "./Matrix44";
import { ObjectPool } from "../core/ObjectPool";

/**
 * @hidden
 */
namespace Private {
    export let dummy = new Matrix44();
}

export type RotationOrder = "YXZ" | "ZYX" | "ZYX" | "XYZ" | "ZXY" | "YZX" | "XZY";

export class Quaternion {

    static identity = new Quaternion();
    static dummy = new Quaternion();

    static pool = new ObjectPool(Quaternion, 64);

    get length() { return Math.sqrt(this.lengthSq); }
    get lengthSq() { return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w; }
    get x() { return this._x; }
    get y() { return this._y; }
    get z() { return this._z; }
    get w() { return this._w; }
    set x(x: number) { this._x = x; }
    set y(y: number) { this._y = y; }
    set z(z: number) { this._z = z; }
    set w(w: number) { this._w = w; }

    private _x: number;
    private _y: number;
    private _z: number;
    private _w: number;

    static fromPool() {
        return Quaternion.pool.get();
    }

    /**
     * 
     * @param x Rotation around the x axis in Radians
     * @param y Rotation around the y axis in Radians
     * @param z Rotation around the z axis in Radians
     * @param order Rotation order
     */
    static fromEulerAngles(x: number, y: number, z: number, order: RotationOrder = "YXZ") {
        return new Quaternion().setFromEulerAngles(x, y, z, order);
    }

    static fromAxisAngle(axis: Vector3, radians: number) {
        return new Quaternion().setFromAxisAngle(axis, radians);
    }

    static fromUnitVectors(from: Vector3, to: Vector3) {
        return new Quaternion().setFromUnitVectors(from, to);
    }

    constructor(x?: number, y?: number, z?: number, w?: number) {
        this._x = x || 0;
        this._y = y || 0;
        this._z = z || 0;
        this._w = w || 1;
    }

    set(x: number, y: number, z: number, w: number) {
        this._x = x;
        this._y = y;
        this._z = z;
        this.w = w;
    }

    setFromAxisAngle(axis: Vector3, radians: number) {
        const halfAngle = radians / 2, s = Math.sin(halfAngle);
        this._x = axis.x * s;
        this._y = axis.y * s;
        this._z = axis.z * s;
        this._w = Math.cos(halfAngle);
        return this.normalize();
    }

    /**
     * 
     * @param x Rotation around the x axis in Radians
     * @param y Rotation around the y axis in Radians
     * @param z Rotation around the z axis in Radians
     * @param order Rotation order
     */
    setFromEulerAngles(x: number, y: number, z: number, order: RotationOrder = "YXZ") {
        // based on Threejs
        const c1 = Math.cos(x / 2);
        const c2 = Math.cos(y / 2);
        const c3 = Math.cos(z / 2);
        const s1 = Math.sin(x / 2);
        const s2 = Math.sin(y / 2);
        const s3 = Math.sin(z / 2);
        if (order === "YXZ") {
            this._x = s1 * c2 * c3 + c1 * s2 * s3;
            this._y = c1 * s2 * c3 - s1 * c2 * s3;
            this._z = c1 * c2 * s3 - s1 * s2 * c3;
            this._w = c1 * c2 * c3 + s1 * s2 * s3;
        } else if (order === "ZYX") {
            this._x = s1 * c2 * c3 - c1 * s2 * s3;
            this._y = c1 * s2 * c3 + s1 * c2 * s3;
            this._z = c1 * c2 * s3 - s1 * s2 * c3;
            this._w = c1 * c2 * c3 + s1 * s2 * s3;
        } else if (order === "XYZ") {
            this._x = s1 * c2 * c3 + c1 * s2 * s3;
            this._y = c1 * s2 * c3 - s1 * c2 * s3;
            this._z = c1 * c2 * s3 + s1 * s2 * c3;
            this._w = c1 * c2 * c3 - s1 * s2 * s3;
        } else if (order === "ZXY") {
            this._x = s1 * c2 * c3 - c1 * s2 * s3;
            this._y = c1 * s2 * c3 + s1 * c2 * s3;
            this._z = c1 * c2 * s3 + s1 * s2 * c3;
            this._w = c1 * c2 * c3 - s1 * s2 * s3;
        } else if (order === "YZX") {
            this._x = s1 * c2 * c3 + c1 * s2 * s3;
            this._y = c1 * s2 * c3 + s1 * c2 * s3;
            this._z = c1 * c2 * s3 - s1 * s2 * c3;
            this._w = c1 * c2 * c3 - s1 * s2 * s3;
        } else if (order === "XZY") {
            this._x = s1 * c2 * c3 - c1 * s2 * s3;
            this._y = c1 * s2 * c3 - s1 * c2 * s3;
            this._z = c1 * c2 * s3 + s1 * s2 * c3;
            this._w = c1 * c2 * c3 + s1 * s2 * s3;
        }
        return this.normalize();
    }

    setFromEulerVector(euler: Vector3) {
        return this.setFromEulerAngles(euler.x, euler.y, euler.z);
    }

    setFromUnitVectors(from: Vector3, to: Vector3) {
        // Based on Threejs
        const v = Vector3.dummy;
        let r = from.dot(to) + 1;
        if (r < 0.000001) {
            r = 0;
            if (Math.abs(from.x) > Math.abs(from.z)) {
                v.set(-from.y, from.x, 0);
            } else {
                v.set(0, -from.z, from.y);
            }
        } else {
            v.crossVectors(from, to);
        }
        this._x = v.x;
        this._y = v.y;
        this._z = v.z;
        this._w = r;
        return this.normalize();
    }

    setFromMatrix(m: Matrix44) {
        // based on Threejs
        let te = m.data,
            m11 = te[0], m12 = te[4], m13 = te[8],
            m21 = te[1], m22 = te[5], m23 = te[9],
            m31 = te[2], m32 = te[6], m33 = te[10],
            trace = m11 + m22 + m33,
            s;

        if (trace > 0) {
            s = 0.5 / Math.sqrt(trace + 1.0);
            this._w = 0.25 / s;
            this._x = (m32 - m23) * s;
            this._y = (m13 - m31) * s;
            this._z = (m21 - m12) * s;

        } else if (m11 > m22 && m11 > m33) {
            s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);
            this._w = (m32 - m23) / s;
            this._x = 0.25 * s;
            this._y = (m12 + m21) / s;
            this._z = (m13 + m31) / s;

        } else if (m22 > m33) {
            s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);
            this._w = (m13 - m31) / s;
            this._x = (m12 + m21) / s;
            this._y = 0.25 * s;
            this._z = (m23 + m32) / s;

        } else {
            s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);
            this._w = (m21 - m12) / s;
            this._x = (m13 + m31) / s;
            this._y = (m23 + m32) / s;
            this._z = 0.25 * s;
        }
        return this.normalize();
    }

    lookAt(forward: Vector3, up: Vector3) {
        const { dummy } = Private;
        dummy.makeLookAt(forward, up).transpose();
        return this.setFromMatrix(dummy);
    }

    normalize() {
        let l = this.length;
        if (l === 0) {
            if (process.env.NODE_ENV === "development") {
                console.assert(false, "Normalizing a zero Quaternion");
            }
        } else {
            l = 1 / l;
            this._x *= l;
            this._y *= l;
            this._z *= l;
            this.w *= l;
        }
        return this;
    }

    multiply(other: Quaternion) {
        return this.multiplyQuaternions(this, other);
    }

    multiplyQuaternions(b: Quaternion, a: Quaternion) {
        // based on Threejs
        const qax = a._x, qay = a._y, qaz = a._z, qaw = a._w;
        const qbx = b._x, qby = b._y, qbz = b._z, qbw = b._w;
        this._x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
        this._y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
        this._z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
        this.w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
        return this;
    }

    toEuler(euler: Vector3) {
        return Private.dummy.setRotation(this).toEuler(euler);
    }

    equals(other: Quaternion) {
        return this._x === other._x
            && this._y === other._y
            && this._z === other._z
            && this._w === other._w;
    }

    copy(other: Quaternion) {
        this._x = other._x;
        this._y = other._y;
        this._z = other._z;
        this.w = other._w;
        return this;
    }

    invert() {
        // quaternion is assumed to have unit length
        return this.conjugate();
    }

    getInverse(out: Quaternion) {
        return out.copy(this).invert();
    }

    conjugate() {
        this._x *= -1;
        this._y *= -1;
        this.z *= -1;
        return this;
    }

    slerpQuaternions(a: Quaternion, b: Quaternion, t: number) {
        return this.copy(a).slerp(b, t);
    }

    slerp(qb: Quaternion, t: number) {
        // base on Three.js
        if (t === 0) {
            return this;
        }
        if (t === 1) {
            return this.copy(qb);
        }

        const { _x, _y, _z, _w } = this;        
        // http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/
        let cosHalfTheta = _w * qb._w + _x * qb._x + _y * qb._y + _z * qb._z;
        if (cosHalfTheta < 0) {
            this._w = - qb._w;
            this._x = - qb._x;
            this._y = - qb._y;
            this._z = - qb._z;
            cosHalfTheta = -cosHalfTheta;
        } else {
            this.copy(qb);
        }

        if (cosHalfTheta >= 1.0) {
            this._w = _w;
            this._x = _x;
            this._y = _y;
            this.z = _z;
            return this;
        }

        const sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);
        if (Math.abs(sinHalfTheta) < 0.001) {
            this._w = 0.5 * (_w + this.w);
            this._x = 0.5 * (_x + this.x);
            this._y = 0.5 * (_y + this.y);
            this.z = 0.5 * (_z + this.z);
            return this;
        }

        const halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta);
        const ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta, ratioB = Math.sin(t * halfTheta) / sinHalfTheta;
        this._w = (_w * ratioA + this.w * ratioB);
        this._x = (_x * ratioA + this.x * ratioB);
        this._y = (_y * ratioA + this.y * ratioB);
        this.z = (_z * ratioA + this.z * ratioB);
        return this;
    }
}
