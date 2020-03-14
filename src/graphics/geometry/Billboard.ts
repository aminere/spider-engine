
import { Geometry, GraphicUpdateResult } from "./Geometry";
import { Matrix44 } from "../../math/Matrix44";

import * as Attributes from "../../core/Attributes";
import { VertexBuffer } from "../VertexBuffer";
import { GeometryProvider } from "./GeometryProvider";
import { Transform } from "../../core/Transform";
import { Camera } from "../camera/Camera";
import { Shader } from "../shading/Shader";

export class Billboard extends Geometry {

    @Attributes.unserializable()
    private _orientMatrix = new Matrix44();

    getVertexBuffer(): VertexBuffer {
        return GeometryProvider.centeredQuad;
    }
    
    getWorldTransform(transform: Transform) {
        return this._orientMatrix;
    }
    
    graphicUpdate(camera: Camera, transform: Transform) {
        const { worldForward, worldUp } = camera.entity.transform;
        this._orientMatrix.makeLookAt(worldForward, worldUp).transpose();
        this._orientMatrix.scale(transform.worldScale);
        this._orientMatrix.setPosition(transform.worldPosition);
        return GraphicUpdateResult.Unchanged;
    }
}
