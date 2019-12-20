import { SerializableMatrix44 } from "../../math/Matrix44";
import { ModelMesh } from "./ModelMesh";
import { ModelBone } from "./ModelBone";
export declare class ModelSkinnedMesh extends ModelMesh {
    bindMatrix: SerializableMatrix44;
    readonly boneFbxIds: number[];
    private _bindMatrix;
    private _bonesFbxIds;
    setBones(bones: ModelBone[]): void;
}
