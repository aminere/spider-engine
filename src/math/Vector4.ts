import { Matrix44 } from "./Matrix44";
import { Vector3 } from "./Vector3";
import { ObjectPool } from "../core/ObjectPool";

export class Vector4 {

    static dummy = new Vector4();

    static pool = new ObjectPool(Vector4, 128);

    get manhattanLength() {
        return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w);
    }    

    get x() { return this._x; }
    get y() { return this._y; }
    get z() { return this._z; }
    get w() { return this._w; }
    set x(x: number) { this._x = x; }
    set y(y: number) { this._y = y; }
    set z(z: number) { this._z = z; }
    set w(w: number) { this._w = w; }

    private _x!: number;
    private _y!: number;
    private _z!: number;
    private _w!: number;

    private _array!: number[];

    static fromArray(arr: number[]) {
        let v = new Vector4();
        if (arr.length > 0) { v.x = arr[0]; }
        if (arr.length > 1) { v.y = arr[1]; }
        if (arr.length > 2) { v.z = arr[2]; }
        if (arr.length > 3) { v.w = arr[3]; }
    }

    static fromPool() {
        return Vector4.pool.get();
    }

    constructor(x?: number, y?: number, z?: number, w?: number) {
        this.set(x || 0, y || 0, z || 0, w || 0);
    }    

    set(x: number, y: number, z: number, w: number) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        return this;
    }

    copy(other: Vector4) {
        this._x = other.x;
        this._y = other.y;
        this._z = other.z;
        this.w = other.w;
        return this;
    }

    multiply(scalar: number) {
        this.x = this.x * scalar;
        this.y = this.y * scalar;
        this.z = this.z * scalar;
        this.w = this.w * scalar;
        return this;
    }

    toArray() {
        if (!this._array) {
            this._array = [this.x, this.y, this.z, this.w];
            return this._array;
        }

        this._array[0] = this.x;
        this._array[1] = this.y;
        this._array[2] = this.z;
        this._array[3] = this.w;
        return this._array;
    }

    transform(m: Matrix44) {
        let { x, y, z, w } = this;
        let e = m.data;
        this.x = e[0] * x + e[4] * y + e[8] * z + e[12] * w;
        this.y = e[1] * x + e[5] * y + e[9] * z + e[13] * w;
        this.z = e[2] * x + e[6] * y + e[10] * z + e[14] * w;
        this.w = e[3] * x + e[7] * y + e[11] * z + e[15] * w;
        return this;
    }

    getVec3(out: Vector3) {
        return out.set(this.x, this.y, this.z);
    }
}
