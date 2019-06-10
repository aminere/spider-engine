/**
 * @hidden
 */
export declare type NativeType = number | string | boolean;
/**
 * @hidden
 */
export interface INativeArray {
    typeName: string;
    data: NativeType[];
}
/**
 * @hidden
 */
export declare type SerializedNativeArray = INativeArray;
/**
 * @hidden
 */
export declare class NativeArray<T extends NativeType> implements INativeArray {
    readonly typeName: string;
    data: T[];
    private _typeName;
    constructor(typeName: string, data?: T[]);
}
/**
 * @hidden
 */
export declare class NumberNativeArray extends NativeArray<number> {
    constructor(data?: number[]);
}
/**
 * @hidden
 */
export declare class StringNativeArray extends NativeArray<string> {
    constructor(data?: string[]);
}
/**
 * @hidden
 */
export declare class BooleanNativeArray extends NativeArray<boolean> {
    constructor(data?: boolean[]);
}
/**
 * @hidden
 */
export declare class NativeArrayFactory {
    static create(typeName: string, data: NativeType[]): INativeArray;
}
