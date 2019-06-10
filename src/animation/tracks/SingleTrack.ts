import { AnimationKey, AnimationKeyInternal } from "../keys/AnimationKey";
import { ArrayProperty } from "../../serialization/ArrayProperty";
import { AnimationTrack, SerializedAnimationTrack, SerializedNumberTrack } from "./AnimationTrack";
import { BooleanKey, StringKey } from "../keys/NativeKey";
import { Constructor } from "../../core/Types";

export class SingleTrack<T extends AnimationKey> extends AnimationTrack {
    
    get version() { return 2; }

    keys: ArrayProperty<T>;
    internalCreateKey: () => AnimationKey;

    constructor(ctor: Constructor<T>) {
        super();
        this.keys = new ArrayProperty(ctor);
        // TODO lots of room for optimization, should reuse existing callback instead of creating new ones
        // Use an AnimationKeyFactory??
        this.internalCreateKey = () => new ctor();
    }

    getKeys() {
        return this.keys.data;
    }

    // tslint:disable-next-line
    createKey(time: number, value: any, created?: (key: AnimationKey) => void) {
        let key = AnimationKeyInternal.find(this.keys.data, time);
        if (key) {
            key.setValue(value);
        } else {
            key = this.internalCreateKey();
            key.time = time;
            key.setValue(value);
            this.keys.grow(key);
            this.sortByTime();
        }
        if (created) {
            created(key);
        }
    }

    removeKey(key: AnimationKey) {
        for (let i = 0; i < this.keys.data.length; ++i) {
            if (this.keys.data[i] === key) {
                this.keys.data.splice(i, 1);
                break;
            }
        }
    }

    sortByTime(removeDuplicates: boolean = true) {
        this.keys.data.sort((a, b) => a.time - b.time);

        if (removeDuplicates) {
            for (let i = 0; i < this.keys.data.length - 1;) {
                const current = this.keys.data[i];
                const next = this.keys.data[i + 1];
                if (current.time === next.time) {
                    this.keys.data.splice(i, 1);
                } else {
                    ++i;
                }
            }
        }
    }

    serialize(): SerializedAnimationTrack | SerializedNumberTrack {
        return {
            typeName: this.constructor.name,
            version: this.version,
            times: this.keys.data.map(k => k.time),
            // tslint:disable-next-line
            values: this.keys.data.map(k => (k as any).value)
        };
    }

    deserialize(json: SerializedAnimationTrack | SerializedNumberTrack) {
        if (json.version === 1) {
            console.assert(false);
        }
        const data = json as SerializedAnimationTrack;
        for (let i = 0; i < data.times.length; ++i) {
            let newKey = this.internalCreateKey();
            newKey.time = data.times[i];
            newKey.setValue(data.values[i]);
            this.keys.grow(newKey);
        }
        return Promise.resolve(this);
    }
}

export class BooleanTrack extends SingleTrack<BooleanKey> { constructor() { super(BooleanKey); } }
export class StringTrack extends SingleTrack<StringKey> { constructor() { super(StringKey); } }
