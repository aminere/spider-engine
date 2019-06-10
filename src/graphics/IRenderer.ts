
import { Vector2 } from "../math/Vector2";
import { Camera } from "./Camera";
import { RenderTarget } from "./RenderTarget";

export interface IRenderer {    
    readonly screenSize: Vector2;
    readonly defaultPerspectiveCamera: Camera | null;
    renderTarget: RenderTarget | null;
    showWireFrame: boolean;
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
