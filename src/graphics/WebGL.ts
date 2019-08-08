import { Debug } from "../io/Debug";

namespace Private {
    export let context: WebGLRenderingContext;
}

export class WebGL {

    static primitiveTypes: { [type: string]: number };

    static extensions = {
        OES_texture_float: false,
        OES_standard_derivatives: false
    };

    static caps = {
        maxVertexUniforms: 0,
        webglVersion: 1
    };

    static get context() { return Private.context; }
    
    static create(context: WebGLRenderingContext) {        
        context.enable(context.DEPTH_TEST);
        context.clearDepth(1);
        context.depthFunc(context.LEQUAL);
        context.frontFace(context.CCW);

        WebGL.primitiveTypes = {
            POINTS: context.POINTS,
            LINE_STRIP: context.LINE_STRIP,
            LINE_LOOP: context.LINE_LOOP,
            LINES: context.LINES,
            TRIANGLE_STRIP: context.TRIANGLE_STRIP,
            TRIANGLE_FAN: context.TRIANGLE_FAN,
            TRIANGLES: context.TRIANGLES
        };        

        for (const extension of Object.keys(this.extensions)) {
            this.extensions[extension] = context.getExtension(extension) !== null;
        }

        console.assert(this.extensions.OES_texture_float, "OES_texture_float extension is required for skinning.");
        console.assert(this.extensions.OES_standard_derivatives, "OES_standard_derivatives not supported, required for enhanced wireframe visualization.");
        WebGL.caps.maxVertexUniforms = context.getParameter(context.MAX_VERTEX_UNIFORM_VECTORS);
        Private.context = context;
    }

    // tslint:disable-next-line
    static do(func: () => any) {
        let r = func();
        let e = Private.context.getError();
        if (e) {
            Debug.log(`WebGL error '${e}'`);
        }
        return r;
    }
}
