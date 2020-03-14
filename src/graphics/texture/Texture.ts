
import * as Attributes from "../../core/Attributes";

import { GraphicAsset } from "../GraphicAsset";
import { WebGL } from "../WebGL";

export class Texture extends GraphicAsset {

    get textureId() { return this._textureId; }        

    @Attributes.unserializable()
    protected _textureId: WebGLTexture | null = null;
    
    getWidth() { return 0; }
    getHeight() { return 0; }
   
    begin(stage: number): boolean {
        return false;
    }

    graphicUnload() {
        if (this._textureId) {
            let gl = WebGL.context;
            gl.deleteTexture(this._textureId);
            this._textureId = null;
        }
    }    
}
