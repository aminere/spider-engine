import * as Attributes from "../../core/Attributes";
import { Converter } from "../Converter";
import { NumberPin, Vector2Pin } from "../DataPins";
import { PinType } from "../Pin";

@Attributes.displayName("Vector2")
export class Vector2Converter extends Converter {

    @Attributes.unserializable()
    private _x!: NumberPin;
    @Attributes.unserializable()
    private _y!: NumberPin;
    @Attributes.unserializable()
    private _output!: Vector2Pin;

    constructor() {
        super();
        this.createPin("_x", PinType.Input, NumberPin);
        this.createPin("_y", PinType.Input, NumberPin);
        this.createPin("_output", PinType.Output, Vector2Pin);
    }
    
    convert() {
        this._output.getData().set(this._x.getData(), this._y.getData());
    }
}
