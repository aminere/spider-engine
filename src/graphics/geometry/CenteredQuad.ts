
import { Geometry } from "./Geometry";
import { AABB } from "../../math/AABB";
import { Vector3 } from "../../math/Vector3";
import * as Attributes from "../../core/Attributes";
import { VertexBuffer } from "../VertexBuffer";
import { GeometryProvider } from "./GeometryProvider";

export class CenteredQuad extends Geometry {

    @Attributes.unserializable()
    private _boundingBox = new AABB(new Vector3(-1, -1, -.1), new Vector3(1, 1, .1));

    getVertexBuffer(): VertexBuffer {
        return GeometryProvider.centeredQuad;
    }

    getBoundingBox() {        
        return this._boundingBox;
    }
}
