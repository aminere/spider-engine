import { SerializableObject } from "../../core/SerializableObject";
import { Vector3 } from "../../math/Vector3";
export declare class Volume extends SerializableObject {
    emitPoint(result: Vector3): Vector3;
    getCenter(result: Vector3): Vector3;
}
