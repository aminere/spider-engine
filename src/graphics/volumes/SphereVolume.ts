import { Volume } from "./Volume";
import { Vector3 } from "../../math/Vector3";
import { MathEx } from "../../math/MathEx";
import * as Attributes from "../../core/Attributes";
import { ObjectProps } from "../../core/Types";

@Attributes.displayName("Sphere")
export class SphereVolume extends Volume {
    center = new Vector3();
    radius = 1;

    constructor(props?: ObjectProps<SphereVolume>) {
        super();
        if (props) {
            this.setState(props);
        }
    }

    emitPoint(result: Vector3) {
        return MathEx.sphericalToCartesian(
            this.radius * Math.random(), 
            MathEx.PI2 * Math.random(), 
            Math.PI * Math.random(), 
            result
        );
    }

    getCenter(result: Vector3) {
        return result.copy(this.center);
    }
}
