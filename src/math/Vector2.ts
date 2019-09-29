import { ObjectPool } from "../core/ObjectPool";

export class Vector2 {

    static zero = new Vector2();
    static one = new Vector2(1.0, 1.0);
    static right = new Vector2(1, 0);
    static up = new Vector2(0, 1);

    static pool = new ObjectPool(Vector2, 128); 
    static dummy = new Vector2();

    get length() { return Math.sqrt(this.lengthSq); }
    get lengthSq() { return this.x * this.x + this.y * this.y; }

    public x: number;
    public y: number;

    private _array!: number[];    

    static fromArray(arr: number[]) {
        const v = new Vector2();
        if (arr.length > 0) { v.x = arr[0]; }
        if (arr.length > 1) { v.y = arr[1]; }
    }

    static fromPool() {
        return Vector2.pool.get();
    }

    constructor(x?: number, y?: number) {
        this.x = x || 0;
        this.y = y || 0;
    }

    set(x: number, y: number) {
        this.x = x;
        this.y = y;
        return this;
    }

    add(other: Vector2) {
        return this.addVectors(this, other);
    }

    addVectors(a: Vector2, b: Vector2) {
        this.x = a.x + b.x;
        this.y = a.y + b.y;
        return this;
    }

    substract(other: Vector2) {
        return this.substractVectors(this, other);
    }

    substractVectors(a: Vector2, b: Vector2) {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
        return this;
    }

    normalize() {
        const len = this.length;
        if (len < Number.EPSILON) {
            if (process.env.NODE_ENV === "development") {
                console.assert(false, "Normalizing a zero Vector2");
            }
            return this;
        } else {
            return this.multiply(1 / len);
        }
    }

    multiply(scalar: number) {
        this.x = this.x * scalar;
        this.y = this.y * scalar;
        return this;
    }

    dot(other: Vector2) {
        return (this.x * other.x) + (this.y * other.y);
    }

    copy(other: Vector2) {
        this.x = other.x;
        this.y = other.y;
        return this;
    }

    rotate(radians: number) {
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        this.set(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
        return this;
    }

    asArray() {
        if (!this._array) {
            this._array = [this.x, this.y];
            return this._array;
        }

        this._array[0] = this.x;
        this._array[1] = this.y;
        return this._array;
    }

    equals(other: Vector2) {
        return this.x === other.x && this.y === other.y;
    }
}
