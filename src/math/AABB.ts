
import { Vector3 } from "./Vector3";
import { PrimitiveType } from "../graphics/GraphicTypes";

export class AABB {
    
    min: Vector3;
    max: Vector3;

    static fromVertexArray(positions: number[], primitiveType: PrimitiveType, indices?: number[]) {
        let bb = new AABB();
        if (primitiveType === "TRIANGLES") {
            bb.min.copy(Vector3.one).multiply(999999);
            bb.max.copy(Vector3.one).multiply(-999999);
            for (let i = 0; i < positions.length; i += 3) {
                if (bb.min.x > positions[i]) {
                    bb.min.x = positions[i];
                } 
                if (bb.max.x < positions[i]) {
                    bb.max.x = positions[i];
                }
                if (bb.min.y > positions[i + 1]) {
                    bb.min.y = positions[i + 1];
                } 
                if (bb.max.y < positions[i + 1]) {
                    bb.max.y = positions[i + 1];
                }
                if (bb.min.z > positions[i + 2]) {
                    bb.min.z = positions[i + 2];
                } 
                if (bb.max.z < positions[i + 2]) {
                    bb.max.z = positions[i + 2];
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
}
