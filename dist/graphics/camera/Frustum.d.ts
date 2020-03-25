import { Vector3 } from "../../math/Vector3";
import { Transform } from "../../core/Transform";
import { AABB } from "../../math/AABB";
export declare enum FrustumCorner {
    FarTopLeft = 0,
    FarTopRight = 1,
    FarBottomLeft = 2,
    FarBottomRight = 3,
    NearTopLeft = 4,
    NearTopRight = 5,
    NearBottomLeft = 6,
    NearBottomRight = 7,
    Count = 8
}
export declare enum FrustumTest {
    In = 0,
    Out = 1,
    Intersect = 2
}
export declare class Frustum {
    get corners(): Vector3[];
    private _planes;
    private _corners;
    constructor();
    isPointInside(worldPos: Vector3): boolean;
    update(nearW: number, nearH: number, farW: number, farH: number, near: number, far: number, transform: Transform): this;
    testAABB(aabb: AABB): FrustumTest;
}
