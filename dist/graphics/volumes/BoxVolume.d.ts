import { Volume } from "./Volume";
import { Vector3 } from "../../math/Vector3";
import { ObjectProps } from "../../core/Types";
export declare class BoxVolume extends Volume {
    center: Vector3;
    extent: Vector3;
    constructor(props?: ObjectProps<BoxVolume>);
    emitPoint(point: Vector3): Vector3;
    getCenter(result: Vector3): Vector3;
}
