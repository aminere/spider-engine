export declare class WebGL {
    static primitiveTypes: {
        [type: string]: number;
    };
    static extensions: {
        OES_texture_float: boolean;
        OES_standard_derivatives: boolean;
    };
    static version: number;
    static caps: {
        maxVertexUniforms: number;
    };
    static readonly context: WebGLRenderingContext;
    static create(context: WebGLRenderingContext, version: number): void;
    static do(func: () => any): any;
}
