import { SingleTrack } from "./SingleTrack";
import { NumberKey } from "../keys/NativeKey";
import * as Attributes from "../../core/Attributes";
import { SerializedNumberTrack } from "./AnimationTrack";

export class NumberTrack extends SingleTrack<NumberKey> { 
        
    get version() { return 3; }

    constructor() { super(NumberKey); } 

    getSample(time: number) {
        const keys = this.getKeys();
        if (keys.length === 0) {
            return undefined;
        }

        const keysAfter = keys.filter(k => k.time > time);
        if (keysAfter.length === keys.length) {
            // all keys are after the current time, get the value of the closest key in the future
            return keysAfter[0].value;
        }

        const keysBefore = keys.filter(k => k.time <= time);
        console.assert(keysBefore.length > 0);
        const srcKey = keysBefore[keysBefore.length - 1];
        if (keysBefore.length === keys.length) {
            // all keys are before the current time, get the value of the closest key in the past
            return srcKey.value;
        }

        // interpolate between closest key in the past and closest key in the future
        console.assert(keysAfter.length > 0);
        const destKey = keysAfter[0];
        const factor = (time - srcKey.time) / (destKey.time - srcKey.time);

        // disable curves for now        
        // bezier interpolation        
        // const oneMinusT = 1 - factor;
        // return oneMinusT * oneMinusT * oneMinusT * srcKey.value +
        //     3 * oneMinusT * oneMinusT * factor * srcKey.tangents[1][1] +
        //     3 * oneMinusT * factor * factor * destKey.tangents[0][1] +
        //     factor * factor * factor * destKey.value;
        return srcKey.lerp(srcKey, destKey, factor);
    }

    serialize(): SerializedNumberTrack {
        return {
            typeName: this.constructor.name,
            version: this.version,
            times: this.keys.data.map(k => [k.time, k.tangents[0][0], k.tangents[1][0]]),
            values: this.keys.data.map(k => [k.value, k.tangents[0][1], k.tangents[1][1]])
        };
    }

    deserialize(json: SerializedNumberTrack) {
        if (json.version === 1) {
            console.assert(false);
        } else if (json.version === 2) {
            // tslint:disable-next-line
            const { times, values } = json as any;
            Object.assign(json, {
                // tslint:disable-next-line
                times: times.map((k: any) => [k, k, k]),
                // tslint:disable-next-line
                values: values.map((k: any) => [k, k, k])
            });
        }
        const data = json as SerializedNumberTrack;
        for (let i = 0; i < data.times.length; ++i) {
            const newKey = this.internalCreateKey() as NumberKey;
            newKey.time = data.times[i][0];
            newKey.setValue(data.values[i][0]);
            newKey.tangents = [
                [data.times[i][1], data.values[i][1]], 
                [data.times[i][2], data.values[i][2]]
            ];
            this.keys.grow(newKey);
        }
        return this;
    }
}
