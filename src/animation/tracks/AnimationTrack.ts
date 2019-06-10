import { SerializableObject } from "../../core/SerializableObject";
import { AnimationKey } from "../keys/AnimationKey";
import * as Attributes from "../../core/Attributes";

/**
 * @hidden
 */
export interface TokenCache {
    [propertyPath: string]: string[];
}

export interface SerializedAnimationTrack {
    typeName: string;
    version: number;
    times: number[];
    values: (boolean | string)[];
}

export interface SerializedNumberTrack {
    typeName: string;
    version: number;
    // [main, tangent1, tangent2]
    times: [number, number, number][];
    values: [number, number, number][];
}

export class AnimationTrack extends SerializableObject {

    /**
     * @hidden
     */
    @Attributes.unserializable()
    tokenCache: TokenCache = {};     

    getKeys(): AnimationKey[] {
        return [];
    }

    // tslint:disable-next-line
    getSample(time: number, target?: any): any {
        const keys = this.getKeys();
        if (keys.length === 0) {
            return undefined;
        }

        const keysAfter = keys.filter(k => k.time > time);
        if (keysAfter.length === keys.length) {
            // all keys are after the current time, get the value of the closest key in the future
            return keysAfter[0].getValue();
        }

        const keysBefore = keys.filter(k => k.time <= time);
        console.assert(keysBefore.length > 0);
        const srcKey = keysBefore[keysBefore.length - 1];
        if (keysBefore.length === keys.length) {
            // all keys are before the current time, get the value of the closest key in the past
            return srcKey.getValue();
        }

        // interpolate between closest key in the past and closest key in the future
        // TODO quadratic interpolation?
        console.assert(keysAfter.length > 0);
        const destKey = keysAfter[0];
        const factor = (time - srcKey.time) / (destKey.time - srcKey.time);
        return srcKey.lerp(srcKey, destKey, factor, target);
    }

    isLoaded() {
        return true;
    }

    // tslint:disable-next-line
    createKey(time: number, value: any, created?: (key: AnimationKey) => void) { }
    removeKey(key: AnimationKey) { }
    sortByTime(removeDuplicates: boolean = true) { }
}
