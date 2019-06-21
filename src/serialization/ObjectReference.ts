
import { ObjectDefinition } from "../behavior/ObjectDefinition";
import { AssetReference } from "./AssetReference";

export class ObjectReference extends AssetReference<ObjectDefinition> {
    get declarationId() { return this._declarationId; }
    set declarationId(id: string) { this._declarationId = id; }

    private _declarationId: string;

    constructor(declarationId: string) {  
        super(ObjectDefinition);  
        this._declarationId = declarationId;
    }
}
