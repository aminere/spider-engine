import { ObjectDefinition } from "../behavior/ObjectDefinition";
import { AssetReference } from "./AssetReference";
export declare class ObjectReference extends AssetReference<ObjectDefinition> {
    declarationId: string;
    private _declarationId;
    constructor(declarationId: string);
}
