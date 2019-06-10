
export type NativeType = number | string | boolean;

export interface INativeArray {
    typeName: string;
    data: NativeType[];
}

export type SerializedNativeArray = INativeArray;

export class NativeArray<T extends NativeType> implements INativeArray {
    
    get typeName() { return this._typeName; }
    data: T[];

    private _typeName: string;

    constructor(typeName: string, data?: T[]) {
        this._typeName = typeName;
        this.data = data || [];
    }
}

export class NumberNativeArray extends NativeArray<number> { constructor(data?: number[]) { super("number", data); } }
export class StringNativeArray extends NativeArray<string> { constructor(data?: string[]) { super("string", data); } }
export class BooleanNativeArray extends NativeArray<boolean> { constructor(data?: boolean[]) { super("boolean", data); } }

namespace Private {
    export const factory: { [typeName: string]: (data: NativeType[]) => INativeArray } = {
        number: data => new NumberNativeArray(data as number[]),
        string: data => new StringNativeArray(data as string[]),
        boolean: data => new BooleanNativeArray(data as boolean[])
    };
}

export class NativeArrayFactory {
    static create(typeName: string, data: NativeType[]) {
        return Private.factory[typeName](data);
    }
}
