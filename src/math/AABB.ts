
import { Vector3, Vector3Internal } from "./Vector3";
import { PrimitiveType } from "../graphics/GraphicTypes";
import { VertexBuffer } from "../graphics/VertexBuffer";
import { Matrix44 } from "./Matrix44";
import { ObjectPool } from "../core/ObjectPool";

export class AABB {
    
    static pool = new ObjectPool(AABB, 32);

    min: Vector3;
    max: Vector3;

    get corners() {
        if (this._cornersDirty) {
            this._corners[0].set(this.min.x, this.min.y, this.min.z);
            this._corners[1].set(this.max.x, this.min.y, this.min.z);
            this._corners[2].set(this.min.x, this.min.y, this.max.z);
            this._corners[3].set(this.max.x, this.min.y, this.max.z);
            this._corners[4].set(this.min.x, this.max.y, this.min.z);
            this._corners[5].set(this.max.x, this.max.y, this.min.z);
            this._corners[6].set(this.min.x, this.max.y, this.max.z);
            this._corners[7].set(this.max.x, this.max.y, this.max.z);
            this._cornersDirty = false;
        }
        return this._corners;
    }

    private _corners = Array.from(new Array(8)).map(() => new Vector3());
    private _cornersDirty = true;

    static fromVertexBuffer(vb: VertexBuffer) {
        const { attributes, indices } = vb;
        return AABB.fromVertexArray(attributes.position as number[], indices);
    }

    static fromVertexArray(positions: number[], indices?: number[]) {
        const bb = new AABB();

        const updateBBox = (x: number, y: number, z: number) => {
            if (bb.min.x > x) {
                bb.min.x = x;
            } 
            if (bb.max.x < x) {
                bb.max.x = x;
            }
            if (bb.min.y > y) {
                bb.min.y = y;
            } 
            if (bb.max.y < y) {
                bb.max.y = y;
            }
            if (bb.min.z > z) {
                bb.min.z = z;
            } 
            if (bb.max.z < z) {
                bb.max.z = z;
            }
        };

        if (indices) {
            bb.min.copy(Vector3.one).multiply(999999);
            bb.max.copy(Vector3.one).multiply(-999999);
            for (let i = 0; i < indices.length; ++i) {
                const idx = indices[i] * 3;
                const x = positions[idx];
                const y = positions[idx + 1];
                const z = positions[idx + 2];
                updateBBox(x, y, z);
            }
        } else {
            bb.min.copy(Vector3.one).multiply(999999);
            bb.max.copy(Vector3.one).multiply(-999999);
            for (let i = 0; i < positions.length; i += 3) {
                const x = positions[i];
                const y = positions[i + 1];
                const z = positions[i + 2];
                updateBBox(x, y, z);
            }
        }

        return bb;
    }

    static fromPool() {
        return AABB.pool.get();
    }

    constructor(min?: Vector3, max?: Vector3) {
        this.min = min || new Vector3();
        this.max = max || new Vector3();

        const attachToBound = (bound: Vector3) => {
            Object.defineProperty(bound, "x", {
                set: value => { bound[Vector3Internal.xKey] = value; this._cornersDirty = true; },
                get: () => bound[Vector3Internal.xKey]
            });
            Object.defineProperty(bound, "y", {
                set: value => { bound[Vector3Internal.yKey] = value; this._cornersDirty = true; },
                get: () => bound[Vector3Internal.yKey]
            });
            Object.defineProperty(bound, "z", {
                set: value => { bound[Vector3Internal.zKey] = value; this._cornersDirty = true; },
                get: () => bound[Vector3Internal.zKey]
            });
        };

        attachToBound(this.min);
        attachToBound(this.max);
    }

    set(min: Vector3, max: Vector3) {
        this.min.copy(min);
        this.max.copy(max);
        return this;
    }

    contains(p: Vector3) {
        return p.x >= this.min.x && p.x <= this.max.x
        && p.y >= this.min.y && p.y <= this.max.y
        && p.z >= this.min.z && p.z <= this.max.z;
    }

    collidesWith(other: AABB) {
        if (this.min.x > other.max.x) {
            return false;
        }
        if (this.min.y > other.max.y) {
            return false;
        }
        if (this.min.z > other.max.z) {
            return false;
        }
        if (other.min.x > this.max.x) {
            return false;
        }
        if (other.min.y > this.max.y) {
            return false;
        }
        if (other.min.z > this.max.z) {
            return false;
        }
        return true;
    }

    add(other: AABB) {
        return this.addAABBs(this, other);
    }

    addAABBs(a: AABB, b: AABB) {
        this.min.set(
            Math.min(a.min.x, b.min.x),
            Math.min(a.min.y, b.min.y),
            Math.min(a.min.z, b.min.z)
        );
        this.max.set(
            Math.max(a.max.x, b.max.x),
            Math.max(a.max.y, b.max.y),
            Math.max(a.max.z, b.max.z)
        );
        return this;
    }

    copy(other: AABB) {
        this.min.copy(other.min);
        this.max.copy(other.max);
        return this;
    }

    transform(matrix: Matrix44) {
        const min = Vector3.fromPool().set(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
        const max = Vector3.fromPool().set(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
        const transformed = Vector3.fromPool();
        for (const corner of this.corners) {
            transformed.copy(corner).transform(matrix);
            min.set(
                Math.min(min.x, transformed.x), 
                Math.min(min.y, transformed.y), 
                Math.min(min.z, transformed.z)
            );
            max.set(
                Math.max(max.x, transformed.x), 
                Math.max(max.y, transformed.y), 
                Math.max(max.z, transformed.z)
            );
        }
        this.min.copy(min);
        this.max.copy(max);
        return this;
    }
}
