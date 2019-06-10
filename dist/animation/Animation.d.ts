import { Asset } from "../assets/Asset";
import { ArrayProperty } from "../serialization/ArrayProperty";
import { Entity } from "../core/Entity";
import { AnimationTrackDefinition } from "./AnimationTrackDefinition";
export declare class Animation extends Asset {
    duration: number;
    /**
     * @hidden
     */
    /**
    * @hidden
    */
    imported: boolean;
    tracks: ArrayProperty<AnimationTrackDefinition>;
    private _duration;
    private _imported;
    isLoaded(): boolean;
    /**
     * @hidden
     */
    static getPropertyAtPath(entity: Entity, path: string): any;
}
