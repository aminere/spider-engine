
import { Vector2 } from "../math/Vector2";
import { Camera } from "./camera/Camera";
import { RenderTarget } from "./texture/RenderTarget";

export interface IRenderer {    
    readonly screenSize: Vector2;
    readonly defaultPerspectiveCamera: Camera | null;
    readonly canvas: HTMLCanvasElement;
    renderTarget: RenderTarget | null;
    showWireFrame: boolean;
    showShadowCascades: boolean;
}

namespace Private {
    export let instance: IRenderer;
}

/**
 * @hidden
 */
export class IRendererInternal {
    static set instance(instance: IRenderer) {
        Private.instance = instance;
    }
    static get instance() {
        return Private.instance;
    }
}
