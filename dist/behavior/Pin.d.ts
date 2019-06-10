import { SerializableObject, SerializedObject } from "../core/SerializableObject";
/**
 * @hidden
 */
export declare enum PinType {
    Input = 0,
    Output = 1,
    InputOutput = 2
}
/**
 * @hidden
 */
export declare class PinReference extends SerializableObject {
    operatorId: string;
    pinId: string;
    constructor(operatorId?: string, pinId?: string);
    equals(other: PinReference): boolean;
}
/**
 * @hidden
 */
export declare class BasePin extends SerializableObject {
    readonly version: number;
    id: string;
    name: string;
    type: PinType;
    constructor(name?: string, type?: PinType, id?: string);
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
}
/**
 * @hidden
 */
export declare class SignalPin extends BasePin {
}
/**
 * @hidden
 */
export declare class DataPin extends BasePin {
    setData(data: any): void;
    getData(): any;
}
