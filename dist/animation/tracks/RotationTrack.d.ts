import { CompositeTrack } from "./CompositeTrack";
import { Quaternion, RotationOrder } from "../../math/Quaternion";
export declare class RotationTrack extends CompositeTrack {
    eulerOrder: RotationOrder;
    constructor();
    getSample(time: number, target?: Quaternion): Quaternion;
}
