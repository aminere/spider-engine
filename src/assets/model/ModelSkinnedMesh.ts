
import * as Attributes from "../../core/Attributes";
import { Matrix44 } from "../../math/Matrix44";
import { ArrayProperty } from "../../serialization/ArrayProperty";
import { ModelMesh } from "./ModelMesh";
import { ModelBone } from "./ModelBone";

export class ModelSkinnedMesh extends ModelMesh {

    get bindMatrix() { return this._bindMatrix; }    
    set bindMatrix(bindMatrix: Matrix44) {
        this._bindMatrix.copy(bindMatrix);
    }

    get boneFbxIds() { return this._bonesFbxIds.data.map(d => d.valueOf()); }
    
    private _bindMatrix = new Matrix44();

    @Attributes.hidden()
    private _bonesFbxIds = new ArrayProperty(Number);

    setBones(bones: ModelBone[]) {
        this._bonesFbxIds.data.length = 0;
        for (const bone of bones) {
            this._bonesFbxIds.grow(bone.fbxNodeId);
        }
    }
}
