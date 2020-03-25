import { Vector2 } from "../math/Vector2";
import { Camera } from "./camera/Camera";
import { Matrix44 } from "../math/Matrix44";
import { RenderTarget } from "./texture/RenderTarget";
import { Environment } from "./Environment";
import { Fog } from "./Fog";
import { IRenderer } from "./IRenderer";
import { Component } from "../core/Component";
export declare class Renderer implements IRenderer {
    get screenSize(): Vector2;
    get defaultPerspectiveCamera(): Camera | null;
    get canvas(): HTMLCanvasElement;
    get renderTarget(): RenderTarget | null;
    set showWireFrame(show: boolean);
    get showWireFrame(): boolean;
    set showShadowCascades(show: boolean);
    get showShadowCascades(): boolean;
    setRenderTarget(rt: RenderTarget | null, cubeMapFace?: number): void;
}
/**
 * @hidden
 */
export declare class RendererInternal {
    static processCanvasDimensions(canvas: HTMLCanvasElement): void;
    static create(canvas: HTMLCanvasElement): void;
    static render(environment: Environment | undefined, fog: Fog | undefined, cameras: Camera[], renderables: {
        [typeName: string]: Component[];
    }, preRender?: (camera: Camera) => void, postRender?: (camera: Camera) => void, uiPostRender?: () => void): void;
    static clearDefaultPerspectiveCamera(): void;
    static get uiProjectionMatrix(): Matrix44;
}
