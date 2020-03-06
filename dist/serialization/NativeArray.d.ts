export declare type NativeType = number | string | boolean;
export interface INativeArray {
    typeName: string;
    data: NativeType[];
}
export declare type SerializedNativeArray = INativeArray;
export declare class NativeArray<T extends NativeType> implements INativeArray {
    get typeName(): string;
    data: T[];
    private _typeName;
    constructor(typeName: string, data?: T[]);
}
export declare class NumberNativeArray extends NativeArray<number> {
    constructor(data?: number[]);
}
export declare class StringNativeArray extends NativeArray<string> {
    constructor(data?: string[]);
}
export declare class BooleanNativeArray extends NativeArray<boolean> {
    constructor(data?: boolean[]);
}
export declare class NativeArrayFactory {
    static create(typeName: string, data: NativeType[]): INativeArray;
}
