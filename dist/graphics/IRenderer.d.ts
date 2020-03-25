import { Vector2 } from "../math/Vector2";
import { Camera } from "./camera/Camera";
import { RenderTarget } from "./texture/RenderTarget";
export interface IRenderer {
    readonly screenSize: Vector2;
    readonly defaultPerspectiveCamera: Camera | null;
    readonly canvas: HTMLCanvasElement;
    readonly renderTarget: RenderTarget | null;
    showWireFrame: boolean;
    showShadowCascades: boolean;
    setRenderTarget: (target: RenderTarget | null, cubeMapFace?: number) => void;
}
/**
 * @hidden
 */
export declare class IRendererInternal {
    static set instance(instance: IRenderer);
    static get instance(): IRenderer;
}
