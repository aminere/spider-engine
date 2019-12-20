import { Geometry, GraphicUpdateResult } from "./Geometry";
import { Matrix44 } from "../../math/Matrix44";
import { VertexBuffer } from "../VertexBuffer";
import { Transform } from "../../core/Transform";
import { Camera } from "../Camera";
import { Shader } from "../Shader";
export declare class Billboard extends Geometry {
    private _orientMatrix;
    getVertexBuffer(): VertexBuffer;
    getWorldTransform(transform: Transform): Matrix44;
    graphicUpdate(camera: Camera, shader: Shader, buckedId: string, transform: Transform, deltaTime: number): GraphicUpdateResult;
}
