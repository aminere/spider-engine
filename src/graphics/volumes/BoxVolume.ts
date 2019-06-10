import { Volume } from "./Volume";
import { Vector3 } from "../../math/Vector3";
import { MathEx } from "../../math/MathEx";
import * as Attributes from "../../core/Attributes";
import { ObjectProps } from "../../core/Types";

@Attributes.displayName("Box")
export class BoxVolume extends Volume {

    center = new Vector3();
    extent = new Vector3(1, 1, 1);

    constructor(props?: ObjectProps<BoxVolume>) {
        super();
        if (props) {
            this.setState(props);
        }
    }

    emitPoint(point: Vector3) {
        point.x = this.center.x + MathEx.lerp(-this.extent.x, this.extent.x, Math.random());
        point.y = this.center.y + MathEx.lerp(-this.extent.y, this.extent.y, Math.random());
        point.z = this.center.z + MathEx.lerp(-this.extent.z, this.extent.z, Math.random());
        return point;
    }

    getCenter(result: Vector3) {
        return result.copy(this.center);
    }    
}
