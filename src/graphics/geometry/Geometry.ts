
import { AABB } from "../../math/AABB";
import { SerializableObject } from "../../core/SerializableObject";
import { Matrix44 } from "../../math/Matrix44";
import { Transform } from "../../core/Transform";
import { VertexBuffer } from "../VertexBuffer";
import { Camera } from "../Camera";
import { Shader } from "../Shader";

export enum GraphicUpdateResult {
    Changed,
    Unchanged
}

export class Geometry extends SerializableObject {
    getVertexBuffer(): VertexBuffer | null {
        return null;
    }

    getBoundingBox(): AABB | null {
        return null;
    }
    
    getWorldTransform(transform: Transform): Matrix44 {
        return transform.worldMatrix;
    }

    graphicUpdate(camera: Camera, shader: Shader, bucketId: string, transform: Transform, deltaTime: number) {
        return GraphicUpdateResult.Unchanged;
    }
}
