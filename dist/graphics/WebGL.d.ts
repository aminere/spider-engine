export declare class WebGL {
    static primitiveTypes: {
        [type: string]: number;
    };
    static extensions: {
        OES_texture_float: boolean;
        OES_standard_derivatives: boolean;
    };
    static caps: {
        maxVertexUniforms: number;
    };
    static readonly context: WebGLRenderingContext;
    static create(context: WebGLRenderingContext): void;
    static do(func: () => any): any;
}
