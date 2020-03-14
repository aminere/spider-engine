import { Debug } from "../io/Debug";

namespace Private {
    export let context: WebGLRenderingContext;
    export let depthTest = true;
    export let depthWrite = true;
    export let blending = false;
    export let culling = true;
    export let cullMode = -1;
    export let blendFunc = [-1, -1];
}

export class WebGL {

    static primitiveTypes: { [type: string]: number };

    static extensions = {
        OES_texture_float: false,
        OES_standard_derivatives: false,
        WEBGL_depth_texture: false
    };

    static version = 1;

    static caps = {
        maxVertexUniforms: 0
    };

    static get context() { return Private.context; }
    
    static create(context: WebGLRenderingContext, version: number) {
        WebGL.primitiveTypes = {
            POINTS: context.POINTS,
            LINE_STRIP: context.LINE_STRIP,
            LINE_LOOP: context.LINE_LOOP,
            LINES: context.LINES,
            TRIANGLE_STRIP: context.TRIANGLE_STRIP,
            TRIANGLE_FAN: context.TRIANGLE_FAN,
            TRIANGLES: context.TRIANGLES
        };        

        // These extensions are available by default in Webgl 2        
        WebGL.extensions.OES_texture_float = version > 1;
        WebGL.extensions.OES_standard_derivatives = version > 1;
        WebGL.extensions.WEBGL_depth_texture = version > 1;

        if (WebGL.extensions.OES_standard_derivatives) {
            // tslint:disable-next-line
            context.hint((context as any).FRAGMENT_SHADER_DERIVATIVE_HINT, context.FASTEST);
        }

        for (const extension in this.extensions) {
            this.extensions[extension] = this.extensions[extension] || Boolean(context.getExtension(extension));
            // tslint:disable-next-line
            console.log(`${extension}: ${this.extensions[extension]}`);
        }

        if (version > 1) {
            const ext = context.getExtension("EXT_color_buffer_float");
            // tslint:disable-next-line
            console.log(`EXT_color_buffer_float: ${Boolean(ext)}`);
            console.assert(ext, "EXT_color_buffer_float extension is required for skinning.");
        }

        console.assert(this.extensions.OES_texture_float, "OES_texture_float extension is required for skinning.");
        console.assert(this.extensions.OES_standard_derivatives, "OES_standard_derivatives is required for enhanced wireframe visualization.");
        WebGL.caps.maxVertexUniforms = context.getParameter(context.MAX_VERTEX_UNIFORM_VECTORS);
        WebGL.version = version;
        Private.context = context;

        context.enable(context.DEPTH_TEST);
        context.depthMask(true);
        context.disable(context.BLEND);
        context.enable(context.CULL_FACE);
        context.clearDepth(1);
        context.depthFunc(context.LEQUAL);
        context.frontFace(context.CCW);
    }

    // tslint:disable-next-line
    static do(func: () => any) {
        const r = func();
        const e = Private.context.getError();
        if (e) {
            Debug.logError(`WebGL error 0x${Number(e).toString(16)}`);
        }
        return r;
    }

    static enableDepthTest(enable: boolean) {
        if (enable === Private.depthTest) {
            return;
        }
        if (enable) {
            WebGL.context.enable(WebGL.context.DEPTH_TEST);
        } else {
            WebGL.context.disable(WebGL.context.DEPTH_TEST);
        }
        Private.depthTest = enable;
    }

    static enableDepthWrite(enable: boolean) {
        if (enable === Private.depthWrite) {
            return;
        }
        WebGL.context.depthMask(enable);
        Private.depthWrite = enable;
    }

    static enableBlending(enable: boolean) {
        if (enable === Private.blending) {
            return;
        }
        if (enable) {
            WebGL.context.enable(WebGL.context.BLEND);
        } else {
            WebGL.context.disable(WebGL.context.BLEND);
        }
        Private.blending = enable;
    }

    static enableCulling(enable: boolean) {
        if (enable === Private.culling) {
            return;
        }
        if (enable) {
            WebGL.context.enable(WebGL.context.CULL_FACE);
        } else {
            WebGL.context.disable(WebGL.context.CULL_FACE);
        }
        Private.culling = enable;
    }

    static setCullMode(mode: number) {
        if (mode === Private.cullMode) {
            return;
        }
        WebGL.context.cullFace(mode);
        Private.cullMode = mode;
    }

    static setBlendFunc(src: number, dest: number) {
        if (src === Private.blendFunc[0] && dest === Private.blendFunc[1]) {
            return;
        }
        WebGL.context.blendFunc(src, dest);
        Private.blendFunc[0] = src;
        Private.blendFunc[1] = dest;
    }
}
