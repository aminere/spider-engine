import { Ray } from "../math/Ray";
import { RaycastResult } from "../collision/RaycastResult";
import { CollisionFilter } from "../collision/CollisionFilter";
export declare class Physics {
    static rayCast(ray: Ray, filter?: CollisionFilter): RaycastResult | null;
}
