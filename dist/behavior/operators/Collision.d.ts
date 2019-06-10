import { CollisionInfo } from "../../collision/CollisionInfo";
import { BehaviorNode } from "../BehaviorNode";
export declare class Collision extends BehaviorNode {
    private _collision;
    private _collisionInfo;
    constructor();
    onCollision(info: CollisionInfo): void;
}
