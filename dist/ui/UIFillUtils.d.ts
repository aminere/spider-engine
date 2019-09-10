import { Layout } from "./Layout";
import { UIFill } from "./UIFill";
import { Material } from "../graphics/Material";
import { Matrix44 } from "../math/Matrix44";
import { VertexBuffer } from "../graphics/VertexBuffer";
import { Color } from "../graphics/Color";
import { Vector2 } from "../math/Vector2";
import { Vector3 } from "../math/Vector3";
/**
 * @hidden
 */
export interface UIFillRenderOptions {
    fill: UIFill;
    material: Material;
    modelView: Matrix44;
    vertexBuffer: VertexBuffer;
    context: WebGLRenderingContext;
    tint: Color;
    screenOffset: Vector2;
    screenPosition: Vector3;
    screenScale: number;
}
/**
 * @hidden
 */
export declare class UIFillUtils {
    static uiShaderTextureParam: string;
    static uiShaderColorParam: string;
    static getVertexBuffer(layout: Layout, fill?: UIFill): VertexBuffer;
    static renderFill(options: UIFillRenderOptions): void;
    static getFillSize(fill: UIFill, horizontal: boolean): number;
}
