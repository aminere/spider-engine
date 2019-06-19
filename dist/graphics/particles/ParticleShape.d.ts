import { SerializableObject } from "../../core/SerializableObject";
import { Matrix44 } from "../../math/Matrix44";
import { Transform } from "../../core/Transform";
import { Vector3 } from "../../math/Vector3";
export declare class ParticleShape extends SerializableObject {
    onPropertyChanged?: (name: string) => void;
    getPositions(positions: number[], posIdx: number, size: number): void;
    getUvs(uvs: number[], idx: number): void;
    makeLocalTransform(localTransform: Matrix44, cameraTransform: Transform): void;
    makeParticleTransform(localTransform: Matrix44, particleVelocity: Vector3): void;
    vertexCount(): number;
    destroy(): void;
}
