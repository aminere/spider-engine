import { Layout } from "./Layout";
import { UIFill } from "./UIFill";
import { Material } from "../graphics/Material";
import { Matrix44 } from "../math/Matrix44";
import { VertexBuffer } from "../graphics/VertexBuffer";
import { Color } from "../graphics/Color";
/**
 * @hidden
 */
export declare class UIFillUtils {
    static uiShaderTextureParam: string;
    static uiShaderColorParam: string;
    static getVertexBuffer(layout: Layout, fill?: UIFill): VertexBuffer;
    static renderFill(_fill: UIFill, uiMaterial: Material, modelView: Matrix44, vertexBuffer: VertexBuffer, gl: WebGLRenderingContext, tint: Color): void;
    static getFillSize(fill: UIFill, horizontal: boolean): number;
}
