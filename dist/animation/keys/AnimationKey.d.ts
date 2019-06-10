import { SerializableObject } from "../../core/SerializableObject";
import { Color } from "../../graphics/Color";
import { Asset } from "../../assets/Asset";
import { Quaternion } from "../../math/Quaternion";
/**
 * @hidden
 */
export declare namespace AnimationKeyInternal {
    function find(keys: AnimationKey[], time: number): AnimationKey | undefined;
}
declare type AnimationSampleType = number | boolean | string | Color | Quaternion | Asset | null;
export declare class AnimationKey extends SerializableObject {
    time: number;
    lerp(src: AnimationKey, dest: AnimationKey, factor: number, target?: any): AnimationSampleType | undefined;
    getValue(): AnimationSampleType | undefined;
    setValue(value: AnimationSampleType): void;
}
export declare class TAnimationKey<T extends AnimationSampleType> extends AnimationKey {
    value: T;
    getValue(): T;
    setValue(value: T): void;
}
export {};
