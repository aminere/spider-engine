
import { StaticMesh } from "./StaticMesh";
import { EntityReference } from "../../serialization/EntityReference";
import { Entity } from "../../core/Entity";
import * as Attributes from "../../core/Attributes";
import { Matrix44, SerializableMatrix44 } from "../../math/Matrix44";
import { Bone } from "../../core/Bone";
import { MathEx } from "../../math/MathEx";
import { ArrayProperty } from "../../serialization/ArrayProperty";
import { Debug } from "../../io/Debug";
import { VertexBuffer } from "../VertexBuffer";
import { Shader } from "../Shader";
import { WebGL } from "../WebGL";
import { MemoryTexture } from "../MemoryTexture";

namespace Private {
    export const offsetMatrix = new Matrix44();
}

export class SkinnedMesh extends StaticMesh {

    static skeletonPropertyKey = "_skeleton";

    set skeleton(entity: Entity | null) { this._skeleton.entity = entity; }
    get skeleton() { return this._skeleton.entity; }
    get bindMatrix() { return this._bindMatrix; }
    get bindMatrixInverse() { return this._bindMatrixInverse; }
    get boneTexture() { return this._boneTexture; }
    get boneTextureSize() { return this._boneTextureSize; }
    get boneMatrices() { return this._boneMatrices; }
    set bindMatrix(bindMatrix: SerializableMatrix44) {
        this._bindMatrix.copy(bindMatrix);
        this._bindMatrixInverse.getInverse(bindMatrix);
    }
    set boneFbxIds(ids: number[]) {
        this._boneFbxIds.data.length = 0;
        for (let id of ids) {
            this._boneFbxIds.grow(id);
        }
    }

    @Attributes.hidden()
    private _skeleton: EntityReference;
    private _bindMatrix = new SerializableMatrix44();
    private _bindMatrixInverse = new SerializableMatrix44();
    @Attributes.hidden()
    private _boneFbxIds = new ArrayProperty(Number);

    @Attributes.unserializable()
    private _vb!: VertexBuffer;
    @Attributes.unserializable()
    private _boneTexture!: MemoryTexture;
    @Attributes.unserializable()
    private _boneTextureSize!: number;
    @Attributes.unserializable()
    private _boneMatrices!: Float32Array;
    @Attributes.unserializable()
    private _boneInverses!: Matrix44[];
    @Attributes.unserializable()
    private _bones!: Entity[];

    constructor() {
        super();
        this._skeleton = new EntityReference(undefined);
    }

    getVertexBuffer() {
        return super.getVertexBuffer();
    }

    destroy() {
        if (this._vb) {
            this._vb.unload(WebGL.context);
        }
        super.destroy();
    }

    updateMatrices() {
        if (!this._boneMatrices) {
            this.initMatrices();
        }

        const { offsetMatrix } = Private;
        for (let i = 0; i < this._bones.length; ++i) {
            // compute the offset between the current and the original transform
            const matrix = this._bones[i] ? this._bones[i].transform.worldMatrix : Matrix44.identity;
            offsetMatrix.multiplyMatrices(matrix, this._boneInverses[i]);
            offsetMatrix.toArray(this._boneMatrices, i * 16);
        }
    }

    updateShader(shader: Shader, bucketId: string) {
        if (WebGL.extensions.OES_texture_float) {
            this._boneTexture.dirtify();
            shader.applyReferenceParam("boneTexture", this._boneTexture, bucketId);
            shader.applyParam("boneTextureSize", this._boneTextureSize, bucketId);
        } else {
            shader.applyParam("boneMatrices", this._boneMatrices);
        }

        shader.applyParam("bindMatrix", this._bindMatrix, bucketId);
        shader.applyParam("bindMatrixInverse", this._bindMatrixInverse, bucketId);
    }

    private initMatrices() {
        const entity = this._skeleton.entity as Entity;
        // TODO handle the case where the texture is not supported
        this._bones = [];
        this._boneInverses = [];
        const allBones = entity.getComponents(Bone);
        let currentBone = 0;
        for (const _boneId of this._boneFbxIds.data) {
            const boneId = _boneId.valueOf();
            const bone = allBones.find(b => b.fbxId === boneId);
            if (bone) {
                this._bones[currentBone] = bone.entity;
                this._boneInverses[currentBone] = bone.inverseMatrix;
                ++currentBone;
            } else {
                Debug.logWarning(`Bone with ID '${_boneId}' not found`);
            }
        }
        this._bones.length = currentBone;
        this._boneInverses.length = currentBone;

        // layout (1 matrix = 4 pixels)
        //      RGBA RGBA RGBA RGBA (=> column1, column2, column3, column4)
        //  with  8x8  pixel texture max   16 bones * 4 pixels =  (8 * 8)
        //       16x16 pixel texture max   64 bones * 4 pixels = (16 * 16)
        //       32x32 pixel texture max  256 bones * 4 pixels = (32 * 32)
        //       64x64 pixel texture max 1024 bones * 4 pixels = (64 * 64)
        let size = Math.sqrt(this._bones.length * 4); // 4 pixels needed for 1 matrix
        size = MathEx.ceilPowerOfTwo(size);
        size = Math.max(size, 4);
        this._boneMatrices = new Float32Array(size * size * 4); // 4 floats per RGBA pixel

        if (WebGL.extensions.OES_texture_float) {
            const gl = WebGL.context;
            this._boneTexture = new MemoryTexture(
                this._boneMatrices, 
                size, 
                size, 
                (WebGL.version > 1) ? (gl as WebGL2RenderingContext).RGBA32F : gl.RGBA,
                gl.RGBA,
                gl.FLOAT
            );
            this._boneTextureSize = size;
        }
    }
}
