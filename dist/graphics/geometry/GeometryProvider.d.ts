import { VertexBuffer } from "../VertexBuffer";
export declare class GeometryProvider {
    static get quad(): VertexBuffer;
    static get centeredQuad(): VertexBuffer;
    static get uiQuad(): VertexBuffer;
    static get skyBox(): VertexBuffer;
    static unload(gl: WebGLRenderingContext): void;
}
