import { Asset } from "../assets/Asset";
import { ReferenceArray } from "../serialization/ReferenceArray";
import { BasePin } from "./Pin";
import * as Attributes from "../core/Attributes";
import { AsyncEvent } from "ts-events";

@Attributes.displayName("Object Declaration")
export class ObjectDeclaration extends Asset {
    get pins() { return this._pins; }
    
    @Attributes.unserializable()
    pinChanged = new AsyncEvent<string>();

    private _pins = new ReferenceArray(BasePin);
}
