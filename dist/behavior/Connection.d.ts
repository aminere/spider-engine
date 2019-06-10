import { PinReference } from "./Pin";
import { SerializableObject } from "../core/SerializableObject";
/**
 * @hidden
 */
export declare enum ConnectionType {
    Signal = 0,
    Data = 1
}
/**
 * @hidden
 */
export declare class Connection extends SerializableObject {
    src: PinReference;
    dest: PinReference;
    type: ConnectionType;
    id: string;
    constructor(src?: PinReference, dest?: PinReference, type?: ConnectionType);
}
