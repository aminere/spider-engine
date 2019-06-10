import { TAnimationKey } from "./AnimationKey";
import { Color } from "../../graphics/Color";

export class ColorKey extends TAnimationKey<Color> {
    lerp(src: ColorKey, dest: ColorKey, factor: number, target?: Color) {
        return Color.lerp(src.value, dest.value, factor, target);
    }

    setValue(value: Color) {
        this.value = new Color(value.r, value.g, value.b, value.a);
    }
}
