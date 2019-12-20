import { CompositeTrack } from "./CompositeTrack";
import { Quaternion } from "../../math/Quaternion";
import { RotationOrder } from "../../math/Types";
export declare class RotationTrack extends CompositeTrack {
    eulerOrder: RotationOrder;
    constructor();
    getSample(time: number, target?: Quaternion): Quaternion;
}
