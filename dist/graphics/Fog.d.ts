import { SerializableObject } from "../core/SerializableObject";
import { Color } from "./Color";
export declare class Fog extends SerializableObject {
    color: Color;
}
export declare class ExponentialFog extends Fog {
    density: number;
}
export declare class LinearFog extends Fog {
    near: number;
    far: number;
}
