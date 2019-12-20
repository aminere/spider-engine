import { Vector2 } from "../math/Vector2";
import { Camera } from "./Camera";
import { Matrix44 } from "../math/Matrix44";
import { RenderTarget } from "./RenderTarget";
import { Environment } from "./Environment";
import { IRenderer } from "./IRenderer";
import { Component } from "../core/Component";
export declare class Renderer implements IRenderer {
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
export declare class RendererInternal {
    static processCanvasDimensions(canvas: HTMLCanvasElement): void;
    static create(canvas: HTMLCanvasElement): void;
    static render(environment: Environment | undefined, cameras: Camera[], renderables: {
        [typeName: string]: Component[];
    }, preRender?: (camera: Camera) => void, postRender?: (camera: Camera) => void, uiPostRender?: () => void): void;
    static clearDefaultPerspectiveCamera(): void;
    static readonly uiProjectionMatrix: Matrix44;
}
