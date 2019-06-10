import { SingleTrack } from "./SingleTrack";
import { ColorKey } from "../keys/ColorKey";
import { Color } from "../../graphics/Color";
import { AnimationKey, AnimationKeyInternal } from "../keys/AnimationKey";

export class ColorTrack extends SingleTrack<ColorKey> {
    constructor() {
        super(ColorKey);
    }

    createKey(time: number, value: Color, created?: (key: AnimationKey) => void) {
        let key = AnimationKeyInternal.find(this.keys.data, time);
        if (key) {
            (key.getValue() as Color).copy(value);
        } else {
            key = this.internalCreateKey();
            key.time = time;
            key.setValue(new Color().copy(value));
            this.keys.grow(key);
            this.sortByTime();
        }
        if (created) {
            created(key);
        }
    }

    getSample(time: number, target: Color) {
        const keys = this.getKeys();
        if (keys.length === 0 || !target) {
            return undefined;
        }

        const keysAfter = keys.filter(k => k.time > time);
        if (keysAfter.length === keys.length) {
            // all keys are after the current time, get the value of the closest key in the future
            return target.copy(keysAfter[0].getValue());
        }

        const keysBefore = keys.filter(k => k.time <= time);
        console.assert(keysBefore.length > 0);
        const srcKey = keysBefore[keysBefore.length - 1];
        if (keysBefore.length === keys.length) {
            // all keys are before the current time, get the value of the closest key in the past
            return target.copy(srcKey.getValue());
        }

        // interpolate between closest key in the past and closest key in the future
        // TODO quadratic interpolation?
        const destKey = keysAfter[0];
        const factor = (time - srcKey.time) / (destKey.time - srcKey.time);
        return srcKey.lerp(srcKey, destKey, factor, target);
    }
}