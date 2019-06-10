
import * as Attributes from "../../core/Attributes";
import { ParticleShape } from "./ParticleShape";
import { AssetReference, AssetChangedEvent } from "../../serialization/AssetReference";
import { StaticMeshAsset } from "../../assets/StaticMeshAsset";
import { Vector3 } from "../../math/Vector3";
import { Matrix44 } from "../../math/Matrix44";
import { Transform } from "../../core/Transform";

namespace Private {
    export const meshPropertyKey = "mesh";
}

@Attributes.displayName("Mesh")
export class MeshParticle extends ParticleShape {   

    mesh = new AssetReference(StaticMeshAsset);
    scale = new Vector3(1, 1, 1);

    constructor() {
        super();
        this.onMeshChanged = this.onMeshChanged.bind(this);
        this.mesh.assetChanged.attach(this.onMeshChanged);
    }

    tesselate(positions: number[], posIdx: number, size: number) {
        let vb = this.mesh.asset ? this.mesh.asset.vertexBuffer : null;
        if (!vb) {
            return;
        }
        let meshPositions = vb.getData("position");
        for (var i = 0; i < vb.vertexCount; ++i) {
            let localIndex = i * 3;
            let idx = posIdx + localIndex;
            positions[idx + 0] = meshPositions[localIndex + 0] * size * this.scale.x;
            positions[idx + 1] = meshPositions[localIndex + 1] * size * this.scale.y;
            positions[idx + 2] = meshPositions[localIndex + 2] * size * this.scale.z;
        }
    }

    getUvs(uvs: number[], uvIdx: number) {
        let vb = this.mesh.asset ? this.mesh.asset.vertexBuffer : null;
        if (!vb) {
            return;
        }
        let meshUvs = vb.getData("uv");
        let uvCount = vb.vertexCount * 2;
        for (var i = 0; i < uvCount; ++i) {
            uvs[uvIdx + i] = meshUvs[i];
        }
    }

    makeLocalTransform(localTransform: Matrix44, cameraTransform: Transform) {
        // Do nothing
    }

    makeParticleTransform(localTransform: Matrix44, particleVelocity: Vector3) {
        localTransform.makeLookAt(particleVelocity.normalize(), Vector3.up).transpose();
    }

    vertexCount() { return this.mesh.asset ? this.mesh.asset.vertexBuffer.vertexCount : 0; }

    // tslint:disable-next-line
    setProperty(name: string, value?: any) {
        super.setProperty(name, value);
        if (this.onPropertyChanged) {
            this.onPropertyChanged(name);
        }
    }

    destroy() {
        this.mesh.detach();
    }

    private onMeshChanged(info: AssetChangedEvent) {
        if (this.onPropertyChanged) {
            this.onPropertyChanged(Private.meshPropertyKey);
        }
    }
}