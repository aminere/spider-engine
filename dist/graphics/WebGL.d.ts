export declare class WebGL {
    static primitiveTypes: {
        [type: string]: number;
    };
    static cubeMapFaces: number[];
    static extensions: {
        OES_texture_float: boolean;
        OES_standard_derivatives: boolean;
        WEBGL_depth_texture: boolean;
    };
    static version: number;
    static caps: {
        maxVertexUniforms: number;
    };
    static get context(): WebGLRenderingContext;
    static create(context: WebGLRenderingContext, version: number): void;
    static do(func: () => any): any;
    static enableDepthTest(enable: boolean): void;
    static enableDepthWrite(enable: boolean): void;
    static enableBlending(enable: boolean): void;
    static enableCulling(enable: boolean): void;
    static setCullMode(mode: number): void;
    static setBlendFunc(src: number, dest: number): void;
}
