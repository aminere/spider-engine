
import * as Attributes from "../../core/Attributes";
import { Plane } from "../../math/Plane";
import { Vector3 } from "../../math/Vector3";
import { Converter } from "../Converter";
import { RayPin, Vector3Pin, NumberPin, BooleanPin } from "../DataPins";
import { PinType } from "../Pin";

@Attributes.displayName("RayCast on Plane")
export class RayCastOnPlane extends Converter {
    
    @Attributes.unserializable()
    private _ray!: RayPin;
    @Attributes.unserializable()
    private _planeNormal!: Vector3Pin;
    @Attributes.unserializable()
    private _planeDist!: NumberPin;
    @Attributes.unserializable()
    private _intersects!: BooleanPin;
    @Attributes.unserializable()
    private _intersection!: Vector3Pin;

    @Attributes.unserializable()
    private _plane = new Plane();    

    constructor() {
        super();
        this.createPin("_ray", PinType.Input, RayPin);
        this.createPin("_planeNormal", PinType.Input, Vector3Pin);
        this.createPin("_planeDist", PinType.Input, NumberPin);
        this.createPin("_intersects", PinType.Output, BooleanPin);
        this.createPin("_intersection", PinType.Output, Vector3Pin);
    }

    convert() {
        this._plane.set(this._planeNormal.getData(), this._planeDist.getData());
        let result = this._ray.getData().castOnPlane(this._plane);
        let intersects = result.intersection !== null;
        this._intersects.setData(intersects);
        if (intersects) {
            this._intersection.setData(result.intersection as Vector3);
        }
    }
}
