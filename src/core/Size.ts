
import * as Attributes from "./Attributes";

export enum SizeType {
    Absolute,
    Relative
}

export class Size {

    @Attributes.enumLiterals(SizeType)
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
