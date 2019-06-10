export declare class ShaderCodeInjector {
    static doVertexShader(vertexCode: string, useSkinning?: boolean, useFog?: boolean, useShadowMap?: boolean, useVertexColor?: boolean): string;
    static doFragmentShader(fragmentCode: string, useFog?: boolean, useShadowMap?: boolean, useVertexColor?: boolean): string;
}
