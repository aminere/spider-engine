export declare enum UISizeType {
    Auto = 0,
    Relative = 1,
    Absolute = 2
}
/**
 * @hidden
 */
export declare class UISizeTypeMetadata {
    static literals: {
        Auto: number;
        Relative: number;
        Absolute: number;
    };
}
export declare class UISize {
    type: UISizeType;
    value: number;
    constructor(type?: number, value?: number);
}
/**
 * @hidden
 */
export interface SerializedUISize {
    type: number;
    value: number;
}
