import { SerializableObject } from "../core/SerializableObject";
import { Color } from "./Color";

export class Fog extends SerializableObject {
    color = new Color(.7, .7, .7, 1);
}

export class ExponentialFog extends Fog {
    density = .005;
}

export class LinearFog extends Fog {
    near = 700;
    far = 1000;
}