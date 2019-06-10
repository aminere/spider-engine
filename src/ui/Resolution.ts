
import { SerializableObject } from "../core/SerializableObject";
import { Vector2 } from "../math/Vector2";
import { displayName } from "../core/Attributes";

export class Resolution extends SerializableObject {
    size = new Vector2(800, 600);
    adaptiveWidth = false;
}

@displayName("Custom")
export class CustomResolution extends Resolution {    
}
