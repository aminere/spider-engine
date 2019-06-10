import { Asset } from "./Asset";
import { UniqueObject } from "../core/UniqueObject";
import { Material } from "../graphics/Material";
import { StaticMeshAsset } from "./StaticMeshAsset";
import { AssetReference } from "../serialization/AssetReference";
import { ReferenceArray } from "../serialization/ReferenceArray";
import { Matrix44 } from "../math/Matrix44";
import { Reference } from "../serialization/Reference";
import { Animation } from "../animation/Animation";
import { AssetReferenceArray } from "../serialization/AssetReferenceArray";
import { SerializedObject } from "../core/SerializableObject";
import { Transform } from "../core/Transform";
export declare class ModelElement extends UniqueObject {
    readonly parent: ModelElement | undefined;
    userData: any;
    children: ReferenceArray<ModelElement>;
    transform: Transform;
    /**
     * @hidden
     */
    fbxNodeId: number;
    private _parent?;
    constructor();
    addChild(child: ModelElement): void;
    traverse(op: (e: ModelElement) => void): void;
}
export declare class ModelMesh extends ModelElement {
    readonly version: number;
    material: AssetReference<Material>;
    mesh: AssetReference<StaticMeshAsset>;
    destroy(): void;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
}
export declare class ModelBone extends ModelElement {
    worldMatrix: Matrix44;
}
export declare class ModelSkinnedMesh extends ModelMesh {
    bindMatrix: Matrix44;
    /**
     * @hidden
     */
    readonly boneFbxIds: number[];
    private _bindMatrix;
    private _bonesFbxIds;
    setBones(bones: ModelBone[]): void;
}
/**
 * @hidden
 */
export interface ElementFindInfo {
    element: ModelElement;
    parentArray: Reference<ModelElement>[];
    indexInParent: number;
}
export declare class Model extends Asset {
    readonly version: number;
    readonly animations: Animation[];
    readonly animationRefs: AssetReferenceArray<Animation>;
    fbxScaleFactor: number;
    elements: ReferenceArray<ModelElement>;
    private _animations;
    findElement(filter: (e: ModelElement) => boolean, parentArray?: Reference<ModelElement>[]): ElementFindInfo | null;
    clearAnimations(): void;
    addAnimation(animation: Animation): void;
    destroy(): void;
    traverse(op: (child: ModelElement) => void): void;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
}
