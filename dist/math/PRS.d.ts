import { Vector3 } from "./Vector3";
import { Quaternion } from "./Quaternion";
export interface PRS {
    position?: Vector3;
    rotation?: Quaternion;
    scale?: Vector3;
}
