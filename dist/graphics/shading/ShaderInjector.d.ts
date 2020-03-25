import { IShadingContext } from "./IShadingContext";
export declare class ShaderInjector {
    static doVertexShader(vertexCode: string, context: IShadingContext): string;
    static doFragmentShader(fragmentCode: string, context: IShadingContext): string;
}
