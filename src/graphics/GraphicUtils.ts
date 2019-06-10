import { VertexBuffer } from "./VertexBuffer";
import { Shader } from "./Shader";

export class GraphicUtils {
    static drawVertexBuffer(gl: WebGLRenderingContext, vb: VertexBuffer, shader: Shader) {
        vb.begin(gl, shader);        
        vb.draw(gl);
        vb.end(gl, shader);
    }
}
