import { VertexBuffer } from "../VertexBuffer";
export declare class GeometryProvider {
    static readonly quad: VertexBuffer;
    static readonly centeredQuad: VertexBuffer;
    static readonly uiQuad: VertexBuffer;
    static readonly skyBox: VertexBuffer;
    static unload(gl: WebGLRenderingContext): void;
}
