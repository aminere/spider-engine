import { SerializableObject } from "../../core/SerializableObject";
import { Vector2 } from "../../math/Vector2";
import { Color } from "../../graphics/Color";
import { AsyncEvent } from "ts-events";
import * as Attributes from "../../core/Attributes";

export class FontShadow extends SerializableObject {

    @Attributes.unserializable()
    propertyChanged = new AsyncEvent<string>();

    applyToContext(context: CanvasRenderingContext2D) {        
    }
}

@Attributes.displayName("Default")
export class DefaultFontShadow extends FontShadow {

    set offset(offset: Vector2) {
        this._offset.copy(offset);
        this.propertyChanged.post("offset");
    }

    set blur(blur: number) {
        this._blur = blur;
        this.propertyChanged.post("blur");
    }

    set color(color: Color) {
        this._color.copy(color);
        this.propertyChanged.post("color");
    }

    private _offset = new Vector2(1, 1);
    private _blur = 1;
    private _color = new Color();

    applyToContext(context: CanvasRenderingContext2D) {        
        context.shadowOffsetX = this._offset.x;
        context.shadowOffsetY = this._offset.y;
        const { r, g, b, a } = this._color.toChromeColor();
        context.shadowColor = `rgba(${r}, ${g}, ${b}, ${a})`;
        context.shadowBlur = this._blur;
    }
}
