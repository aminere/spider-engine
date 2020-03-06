import { ObjectDefinition } from "../behavior/ObjectDefinition";
import { AssetReference } from "./AssetReference";
export declare class ObjectReference extends AssetReference<ObjectDefinition> {
    get declarationId(): string;
    set declarationId(id: string);
    private _declarationId;
    constructor(declarationId: string);
}
