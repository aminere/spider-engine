import { SerializableObject } from "../core/SerializableObject";
import { Color } from "./Color";
import { AssetReference } from "../serialization/AssetReference";
import { StaticCubemap } from "./StaticCubemap";
import * as Attributes from "../core/Attributes";
import { Vector3 } from "../math/Vector3";

export class Environment extends SerializableObject {    
}

@Attributes.displayName("Color")
export class ColorEnvironment extends Environment {
    color: Color;
    constructor(color?: Color) {
        super();
        this.color = color || new Color();
        this.color.a = 0;
    }
}

export class SkySimulation extends Environment {
    luminance = 1;
    turbidity = 2;
    rayleigh = 1;
    mieCoefficient = .005;
    mieDirectionalG = .8;
    sunPosition = new Vector3(0, 1, 1).normalize();
}

@Attributes.displayName("Skybox")
export class SkyBoxEnvironment extends Environment {
    get cubeMap() { return this._cubeMap.asset; }
    set cubeMap(cubeMap: StaticCubemap | null) { this._cubeMap.asset = cubeMap; }

    private _cubeMap = new AssetReference(StaticCubemap);
}
