import { Volume } from "./Volume";
import { Vector3 } from "../../math/Vector3";
import { ObjectProps } from "../../core/Types";
export declare class SphereVolume extends Volume {
    center: Vector3;
    radius: number;
    constructor(props?: ObjectProps<SphereVolume>);
    emitPoint(result: Vector3): Vector3;
    getCenter(result: Vector3): Vector3;
}
