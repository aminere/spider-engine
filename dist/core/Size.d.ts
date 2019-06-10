export declare enum SizeType {
    Absolute = 0,
    Relative = 1
}
/**
 * @hidden
 */
export declare class SizeTypeMetadata {
    static literals: {
        Absolute: number;
        Relative: number;
    };
}
export declare class Size {
    type: SizeType;
    value: number;
    constructor(type?: number, value?: number);
    equals(other: Size): boolean;
}
/**
 * @hidden
 */
export interface SerializedSize {
    type: number;
    value: number;
}
