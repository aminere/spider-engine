import { SerializableObject, SerializedObject } from "../core/SerializableObject";
import { Entity } from "../core/Entity";
import * as Attributes from "../core/Attributes";
import { AssetReference } from "../serialization/AssetReference";
import { EngineUtils } from "../core/EngineUtils";
import { Animation } from "./Animation";

export interface AnimationTargets {
    [targetName: string]: Entity;
}

export class AnimationInstance extends SerializableObject {
    
    get version() { return 3; }
    
    get animation() { return this._animation.asset; }
    set animation(value: Animation | null) { this._animation.asset = value; }
    loopCount = 0;
    speed = 1;
    autoPlay = true;

    get isPlaying() { return this._isPlaying; }
    set isPlaying(playing: boolean) { 
        this._isPlaying = playing; 
        if (playing) {
            this._hasPlayedOnce = true;
        } else {
            this._stopRequested = false;
        }
    }    
    get localTime() { return this._localTime; }
    set localTime(time: number) { this._localTime = time; }
    
    get stopRequested() { return this._stopRequested; }        
    get playCount() { return this._playCount; }
    
    set playCount(value: number) { this._playCount = value; }
    get hasPlayedOnce() { return this._hasPlayedOnce; }

    /**
     * @hidden
     */
    @Attributes.unserializable()
    targets!: AnimationTargets;

    @Attributes.unserializable()
    private _isPlaying = false;
    @Attributes.unserializable()
    private _localTime = 0;
    @Attributes.unserializable()
    private _hasPlayedOnce = false;
    @Attributes.unserializable()
    private _stopRequested = false;
    @Attributes.unserializable()
    private _playCount = 0;
    private _animation = new AssetReference(Animation);

    requestStop() {
        this._stopRequested = true;
    }
    
    upgrade(json: SerializedObject, previousVersion: number) {
        if (previousVersion === 1) {
            // tslint:disable-next-line
            if ((json.properties.loop as any) === true) {
                Object.assign(json.properties, { loopCount: 0 });
            } else {
                Object.assign(json.properties, { loopCount: 1 });
            }
            delete json.properties.loop;
        } else if (previousVersion === 2) {
            Object.assign(json.properties, { _animation: json.properties.animation });
            delete json.properties.animation;
        }
        return json;
    }

    isLoaded() {
        return EngineUtils.isAssetRefLoaded(this._animation);
    }
    
    destroy() {
        this._animation.detach();
        super.destroy();
    }
}
