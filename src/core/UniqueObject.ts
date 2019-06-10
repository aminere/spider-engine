
import * as Attributes from "./Attributes";
import { SerializableObject } from "./SerializableObject";
import { EngineUtils } from "./EngineUtils";
import { IFactoryInternal } from "../serialization/IFactory";

export class UniqueObject extends SerializableObject {
    
    @Attributes.hidden()
    id: string;
    
    @Attributes.hidden()
    name: string;
    
    @Attributes.unserializable()
    templatePath?: string;

    constructor() {
        super();
        this.id = EngineUtils.makeUniqueId();
        this.name = this.constructor.name;
    }

    copy() {
        const copy = IFactoryInternal.instance.createObject(this.constructor.name) as UniqueObject;
        copy.templatePath = this.templatePath;
        copy.deserialize(this.serialize());
        copy.id = EngineUtils.makeUniqueId();
        return copy;
    }    
}
