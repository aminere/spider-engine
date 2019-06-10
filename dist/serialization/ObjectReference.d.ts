import { ObjectDefinition } from "../behavior/ObjectDefinition";
import { AssetReference } from "./AssetReference";
/**
 * @hidden
 */
export declare class ObjectReference extends AssetReference<ObjectDefinition> {
    declarationId: string;
    private _declarationId;
    constructor(declarationId: string);
}
