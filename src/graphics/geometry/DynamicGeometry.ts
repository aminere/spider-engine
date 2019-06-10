import { Geometry } from "./Geometry";
import { VertexBuffer } from "../VertexBuffer";
import * as Attributes from "../../core/Attributes";
import { AABB } from "../../math/AABB";

export class DynamicGeometry extends Geometry {
    set vertexBuffer(vb: VertexBuffer) { this._vb = vb; }
    get vertexBuffer() { return this._vb; }

    @Attributes.unserializable()
    private _vb!: VertexBuffer;

    @Attributes.unserializable()
    private _boundingBox!: AABB;

    // Needs to override Geometry.getVertexBuffer 
    getVertexBuffer() {
        return this._vb;
    }
    
    getBoundingBox() {
        if (!this._boundingBox && this._vb) {
            const { data, primitiveType, indices } = this._vb;
            this._boundingBox = AABB.fromVertexArray(data.position, primitiveType, indices);
        }
        return this._boundingBox;
    }
}
