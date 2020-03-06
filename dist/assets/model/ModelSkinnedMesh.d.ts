import { SerializableMatrix44 } from "../../math/Matrix44";
import { ModelMesh } from "./ModelMesh";
import { ModelBone } from "./ModelBone";
export declare class ModelSkinnedMesh extends ModelMesh {
    get bindMatrix(): SerializableMatrix44;
    set bindMatrix(bindMatrix: SerializableMatrix44);
    get boneFbxIds(): number[];
    private _bindMatrix;
    private _bonesFbxIds;
    setBones(bones: ModelBone[]): void;
}
