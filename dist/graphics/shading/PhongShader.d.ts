import { Shader, ShaderInstance } from "./Shader";
/**
 * @hidden
 */
export declare namespace PhongShaderInternal {
    const diffuseKey = "diffuse";
    const diffuseMapKey = "diffuseMap";
    const ambientKey = "ambient";
    const emissiveKey = "emissive";
}
export declare class PhongShader extends Shader {
    protected loadInstance(instance: ShaderInstance): boolean;
    protected useDirectionalLights(): boolean;
}
