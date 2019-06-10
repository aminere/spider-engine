import { SerializableObject } from "../../core/SerializableObject";
import { Color } from "../../graphics/Color";
import { Asset } from "../../assets/Asset";
import { Quaternion } from "../../math/Quaternion";

export namespace AnimationKeyInternal {
    export function find(keys: AnimationKey[], time: number) {
        // TODO: epsilon compare
        return keys.find(k => k.time === time);
    }
}

type AnimationSampleType = number
    | boolean
    | string
    | Color
    | Quaternion
    | Asset
    | null;

export class AnimationKey extends SerializableObject {
    time!: number;

    // tslint:disable-next-line
    lerp(src: AnimationKey, dest: AnimationKey, factor: number, target?: any): AnimationSampleType | undefined { 
        return undefined; 
    }

    getValue(): AnimationSampleType | undefined {
        return undefined;
    }

    setValue(value: AnimationSampleType) {}
}

export class TAnimationKey<T extends AnimationSampleType> extends AnimationKey {
    value!: T;

    getValue() {
        return this.value;
    }
    
    setValue(value: T) {
        this.value = value;
    }
}
