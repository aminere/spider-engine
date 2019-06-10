
import * as Attributes from "../../core/Attributes";
import { Geometry, GraphicUpdateResult } from "./Geometry";
import { Matrix44 } from "../../math/Matrix44";
import { Vector3 } from "../../math/Vector3";
import { Transform } from "../../core/Transform";
import { Color } from "../Color";
import { VertexBuffer } from "../VertexBuffer";
import { WebGL } from "../WebGL";
import { Camera } from "../Camera";
import { Shader } from "../Shader";
import { ParticleShape } from "../particles/ParticleShape";

/**
 * @hidden
 */
export type ColorOffset = "color";

/**
 * @hidden
 */
export type Vector3Offset = "position" | "velocity";

/**
 * @hidden
 */
export type DataOffset =
    Vector3Offset
    | ColorOffset
    | "life"
    | "remainingLife"
    | "size"
    | "active";

/**
 * @hidden
 */
namespace Private {
    // offsets into an interleaved number array[]
    export const dataOffsets: { [name: string]: number } = {
        // Vector3
        position: 0,
        // Vector3
        velocity: 3,
        // Color RGBA
        color: 6,
        // number
        life: 10,
        // number
        remainingLife: 11,
        // number
        size: 12,
        // number
        active: 13,
        MAX: 14
    };

    export function getDataOffset(name: DataOffset, particleIndex: number, localOffset: number) {
        return (particleIndex * dataOffsets.MAX) + dataOffsets[name] + localOffset;
    }

    export const particlePos = new Vector3();
    export const particleVelocity = new Vector3();
    export const color = new Color();
    export const localTransform = new Matrix44();
}

@Attributes.creatable(false)
@Attributes.displayName("Particles")
export class ParticlesGeometry extends Geometry {

    get vb() { return this._vb; }
    set worldSpace(worldSpace: boolean) { this._worldSpace = worldSpace; }
    set particleCount(count: number) { this._particleCount = count; }
    set shape(shape: ParticleShape | undefined) {
        if (this._shape) {
            delete this._shape.onPropertyChanged;
        }
        this._shape = shape;
        if (shape) {
            shape.onPropertyChanged = name => this.onParticleShapePropertyChanged(name);
        }
        this.initVertexBuffer(this._maxParticles);
    }

    @Attributes.unserializable()
    private _vb!: VertexBuffer;
    @Attributes.unserializable()
    private _interleavedData!: number[];
    @Attributes.unserializable()
    private _worldTransform = new Matrix44();
    @Attributes.unserializable()
    private _worldSpace = false;
    @Attributes.unserializable()
    private _particleCount = 0;
    @Attributes.unserializable()
    private _maxParticles = 0;
    @Attributes.unserializable()
    private _shape?: ParticleShape;

    constructor(maxParticles?: number, shape?: ParticleShape) {
        super();
        this._shape = shape;
        if (shape) {
            shape.onPropertyChanged = name => this.onParticleShapePropertyChanged(name);
        }
        if (maxParticles) {
            this._maxParticles = maxParticles;
        }
        if (this._maxParticles) {
            this.initVertexBuffer(this._maxParticles);
        }
    }

    destroy() {
        if (this._vb) {
            this._vb.unload(WebGL.context);
        }
        super.destroy();
    }

    getVertexBuffer() {
        return this._vb;
    }

    getWorldTransform(transform: Transform) {
        this._worldTransform.copy(Matrix44.identity);
        if (!this._worldSpace) {
            // Exclude rotation, it's built into the particles        
            this._worldTransform.scale(transform.worldScale);
            this._worldTransform.setPosition(transform.worldPosition);
        }
        return this._worldTransform;
    }

    graphicUpdate(camera: Camera, shader: Shader, buckedId: string, transform: Transform, deltaTime: number) {
        // update
        if (!this._shape) {
            this._vb.vertexCount = 0;
            return GraphicUpdateResult.Unchanged;
        }

        const { particlePos, particleVelocity, color, localTransform } = Private;
        const positions = this._vb.data.position;
        const colors = this._vb.data.color;
        let posIdx = 0;
        let colIdx = 0;
        this._shape.makeLocalTransform(localTransform, camera.entity.transform);
        const vertexCount = this._shape.vertexCount();
        let particlesToProcess = this._particleCount;
        const dummy = Vector3.fromPool();
        for (let i = 0; i < this._maxParticles; ++i) {
            if (particlesToProcess === 0) {
                // early break if no more particles to process
                break;
            }

            const active = this.getData("active", i);
            if (active === 0) {
                continue;
            }

            this.getVector3("position", i, particlePos);
            this.getVector3("velocity", i, particleVelocity);
            this._shape.makeParticleTransform(localTransform, particleVelocity);
            localTransform.setPosition(particlePos);

            // tesselate               
            const size = this.getData("size", i);
            this._shape.tesselate(positions, posIdx, size);
            for (let j = 0; j < vertexCount; ++j) {
                // apply the local transform to the vertices
                const idx = j * 3;
                dummy.setFromArray(positions, posIdx + idx).transform(localTransform).toArray(positions, posIdx + idx);
            }

            posIdx += vertexCount * 3;

            // Apply colors
            this.getColor(i, color);
            for (let j = 0; j < vertexCount; ++j) {
                const idx = colIdx + j * 4;
                colors[idx + 0] = color.r; colors[idx + 1] = color.g; colors[idx + 2] = color.b; colors[idx + 3] = color.a;
            }
            colIdx += vertexCount * 4;

            --particlesToProcess;
        }

        this._vb.vertexCount = posIdx / 3;
        this._vb.dirtifyData("position");
        this._vb.dirtifyData("color");
        return GraphicUpdateResult.Changed;
    }

    initVertexBuffer(maxParticles: number) {
        // Init vertex buffer
        if (this._vb) {
            this._vb.unload(WebGL.context);
        }

        this._vb = new VertexBuffer();
        this._maxParticles = maxParticles;

        // Init interleaved logical data
        if (!this._interleavedData) {
            this._interleavedData = [];
        }

        this.resetData(maxParticles);

        if (!this._shape) {
            return;
        }

        const verticesPerParticles = this._shape.vertexCount();
        if (verticesPerParticles === 0) {
            // This is most likely a mesh shape whose mesh data didn't load yet.
            // It's OK this is recalled in onParticleShapePropertyChanged when the mesh data is available
            return;
        }

        const positions: number[] = [];
        positions.length = verticesPerParticles * maxParticles;
        this._vb.setData("position", positions);

        const colors: number[] = [];
        colors.length = this._vb.vertexCount * 4;
        this._vb.setData("color", colors);

        const uvs: number[] = [];
        uvs.length = this._vb.vertexCount * 2;
        let uvIdx = 0;
        for (let i = 0; i < maxParticles; ++i) {
            this._shape.getUvs(uvs, uvIdx);
            uvIdx += verticesPerParticles * 2;
        }
        this._vb.setData("uv", uvs);
        this._vb.isDynamic = true;
        this._vb.primitiveType = "TRIANGLES";
    }

    resetData(maxParticles: number) {
        let dataLength = maxParticles * Private.dataOffsets.MAX;
        this._interleavedData.length = dataLength;
        for (var i = 0; i < dataLength; ++i) {
            this._interleavedData[i] = 0;
        }
    }

    getData(name: DataOffset, particleIndex: number, localOffset?: number) {
        const index = Private.getDataOffset(name, particleIndex, localOffset || 0);
        if (process.env.CONFIG === "editor") {
            console.assert(index < this._interleavedData.length);
        }
        return this._interleavedData[index];
    }

    setData(name: DataOffset, particleIndex: number, value: number, localOffset?: number) {
        const index = Private.getDataOffset(name, particleIndex, localOffset || 0);
        if (process.env.CONFIG === "editor") {
            console.assert(index < this._interleavedData.length);
        }
        this._interleavedData[index] = value;
    }

    setVector3(name: Vector3Offset, particleIndex: number, value: Vector3) {
        this.setData(name, particleIndex, value.x, 0);
        this.setData(name, particleIndex, value.y, 1);
        this.setData(name, particleIndex, value.z, 2);
    }

    getVector3(name: Vector3Offset, particleIndex: number, result: Vector3) {
        result.x = this.getData(name, particleIndex, 0);
        result.y = this.getData(name, particleIndex, 1);
        result.z = this.getData(name, particleIndex, 2);
    }

    setColor(particleIndex: number, value: Color) {
        this.setData("color", particleIndex, value.r, 0);
        this.setData("color", particleIndex, value.g, 1);
        this.setData("color", particleIndex, value.b, 2);
        this.setData("color", particleIndex, value.a, 3);
    }

    getColor(particleIndex: number, result: Color) {
        result.r = this.getData("color", particleIndex, 0);
        result.g = this.getData("color", particleIndex, 1);
        result.b = this.getData("color", particleIndex, 2);
        result.a = this.getData("color", particleIndex, 3);
    }

    private onParticleShapePropertyChanged(name: string) {
        this.initVertexBuffer(this._maxParticles);
    }
}
