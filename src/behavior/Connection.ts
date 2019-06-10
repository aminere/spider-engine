
import { PinReference } from "./Pin";
import { SerializableObject } from "../core/SerializableObject";
import * as Attributes from "../core/Attributes";
import { EngineUtils } from "../core/EngineUtils";

/**
 * @hidden
 */
export enum ConnectionType {
    Signal,
    Data
}

/**
 * @hidden
 */
export class Connection extends SerializableObject {

    src: PinReference;
    dest: PinReference;
    type: ConnectionType;

    @Attributes.unserializable()
    id: string;

    constructor(src?: PinReference, dest?: PinReference, type?: ConnectionType) {
        super();
        this.src = src || new PinReference();
        this.dest = dest || new PinReference();
        this.type = type || ConnectionType.Signal;
        this.id = EngineUtils.makeUniqueId();
    }
}
