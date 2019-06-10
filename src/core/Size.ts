
import * as Attributes from "./Attributes";

export enum SizeType {
    Absolute,
    Relative
}
/**
 * @hidden
 */
export class SizeTypeMetadata {
    static literals = {
        Absolute: 0,
        Relative: 1        
    };
}

export class Size {

    @Attributes.enumLiterals(SizeTypeMetadata.literals)
    type: SizeType;

    value: number;

    constructor(type?: number, value?: number) {
        this.type = type !== undefined ? type : SizeType.Relative;
        this.value = value || (this.type === SizeType.Relative ? 1 : 1024);        
    }

    equals(other: Size) {
        return this.value === other.value && this.type === other.type;
    }
}

/**
 * @hidden
 */
export interface SerializedSize {
    type: number;
    value: number;
}
