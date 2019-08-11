import { Matrix44 } from "../../math/Matrix44";
import { ModelMesh } from "./ModelMesh";
import { ModelBone } from "./ModelBone";
export declare class ModelSkinnedMesh extends ModelMesh {
    bindMatrix: Matrix44;
    readonly boneFbxIds: number[];
    private _bindMatrix;
    private _bonesFbxIds;
    setBones(bones: ModelBone[]): void;
}
