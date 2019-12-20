import { Shader, ShaderInstance } from "../Shader";
import { Visual } from "../Visual";
/**
 * @hidden
 */
export declare namespace PhongShaderInternal {
    const diffuseKey = "diffuse";
    const diffuseMapKey = "diffuseMap";
}
export declare class PhongShader extends Shader {
    protected loadInstance(gl: WebGLRenderingContext, instance: ShaderInstance, vertexShader: WebGLShader, fragmentShader: WebGLShader, vertexCode: string, fragmentCode: string): boolean;
    protected setupInstance(instance: ShaderInstance, gl: WebGLRenderingContext, visual: Visual): boolean;
}
