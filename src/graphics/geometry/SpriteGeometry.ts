
import { Geometry } from "./Geometry";
import { AssetReference } from "../../serialization/AssetReference";
import { Sprite } from "../../ui/Sprite";
import * as Attributes from "../../core/Attributes";
import { VertexBuffer } from "../VertexBuffer";
import { WebGL } from "../WebGL";

@Attributes.displayName("Sprite")
export class SpriteGeometry extends Geometry {

    sprite = new AssetReference(Sprite);

    @Attributes.unserializable()
    private _vertexBuffer!: VertexBuffer;

    getVertexBuffer() {
        if (!this._vertexBuffer) {
            this._vertexBuffer = new VertexBuffer();
            this._vertexBuffer.isDynamic = true;
            this._vertexBuffer.primitiveType = "TRIANGLES";
            this._vertexBuffer.setData("position", []);
            this._vertexBuffer.setData("uv", []);
        }
        if (this.sprite.asset) {
            this.sprite.asset.tesselateInWorldUnits(this._vertexBuffer); 
        }
        return this._vertexBuffer;
    }

    destroy() {
        if (this._vertexBuffer) {
            this._vertexBuffer.unload(WebGL.context);
        }
        super.destroy();
    }
}
