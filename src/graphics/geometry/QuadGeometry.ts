
import { Geometry } from "./Geometry";
import { AABB } from "../../math/AABB";
import { Vector3 } from "../../math/Vector3";
import * as Attributes from "../../core/Attributes";
import { GeometryProvider } from "./GeometryProvider";
import { VertexBuffer } from "../VertexBuffer";

@Attributes.displayName("Quad")
export class QuadGeometry extends Geometry {

    @Attributes.unserializable()
    private _boundingBox = new AABB(new Vector3(0, 0, -.1), new Vector3(1, 1, .1));

    getVertexBuffer(): VertexBuffer {
        return GeometryProvider.quad;
    }

    getBoundingBox() {        
        return this._boundingBox;
    }
}
