import { Asset } from "../assets/Asset";
export declare class CollisionGroup extends Asset {
    /**
     * @hidden
     */
    isAllowed(include?: CollisionGroup[], exclude?: CollisionGroup[]): boolean;
}
