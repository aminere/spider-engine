
import { Geometry, GraphicUpdateResult } from "./Geometry";
import { Matrix44 } from "../../math/Matrix44";
import { Vector3 } from "../../math/Vector3";

import * as Attributes from "../../core/Attributes";
import { VertexBuffer } from "../VertexBuffer";
import { GeometryProvider } from "./GeometryProvider";
import { Transform } from "../../core/Transform";
import { Camera } from "../Camera";
import { Shader } from "../Shader";

export class Billboard extends Geometry {

    stretched = false;

    @Attributes.unserializable()
    private _orientMatrix = new Matrix44;
    @Attributes.unserializable()
    private _toTarget = new Vector3();

    getVertexBuffer(): VertexBuffer {
        return GeometryProvider.centeredQuad;
    }
    
    getWorldTransform(transform: Transform) {
        return this._orientMatrix;
    }
    
    graphicUpdate(camera: Camera, shader: Shader, buckedId: string, transform: Transform, deltaTime: number) {
        if (this.stretched) {
            this._toTarget.copy(transform.worldPosition).substract(camera.entity.transform.worldPosition);
            this._orientMatrix.makeLookAt(this._toTarget, camera.entity.transform.worldUp).transpose();
        } else {
            this._orientMatrix.makeLookAt(camera.entity.transform.worldForward, camera.entity.transform.worldUp).transpose();
        }
        this._orientMatrix.scale(transform.worldScale);
        this._orientMatrix.setPosition(transform.worldPosition);
        return GraphicUpdateResult.Unchanged;
    }
}
