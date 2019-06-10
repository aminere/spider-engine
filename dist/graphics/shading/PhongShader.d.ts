import { Shader, ShaderInstance } from "../Shader";
/**
 * @hidden
 */
export declare namespace PhongShaderInternal {
    const diffuseKey = "diffuse";
    const diffuseMapKey = "diffuseMap";
}
export declare class PhongShader extends Shader {
    protected loadInstance(gl: WebGLRenderingContext, instance: ShaderInstance, vertexShader: WebGLShader, fragmentShader: WebGLShader, vertexCode: string, fragmentCode: string): boolean;
}
