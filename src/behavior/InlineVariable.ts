import { SerializableObject } from "../core/SerializableObject";
import { BasePin } from "./Pin";
import { Reference } from "../serialization/Reference";
import { Vector2 } from "../math/Vector2";
import { EngineUtils } from "../core/EngineUtils";

/**
 * @hidden
 */
export class InlineVariable extends SerializableObject {
    id: string;
    data = new Reference(BasePin);
    position = new Vector2();

    constructor() {
        super();
        this.id = EngineUtils.makeUniqueId();
    }
}
