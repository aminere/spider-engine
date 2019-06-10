import { Matrix44 } from "./Matrix44";
import { Quaternion } from "./Quaternion";
import { ObjectPool } from "../core/ObjectPool";

export class Vector3 {
    static zero = new Vector3();
    static one = new Vector3(1.0, 1.0, 1.0);
    static right = new Vector3(1, 0, 0);
    static up = new Vector3(0, 1, 0);
    static forward = new Vector3(0, 0, 1);

    /**
     * @hidden
     */
    static dummy = new Vector3();
    /**
     * @hidden
     */
    static dummy2 = new Vector3();

    static pool = new ObjectPool(Vector3, 128);

    get x() { return this._x; }
    get y() { return this._y; }
    get z() { return this._z; }
    set x(x: number) { this._x = x; }
    set y(y: number) { this._y = y; }
    set z(z: number) { this._z = z; }
    get length() { return Math.sqrt(this.lengthSq); }
    get lengthSq() { return this.x * this.x + this.y * this.y + this.z * this.z; }

    private _x: number;
    private _y: number;
    private _z: number;

    private _array!: number[];

    static distance(a: Vector3, b: Vector3) {
        return Math.sqrt(Vector3.distanceSq(a, b));
    }

    static distanceSq(a: Vector3, b: Vector3) {
        let dx = a.x - b.x;
        let dy = a.y - b.y;
        let dz = a.z - b.z;
        return dx * dx + dy * dy + dz * dz;
    }

    static fromPool() {
        return Vector3.pool.get();
    }

    static fromArray(a: number[], index?: number) {
        let _index = index || 0;
        return new Vector3(a[_index], a[_index + 1], a[_index + 2]);
    }

    constructor(x?: number, y?: number, z?: number) {
        this._x = x || 0;
        this._y = y || 0;
        this._z = z || 0;
    }

    flip() {
        let { x, y, z } = this;
        this._x = -x;
        this._y = -y;
        this.z = -z;
        return this;
    }

    cross(v: Vector3) {
        return this.crossVectors(this, v);
    }

    crossVectors(a: Vector3, b: Vector3) {
        let ax = a.x, ay = a.y, az = a.z;
        let bx = b.x, by = b.y, bz = b.z;
        this._x = ay * bz - az * by;
        this._y = az * bx - ax * bz;
        this.z = ax * by - ay * bx;
        return this;
    }

    dot(other: Vector3) {
        return (this.x * other.x) + (this.y * other.y) + (this.z * other.z);
    }

    substract(other: Vector3) {
        return this.substractVectors(this, other);
    }

    substractVectors(a: Vector3, b: Vector3) {
        this._x = a.x - b.x;
        this._y = a.y - b.y;
        this.z = a.z - b.z;
        return this;
    }

    add(other: Vector3) {
        return this.addVectors(this, other);
    }

    addVectors(a: Vector3, b: Vector3) {
        this._x = a.x + b.x;
        this._y = a.y + b.y;
        this.z = a.z + b.z;
        return this;
    }

    multiply(scalar: number) {
        this._x *= scalar;
        this._y *= scalar;
        this.z *= scalar;
        return this;
    }

    multiplyVector(other: Vector3) {
        this._x *= other.x;
        this._y *= other.y;
        this.z *= other.z;
        return this;
    }

    divide(scalar: number) {
        this._x /= scalar;
        this._y /= scalar;
        this.z /= scalar;
        return this;
    }

    divideVector(other: Vector3) {
        this._x /= other.x;
        this._y /= other.y;
        this.z /= other.z;
        return this;
    }

    min() {
        const { x, y, z } = this;
        return Math.min(x, Math.min(y, z));
    }

    max() {
        const { x, y, z } = this;
        return Math.max(x, Math.max(y, z));
    }

    normalize() {
        const len = this.length;
        if (len < Number.EPSILON) {
            if (process.env.NODE_ENV === "development") {
                console.assert(false, "Normalizing a zero Vector3");
            }
            return this;
        } else {
            return this.multiply(1 / len);
        }
    }

    lerp(other: Vector3, factor: number) {
        return this.lerpVectors(this, other, factor);
    }

    lerpVectors(v1: Vector3, v2: Vector3, factor: number) {
        this._x = v1.x + (v2.x - v1.x) * factor;
        this._y = v1.y + (v2.y - v1.y) * factor;
        this.z = v1.z + (v2.z - v1.z) * factor;
        return this;
    }

    slerp(other: Vector3, factor: number) {
        return this.slerpVectors(this, other, factor);
    }

    // Special Thanks to Johnathan, Shaun and Geof!
    slerpVectors(start: Vector3, end: Vector3, factor: number) {
        // Dot product - the cosine of the angle between 2 vectors.
        let dot = start.dot(end);
        // Clamp it to be in the range of Acos()       
        // can't use MathUtils because typescript compiler can't deal with circular dependencies!!
        dot = Math.max(Math.min(dot, 1), -1);
        // dot = MathUtils.clamp(dot, -1, 1);
        // Acos(dot) returns the angle between start and end,
        // And multiplying that by percent returns the angle between
        // start and the final result.
        const theta = Math.acos(dot) * factor;
        const relativeVec = Vector3.dummy.copy(start).multiply(-dot).add(end);
        const length = relativeVec.length;
        if (length > 0) {
            relativeVec.multiply((1 / length)).multiply(Math.sin(theta));
        }
        return this.copy(start).multiply(Math.cos(theta)).add(relativeVec);
    }

    distFromSq(other: Vector3) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const dz = this.z - other.z;
        return dx * dx + dy * dy + dz * dz;
    }

    distFrom(other: Vector3) {
        return Math.sqrt(this.distFromSq(other));
    }

    set(x: number, y: number, z: number) {
        this._x = x;
        this._y = y;
        this.z = z;
        return this;
    }

    setFromArray(a: number[], _offset?: number) {
        const offset = _offset || 0;
        console.assert(a.length > offset + 2);
        this._x = a[offset];
        this._y = a[offset + 1];
        this.z = a[offset + 2];
        return this;
    }

    setFromMatrix(m: Matrix44) {
        this._x = m.data[12];
        this._y = m.data[13];
        this.z = m.data[14];
        return this;
    }

    setFromMatrixColumn(m: Matrix44, index: number) {
        return this.setFromArray(m.data, index * 4);
    }

    rotate(q: Quaternion) {
        // based on Threejs
        const { x, y, z } = this;
        const qx = q.x, qy = q.y, qz = q.z, qw = q.w;

        // calculate quat * vector
        const ix = qw * x + qy * z - qz * y;
        const iy = qw * y + qz * x - qx * z;
        const iz = qw * z + qx * y - qy * x;
        const iw = -qx * x - qy * y - qz * z;

        // calculate result * inverse quat
        this._x = ix * qw + iw * - qx + iy * - qz - iz * - qy;
        this._y = iy * qw + iw * - qy + iz * - qx - ix * - qz;
        this.z = iz * qw + iw * - qz + ix * - qy - iy * - qx;
        return this;
        // Irrlicht / nVidia SDK implementation
        // let qvec = Vector3.fromPool().set(q.x, q.y, q.z);
        // let uv = Vector3.fromPool().crossVectors(qvec, this);
        // let uuv = Vector3.fromPool().crossVectors(qvec, uv);
        // uv.multiply(2 * q.w);
        // uuv.multiply(2);
        // return this.add(uv).add(uuv);
    }

    transform(m: Matrix44) {
        const { x, y, z } = this;
        const e = m.data;
        this._x = e[0] * x + e[4] * y + e[8] * z + e[12];
        this._y = e[1] * x + e[5] * y + e[9] * z + e[13];
        this._z = e[2] * x + e[6] * y + e[10] * z + e[14];
        const w = e[3] * x + e[7] * y + e[11] * z + e[15];
        return this.multiply(1 / w);
    }

    transformDirection(m: Matrix44) {
        // based on Three.js
        // vector interpreted as a direction
        const { x, y, z } = this;
        const e = m.data;
        this._x = e[0] * x + e[4] * y + e[8] * z;
        this._y = e[1] * x + e[5] * y + e[9] * z;
        this._z = e[2] * x + e[6] * y + e[10] * z;
        return this.normalize();
    }

    copy(other: Vector3) {
        this._x = other.x;
        this._y = other.y;
        this.z = other.z;
        return this;
    }

    equals(other: Vector3) {
        return this.x === other.x && this.y === other.y && this.z === other.z;
    }

    asArray() {
        if (!this._array) {
            this._array = [this.x, this.y, this.z];
            return this._array;
        }

        this._array[0] = this.x;
        this._array[1] = this.y;
        this._array[2] = this.z;
        return this._array;
    }

    toArray(a: number[], offset: number) {
        a[offset] = this.x;
        a[offset + 1] = this.y;
        a[offset + 2] = this.z;
        return a;
    }

    // Returns a factor T such as Intersection = A + (B-A).normalized() * T
    projectOnLine(a: Vector3, b: Vector3) {
        const bMinusA = Vector3.dummy;
        const pointMinusA = Vector3.dummy2;
        bMinusA.substractVectors(b, a).normalize();
        pointMinusA.substractVectors(this, a);
        return bMinusA.dot(pointMinusA);
    }

    projectOnVector(a: Vector3) {
        const otherLength = a.length;
        if (otherLength < Number.EPSILON) {
            return this;
        }
        const aNormalized = Vector3.dummy.copy(a).multiply(1 / otherLength);
        const scalarProjection = this.dot(aNormalized);
        return this.copy(aNormalized).multiply(scalarProjection);
    }

    plus(other: Vector3) {
        return Vector3.dummy.copy(this).add(other);
    }

    minus(other: Vector3) {
        return Vector3.dummy.copy(this).substract(other);
    }

    reflect(normal: Vector3) {
        // Reflected = Direction - 2 * Dot( Direction, Normal ) * Normal
        Vector3.dummy.copy(normal).multiply(2 * this.dot(normal));
        this.substract(Vector3.dummy);
    }
}
