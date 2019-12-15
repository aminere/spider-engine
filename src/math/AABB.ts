
import { Vector3 } from "./Vector3";
import { PrimitiveType } from "../graphics/GraphicTypes";
import { VertexBuffer } from "../graphics/VertexBuffer";

export class AABB {
    
    min: Vector3;
    max: Vector3;

    get corners() {
        if (!this._corners) {
            this._corners = [];
            this._corners.push(new Vector3(this.min.x, this.min.y, this.min.z));
            this._corners.push(new Vector3(this.max.x, this.min.y, this.min.z));
            this._corners.push(new Vector3(this.min.x, this.min.y, this.max.z));
            this._corners.push(new Vector3(this.max.x, this.min.y, this.max.z));
            this._corners.push(new Vector3(this.min.x, this.max.y, this.min.z));
            this._corners.push(new Vector3(this.max.x, this.max.y, this.min.z));
            this._corners.push(new Vector3(this.min.x, this.max.y, this.max.z));
            this._corners.push(new Vector3(this.max.x, this.max.y, this.max.z));
        }
        return this._corners;
    }

    private _corners!: Vector3[];

    static fromVertexBuffer(vb: VertexBuffer) {
        const { attributes, primitiveType, indices } = vb;
        return AABB.fromVertexArray(attributes.position as number[], primitiveType, indices);
    }

    static fromVertexArray(positions: number[], primitiveType: PrimitiveType, indices?: number[]) {
        const bb = new AABB();
        if (primitiveType === "TRIANGLES") {
            bb.min.copy(Vector3.one).multiply(999999);
            bb.max.copy(Vector3.one).multiply(-999999);
            for (let i = 0; i < positions.length; i += 3) {
                const x = positions[i];
                const y = positions[i + 1];
                const z = positions[i + 2];
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
            }
        }
        return bb;
    }

    constructor(min?: Vector3, max?: Vector3) {
        this.min = min || new Vector3();
        this.max = max || new Vector3();
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
}
