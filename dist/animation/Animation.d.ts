import { Asset } from "../assets/Asset";
import { ArrayProperty } from "../serialization/ArrayProperty";
import { Entity } from "../core/Entity";
import { AnimationTrackDefinition } from "./AnimationTrackDefinition";
export declare class Animation extends Asset {
    set duration(duration: number);
    get duration(): number;
    /**
     * @hidden
     */
    set imported(imported: boolean);
    /**
     * @hidden
     */
    get imported(): boolean;
    tracks: ArrayProperty<AnimationTrackDefinition>;
    private _duration;
    private _imported;
    isLoaded(): boolean;
    /**
     * @hidden
     */
    static getPropertyAtPath(entity: Entity, path: string): any;
}
