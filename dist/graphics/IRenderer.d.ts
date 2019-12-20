import { Vector2 } from "../math/Vector2";
import { Camera } from "./Camera";
import { RenderTarget } from "./RenderTarget";
export interface IRenderer {
    readonly screenSize: Vector2;
    readonly defaultPerspectiveCamera: Camera | null;
    readonly canvas: HTMLCanvasElement;
    renderTarget: RenderTarget | null;
    showWireFrame: boolean;
    showShadowCascades: boolean;
}
/**
 * @hidden
 */
export declare class IRendererInternal {
    static instance: IRenderer;
}
