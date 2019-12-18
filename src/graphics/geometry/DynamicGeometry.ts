import { Geometry } from "./Geometry";
import { VertexBuffer } from "../VertexBuffer";
import * as Attributes from "../../core/Attributes";
import { AABB } from "../../math/AABB";
import { ObjectProps } from "../../core/Types";

export class DynamicGeometry extends Geometry {
    set vertexBuffer(vb: VertexBuffer) { this._vb = vb; }
    get vertexBuffer() { return this._vb; }

    @Attributes.unserializable()
    private _vb!: VertexBuffer;

    @Attributes.unserializable()
    private _boundingBox!: AABB;

    constructor(props?: ObjectProps<DynamicGeometry>) {
        super();
        if (props) {
            this.setState(props);
        }
    }

    // Needs to override Geometry.getVertexBuffer 
    getVertexBuffer() {
        return this._vb;
    }
    
    getBoundingBox() {
        if (!this._boundingBox && this._vb) {
            this._boundingBox = AABB.fromVertexBuffer(this._vb);
        }
        return this._boundingBox;
    }
}
