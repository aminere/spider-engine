import { Vector2 } from "../math/Vector2";
import { Camera } from "./Camera";
import { Matrix44 } from "../math/Matrix44";
import { RenderTarget } from "./RenderTarget";
import { Environment } from "./Environment";
import { IRenderer } from "./IRenderer";
import { Component } from "../core/Component";
export declare class Renderer implements IRenderer {
    get screenSize(): Vector2;
    get defaultPerspectiveCamera(): Camera | null;
    get canvas(): HTMLCanvasElement;
    get renderTarget(): RenderTarget | null;
    set renderTarget(rt: RenderTarget | null);
    set showWireFrame(show: boolean);
    get showWireFrame(): boolean;
    set showShadowCascades(show: boolean);
    get showShadowCascades(): boolean;
}
/**
 * @hidden
 */
export declare class RendererInternal {
    static processCanvasDimensions(canvas: HTMLCanvasElement): void;
    static create(canvas: HTMLCanvasElement): void;
    static render(environment: Environment | undefined, cameras: Camera[], renderables: {
        [typeName: string]: Component[];
    }, preRender?: (camera: Camera) => void, postRender?: (camera: Camera) => void, uiPostRender?: () => void): void;
    static clearDefaultPerspectiveCamera(): void;
    static get uiProjectionMatrix(): Matrix44;
}
