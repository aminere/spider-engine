import { SerializableObject } from "../../core/SerializableObject";
import { Matrix44 } from "../../math/Matrix44";
import { Transform } from "../../core/Transform";
import { Vector3 } from "../../math/Vector3";

export class ParticleShape extends SerializableObject {
    
    onPropertyChanged?: (name: string) => void;

    tesselate(positions: number[], posIdx: number, size: number) {
        positions[posIdx + 0] = -size; positions[posIdx + 1] = -size; positions[posIdx + 2] = 0;
        positions[posIdx + 3] = size; positions[posIdx + 4] = -size; positions[posIdx + 5] = 0;
        positions[posIdx + 6] = size; positions[posIdx + 7] = size; positions[posIdx + 8] = 0;
        positions[posIdx + 9] = -size; positions[posIdx + 10] = -size; positions[posIdx + 11] = 0;
        positions[posIdx + 12] = size; positions[posIdx + 13] = size; positions[posIdx + 14] = 0;
        positions[posIdx + 15] = -size; positions[posIdx + 16] = size; positions[posIdx + 17] = 0;        
    }

    getUvs(uvs: number[], idx: number) {
        uvs[idx + 0] = 0; uvs[idx + 1] = 0;
        uvs[idx + 2] = 1; uvs[idx + 3] = 0;
        uvs[idx + 4] = 1; uvs[idx + 5] = 1;
        uvs[idx + 6] = 0; uvs[idx + 7] = 0;
        uvs[idx + 8] = 1; uvs[idx + 9] = 1;
        uvs[idx + 10] = 0; uvs[idx + 11] = 1;
    }

    makeLocalTransform(localTransform: Matrix44, cameraTransform: Transform) {
        localTransform.makeLookAt(cameraTransform.worldForward, cameraTransform.worldUp).transpose();
    }

    makeParticleTransform(localTransform: Matrix44, particleVelocity: Vector3) {
        // Do nothing     
    }

    vertexCount() { return 6; }

    destroy() { }
}
