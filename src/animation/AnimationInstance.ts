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
    set animation(value: Animation | null) { 
        delete this.targets;
        this._animation.asset = value;
    }
    loopCount = 0;
    speed = 1;
    autoPlay = true;

    get isPlaying() { return this._isPlaying; }
    set isPlaying(playing: boolean) { 
        this._isPlaying = playing;
    }    
    get localTime() { return this._localTime; }
    set localTime(time: number) { this._localTime = time; }

    get playTime() { return this._playTime; }
    set playTime(time: number) { this._playTime = time; }
    
    get stopRequested() { return this._stopRequested; }        
    get playCount() { return this._playCount; }
    
    set playCount(value: number) { this._playCount = value; }    

    get autoPlayStatus() {
        if (this._autoPlayStatus === undefined) {
            this._autoPlayStatus = this.autoPlay;
        }
        return this._autoPlayStatus;
    }

    set autoPlayStatus(autoPlay: boolean) {
        this._autoPlayStatus = autoPlay;
    }

    /**
     * @hidden
     */
    @Attributes.unserializable()
    targets?: AnimationTargets;

    @Attributes.unserializable()
    private _isPlaying = false;
    @Attributes.unserializable()
    private _localTime = 0;
    @Attributes.unserializable()
    private _playTime = 0;
    @Attributes.unserializable()
    private _stopRequested = false;
    @Attributes.unserializable()
    private _playCount = 0;
    @Attributes.unserializable()
    private _autoPlayStatus?: boolean;

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
        delete this.targets;
        this._animation.detach();
        super.destroy();
    }
}
