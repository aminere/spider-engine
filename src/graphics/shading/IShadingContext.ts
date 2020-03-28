import { Fog } from "../Fog";

export interface IShadingContext {
    skinning: boolean;
    shadowMap: boolean;
    vertexColor: boolean;
    directionalLights: boolean;
    envMap: boolean;
    normalMap: boolean;
    fog?: Fog;
}
