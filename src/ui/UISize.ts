
import * as Attributes from "../core/Attributes";

export enum UISizeType {
    Auto,
    Relative,
    Absolute
}

export class UISize {   

    @Attributes.enumLiterals(UISizeType)
    type = UISizeType.Auto;

    value = 256;

    constructor(type?: number, value?: number) {
        if (type !== undefined) {
            this.type = type;
        }        
        if (value !== undefined) {
            this.value = value;
        }
    }
}

export interface SerializedUISize {
    type: number;
    value: number;
}