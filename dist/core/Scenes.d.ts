import { Scene } from "../assets/Scene";
/**
 * @hidden
 */
export declare namespace ScenesInternal {
    function list(): Scene[];
    function updateTransition(): void;
    function destroy(): void;
    function updatePreloading(): void;
}
export declare class Scenes {
    /**
     * Loads a scene asynchronously.
     * When loading is done, the scene
     * @param path - The scene path, for example 'Assets/Startup.Scene'
     * @param additive - If false, replaces all current scenes with this one. If true, add this to the current scenes.
     */
    static load(path: string, additive?: boolean): Promise<Scene>;
    static loadById(id: string): Promise<Scene>;
    /**
     * Unloads a scene
     */
    static unload(scene: Scene): void;
    /**
     * Unloads a scene by path
     */
    static unloadByPath(path: string): void;
    /**
     *  Creates an empty scene
     */
    static create(): Scene;
    /**
     * Preloads a scene asynchronously.
     * After preloading is done, you must call Scenes.load() when you want the scene to become usable.
     * @param path - The scene path
     */
    static preLoad(path: string): Promise<unknown>;
    /**
     * Destroys all current scenes
     */
    static clear(): void;
}
