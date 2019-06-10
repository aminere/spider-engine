import { SerializableObject } from "../core/SerializableObject";
import { Color } from "./Color";
import { StaticCubemap } from "./StaticCubemap";
import { Vector3 } from "../math/Vector3";
export declare class Environment extends SerializableObject {
}
export declare class ColorEnvironment extends Environment {
    color: Color;
    constructor(color?: Color);
}
export declare class SkySimulation extends Environment {
    luminance: number;
    turbidity: number;
    rayleigh: number;
    mieCoefficient: number;
    mieDirectionalG: number;
    sunPosition: Vector3;
}
export declare class SkyBoxEnvironment extends Environment {
    cubeMap: StaticCubemap | null;
    private _cubeMap;
}
