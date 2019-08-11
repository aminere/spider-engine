export declare enum UISizeType {
    Auto = 0,
    Relative = 1,
    Absolute = 2
}
export declare class UISize {
    type: UISizeType;
    value: number;
    constructor(type?: number, value?: number);
}
export interface SerializedUISize {
    type: number;
    value: number;
}
