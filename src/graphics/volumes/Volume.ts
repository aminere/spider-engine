import { SerializableObject } from "../../core/SerializableObject";
import { Vector3 } from "../../math/Vector3";

export class Volume extends SerializableObject {
    emitPoint(result: Vector3) {
        return result;
    }

    getCenter(result: Vector3) {
        return result;
    }
}
