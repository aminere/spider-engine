
/**
 * @hidden
 */
export type NativeType = number | string | boolean;

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
export type SerializedNativeArray = INativeArray;

/**
 * @hidden
 */
export class NativeArray<T extends NativeType> implements INativeArray {
    
    get typeName() { return this._typeName; }
    data: T[];

    private _typeName: string;

    constructor(typeName: string, data?: T[]) {
        this._typeName = typeName;
        this.data = data || [];
    }
}

/**
 * @hidden
 */
export class NumberNativeArray extends NativeArray<number> { constructor(data?: number[]) { super("number", data); } }

/**
 * @hidden
 */
export class StringNativeArray extends NativeArray<string> { constructor(data?: string[]) { super("string", data); } }

/**
 * @hidden
 */
export class BooleanNativeArray extends NativeArray<boolean> { constructor(data?: boolean[]) { super("boolean", data); } }

/**
 * @hidden
 */
namespace Internal {
    export let factory: { [typeName: string]: (data: NativeType[]) => INativeArray } = {
        number: data => new NumberNativeArray(data as number[]),
        string: data => new StringNativeArray(data as string[]),
        boolean: data => new BooleanNativeArray(data as boolean[])
    };
}

/**
 * @hidden
 */
export class NativeArrayFactory {
    static create(typeName: string, data: NativeType[]) {
        return Internal.factory[typeName](data);
    }
}
