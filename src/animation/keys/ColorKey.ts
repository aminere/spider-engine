import { TAnimationKey } from "./AnimationKey";
import { Color } from "../../graphics/Color";

export class ColorKey extends TAnimationKey<Color> {
    lerp(src: ColorKey, dest: ColorKey, factor: number, target?: Color) {
        const _target = target || Color.dummy;
        return _target.copy(src.value).lerp(dest.value, factor);
    }

    setValue(value: Color) {
        this.value = new Color(value.r, value.g, value.b, value.a);
    }
}
