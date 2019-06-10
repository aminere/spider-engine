
import * as Attributes from "../core/Attributes";

export enum UISizeType {
    Auto,
    Relative,
    Absolute
}
/**
 * @hidden
 */
export class UISizeTypeMetadata {
    static literals = {  
        Auto: 0,
        Relative: 1,
        Absolute: 2
    };
}

export class UISize {   

    @Attributes.enumLiterals(UISizeTypeMetadata.literals)
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

/**
 * @hidden
 */
export interface SerializedUISize {
    type: number;
    value: number;
}