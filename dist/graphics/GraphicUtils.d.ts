import { VertexBuffer } from "./VertexBuffer";
import { Shader } from "./shading/Shader";
export declare class GraphicUtils {
    static drawVertexBuffer(vb: VertexBuffer, shader: Shader): void;
    static invalidateShaders(): void;
}
