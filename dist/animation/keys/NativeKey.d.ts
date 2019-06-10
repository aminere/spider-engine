import { TAnimationKey } from "./AnimationKey";
export declare class NumberKey extends TAnimationKey<number> {
    tangents: [[number, number], [number, number]];
    setValue(value: number): void;
    lerp(src: NumberKey, dest: NumberKey, factor: number): number;
}
export declare class BooleanKey extends TAnimationKey<boolean> {
    lerp(src: BooleanKey, dest: BooleanKey, factor: number): boolean;
}
export declare class StringKey extends TAnimationKey<string> {
    lerp(src: StringKey, dest: StringKey, factor: number): string;
}
