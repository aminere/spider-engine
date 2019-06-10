import { SerializableObject } from "../core/SerializableObject";
import { BasePin } from "./Pin";
import { Reference } from "../serialization/Reference";
import { Vector2 } from "../math/Vector2";
/**
 * @hidden
 */
export declare class InlineVariable extends SerializableObject {
    id: string;
    data: Reference<BasePin>;
    position: Vector2;
    constructor();
}
