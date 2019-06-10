import { TAnimationKey } from "./AnimationKey";
import { MathEx } from "../../math/MathEx";

export class NumberKey extends TAnimationKey<number> {

    // [time, value] tuples
    tangents!: [[number, number], [number, number]];
    
    setValue(value: number) {
        this.value = value;
    }

    lerp(src: NumberKey, dest: NumberKey, factor: number) {
        return MathEx.lerp(src.value, dest.value, factor);
    }
}

export class BooleanKey extends TAnimationKey<boolean> {
    lerp(src: BooleanKey, dest: BooleanKey, factor: number) {
        return src.value;
    }
}

export class StringKey extends TAnimationKey<string> {
    lerp(src: StringKey, dest: StringKey, factor: number) {
        return src.value;
    }
}
