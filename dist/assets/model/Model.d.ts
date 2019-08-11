import { Asset } from "../Asset";
import { ReferenceArray } from "../../serialization/ReferenceArray";
import { Animation } from "../../animation/Animation";
import { AssetReferenceArray } from "../../serialization/AssetReferenceArray";
import { SerializedObject } from "../../core/SerializableObject";
import { ModelElement } from "./ModelElement";
export declare class Model extends Asset {
    readonly version: number;
    readonly animations: Animation[];
    readonly animationRefs: AssetReferenceArray<Animation>;
    fbxScaleFactor: number;
    elements: ReferenceArray<ModelElement>;
    private _animations;
    clearAnimations(): void;
    addAnimation(animation: Animation): void;
    destroy(): void;
    traverse(op: (child: ModelElement) => void): void;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
}
