import { AssetKey } from "../keys/AssetKey";
import { SingleTrack } from "./SingleTrack";
import { AnimationKey, AnimationKeyInternal } from "../keys/AnimationKey";
import { SerializedAnimationTrack } from "./AnimationTrack";

export class AssetTrack extends SingleTrack<AssetKey> {

    get typeName() { return this._typeName; }

    private _typeName: string;

    constructor(typeName: string) {
        super(AssetKey);
        this._typeName = typeName;
    }

    createKey(time: number, value: string, created?: (key: AnimationKey) => void) {
        const oldKey = AnimationKeyInternal.find(this.keys.data, time);
        if (oldKey) {
            (oldKey as AssetKey).initializeReference(value, this._typeName, () => {
                if (created) {
                    created(oldKey);
                }
            });
        } else {
            const newKey = this.internalCreateKey();
            newKey.time = time;
            this.keys.grow(newKey);
            this.sortByTime();
            (newKey as AssetKey).initializeReference(value, this._typeName, () => {
                if (created) {
                    created(newKey);
                }
            });
        }
    }

    isLoaded() {
        if (!this._typeName) {
            return false;
        }
        if (this.keys) {
            for (let key of this.keys.data) {
                if (!key.isLoaded()) {
                    return false;
                }
            }
        }
        return true;
    }

    serialize(): SerializedAnimationTrack {
        const trackData = super.serialize() as SerializedAnimationTrack;
        Object.assign(trackData, { _typeName: this._typeName });
        return trackData;
    }

    deserialize(json: SerializedAnimationTrack) {
        if (json.version === 1) {
            // tslint:disable-next-line
            this._typeName = (json as any).properties._typeName.data;         
        } else {
            // tslint:disable-next-line
            this._typeName = (json as any)._typeName;
        }
        super.deserialize(json);        
        // Resolve asset references
        for (const key of this.keys.data) {
            key.initializeReference(key.value, this.typeName, () => { });
        }
        return Promise.resolve(this);
    }
}