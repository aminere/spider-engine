import { Ray } from "../math/Ray";
import { CollisionGroup } from "../collision/CollisionGroup";
import { RaycastResult } from "../collision/RaycastResult";
export declare class Physics {
    static rayCast(ray: Ray, include?: CollisionGroup[], exclude?: CollisionGroup[]): RaycastResult | null;
}
