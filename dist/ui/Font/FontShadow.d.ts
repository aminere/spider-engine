import { SerializableObject } from "../../core/SerializableObject";
import { Vector2 } from "../../math/Vector2";
import { Color } from "../../graphics/Color";
import { AsyncEvent } from "ts-events";
export declare class FontShadow extends SerializableObject {
    propertyChanged: AsyncEvent<string>;
    applyToContext(context: CanvasRenderingContext2D): void;
}
export declare class DefaultFontShadow extends FontShadow {
    set offset(offset: Vector2);
    set blur(blur: number);
    set color(color: Color);
    private _offset;
    private _blur;
    private _color;
    applyToContext(context: CanvasRenderingContext2D): void;
}
