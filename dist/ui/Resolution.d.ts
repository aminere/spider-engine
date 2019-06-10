import { SerializableObject } from "../core/SerializableObject";
import { Vector2 } from "../math/Vector2";
export declare class Resolution extends SerializableObject {
    size: Vector2;
    adaptiveWidth: boolean;
}
export declare class CustomResolution extends Resolution {
}
