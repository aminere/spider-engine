import { TAnimationKey } from "./AnimationKey";
import { Color } from "../../graphics/Color";
export declare class ColorKey extends TAnimationKey<Color> {
    lerp(src: ColorKey, dest: ColorKey, factor: number, target?: Color): Color;
    setValue(value: Color): void;
}
