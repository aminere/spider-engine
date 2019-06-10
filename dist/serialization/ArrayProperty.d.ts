/**
 * @hidden
 */
export declare class IArrayProperty {
    grow: (instance?: any) => void;
    typeName: () => string;
    getData: () => any[];
}
/**
 * @hidden
 */
export declare class ArrayProperty<T> extends IArrayProperty {
    data: T[];
    constructor(ctor: {
        new (...args: any[]): T;
    }, data?: T[]);
    clear(): void;
}
/**
 * @hidden
 */
export interface SerializedArrayProperty {
    typeName: string;
    data: any[];
}
