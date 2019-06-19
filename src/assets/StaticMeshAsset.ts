
import { GraphicAsset } from "../graphics/GraphicAsset";
import { VertexBuffer } from "../graphics/VertexBuffer";
import { AABB } from "../math/AABB";
import * as Attributes from "../core/Attributes";
import { WebGL } from "../graphics/WebGL";

@Attributes.displayName("Static Mesh")
@Attributes.editable(false)
@Attributes.referencable(true)
export class StaticMeshAsset extends GraphicAsset {

    get vertexBuffer() { return this._vertexBuffer; }

    set vertexBuffer(vb: VertexBuffer) { 
        if (this._vertexBuffer) {
            this.graphicUnload();
        }
        this._vertexBuffer = vb;
        delete this._boundingBox;
    }

    get boundingBox() { 
        if (!this._boundingBox && this._vertexBuffer) {
            const { attributes, primitiveType, indices } = this._vertexBuffer;
            this._boundingBox = AABB.fromVertexArray(attributes.position as number[], primitiveType, indices);
        }
        return this._boundingBox; 
    }

    private _vertexBuffer!: VertexBuffer;

    @Attributes.unserializable()
    private _boundingBox!: AABB;

    graphicUnload() {
        this._vertexBuffer.unload(WebGL.context);
    }
}
