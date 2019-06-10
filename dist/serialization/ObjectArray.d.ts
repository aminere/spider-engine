import { SerializableObject } from "../core/SerializableObject";
/**
 * @hidden
 */
export declare class IObjectArray {
    grow: (instance?: any) => void;
    typeName: () => string;
    getData: () => any[];
}
/**
* @hidden
*/
export declare class ObjectArray<T extends SerializableObject> extends IObjectArray {
    data: T[];
    constructor(ctor: {
        new (...args: any[]): T;
    }, data?: T[]);
}
