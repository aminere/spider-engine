import { SerializableObject } from "../../core/SerializableObject";
import { AnimationKey } from "../keys/AnimationKey";
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
    times: [number, number, number][];
    values: [number, number, number][];
}
export declare class AnimationTrack extends SerializableObject {
    /**
     * @hidden
     */
    tokenCache: TokenCache;
    getKeys(): AnimationKey[];
    getSample(time: number, target?: any): any;
    isLoaded(): boolean;
    createKey(time: number, value: any, created?: (key: AnimationKey) => void): void;
    removeKey(key: AnimationKey): void;
    sortByTime(removeDuplicates?: boolean): void;
}
