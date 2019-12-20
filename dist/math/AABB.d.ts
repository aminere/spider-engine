import { Vector3 } from "./Vector3";
import { PrimitiveType } from "../graphics/GraphicTypes";
import { VertexBuffer } from "../graphics/VertexBuffer";
import { Matrix44 } from "./Matrix44";
import { ObjectPool } from "../core/ObjectPool";
export declare class AABB {
    static pool: ObjectPool<AABB>;
    min: Vector3;
    max: Vector3;
    readonly corners: Vector3[];
    private _corners;
    private _cornersDirty;
    static fromVertexBuffer(vb: VertexBuffer): AABB;
    static fromVertexArray(positions: number[], primitiveType: PrimitiveType, indices?: number[]): AABB;
    static fromPool(): AABB;
    constructor(min?: Vector3, max?: Vector3);
    set(min: Vector3, max: Vector3): this;
    contains(p: Vector3): boolean;
    add(other: AABB): this;
    addAABBs(a: AABB, b: AABB): this;
    copy(other: AABB): this;
    transform(matrix: Matrix44): this;
}
