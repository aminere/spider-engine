
import * as Attributes from "../../core/Attributes";
import { Camera } from "../../graphics/camera/Camera";
import { Interfaces } from "../../core/Interfaces";
import { Converter } from "../Converter";
import { Vector2Pin, ComponentReferencePin, RayPin } from "../DataPins";
import { PinType } from "../Pin";

@Attributes.displayName("Screen to Ray")
export class ScreenToRay extends Converter {

    @Attributes.unserializable()
    private _screenPos!: Vector2Pin;
    @Attributes.unserializable()
    private _camera!: ComponentReferencePin<Camera>;
    @Attributes.unserializable()
    private _ray!: RayPin;

    constructor() {
        super();
        this.createComponentReferencePin("_camera", PinType.Input, Camera);
        this.createPin("_screenPos", PinType.Input, Vector2Pin);
        this.createPin("_ray", PinType.Output, RayPin);
    }

    convert() {
        let camera = this._camera.value.component;
        if (!camera) {
            // use the default perspective camera
            camera = Interfaces.renderer.defaultPerspectiveCamera;
        }
        if (camera) {
            let screenPos = this._screenPos.value;
            let ray = camera.getWorldRay(screenPos.x, screenPos.y);
            if (ray) {
                this._ray.setData(ray);
            }
        }
    }
}
