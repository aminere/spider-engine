import { UniqueObject } from "../../core/UniqueObject";
import { ReferenceArray } from "../../serialization/ReferenceArray";
import { Transform } from "../../core/Transform";
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
