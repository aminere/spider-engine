import { Vector3 } from "./Vector3";
import { PrimitiveType } from "../graphics/GraphicTypes";
export declare class AABB {
    min: Vector3;
    max: Vector3;
    static fromVertexArray(positions: number[], primitiveType: PrimitiveType, indices?: number[]): AABB;
    constructor(min?: Vector3, max?: Vector3);
    set(min: Vector3, max: Vector3): this;
    contains(p: Vector3): boolean;
}
