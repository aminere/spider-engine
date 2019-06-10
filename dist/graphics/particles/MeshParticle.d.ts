import { ParticleShape } from "./ParticleShape";
import { AssetReference } from "../../serialization/AssetReference";
import { StaticMeshAsset } from "../../assets/StaticMeshAsset";
import { Vector3 } from "../../math/Vector3";
import { Matrix44 } from "../../math/Matrix44";
import { Transform } from "../../core/Transform";
export declare class MeshParticle extends ParticleShape {
    mesh: AssetReference<StaticMeshAsset>;
    scale: Vector3;
    constructor();
    tesselate(positions: number[], posIdx: number, size: number): void;
    getUvs(uvs: number[], uvIdx: number): void;
    makeLocalTransform(localTransform: Matrix44, cameraTransform: Transform): void;
    makeParticleTransform(localTransform: Matrix44, particleVelocity: Vector3): void;
    vertexCount(): number;
    setProperty(name: string, value?: any): void;
    destroy(): void;
    private onMeshChanged;
}
