import { TimeInternal } from "./Time";
import { Scene } from "../assets/Scene";
import { CollisionSystemInternal } from "../collision/CollisionSystem";
import { Debug } from "../io/Debug";
import { Entity } from "./Entity";
import { AnimationComponent } from "../animation/AnimationComponent";
import { EngineHud } from "./hud/EngineHud";
import { ObjectManagerInternal } from "./ObjectManager";
import { AssetIdDatabase } from "../assets/AssetIdDatabase";
import { RendererInternal } from "../graphics/Renderer";
import { SerializerUtils } from "../serialization/SerializerUtils";
import { IObjectManagerInternal } from "./IObjectManager";
import { defaultAssets } from "../assets/DefaultAssets";

interface SceneLoadInfo {
    path: string;
    additive: boolean;
    scene?: Scene;
    resolve: (scene: Scene) => void;
}

namespace Private {
    export let scenes: Scene[] = [];
    export let transitionInProgress = false;
    export let sceneLoadInProgress: SceneLoadInfo | null = null;
    export const preloadedScenesRequests: string[] = [];
    export const preloadedScenesInProgress: {
        scene: Scene,
        resolve: () => void;
    }[] = [];
    export const preloadedScenes: Scene[] = [];

    export function getTransitionAnimComponent() {
        const fadeQuad = defaultAssets.transitionScene.root.findChild("FadeQuad") as Entity;
        return fadeQuad.getComponent(AnimationComponent) as AnimationComponent;
    }

    export function finalizeSceneLoad() {        
        const isFirstScene = scenes.length === 0;
        if (!Private.sceneLoadInProgress) {
            console.assert(false);
            return;
        }        
        const { additive, scene, resolve } = Private.sceneLoadInProgress;
        if (!scene) {
            console.assert(false);
            return;
        }

        let sceneRemovedFromCache = false;
        if (!additive) {
            scenes.forEach(_scene => {
                sceneRemovedFromCache = _scene.templatePath === scene.templatePath;
                IObjectManagerInternal.instance.deleteObject(_scene);                
            });
            RendererInternal.clearDefaultPerspectiveCamera();
            TimeInternal.resetCurrentFrame();
            EngineHud.onSceneDestroyed();
            CollisionSystemInternal.clearCollisions();
            scenes.length = 0;
        }

        if (sceneRemovedFromCache) {
            IObjectManagerInternal.instance.addToCache(scene);
        }
        
        scenes.push(scene);

        if (isFirstScene) {
            if (process.env.CONFIG === "standalone") {
                EngineHud.create();
                IObjectManagerInternal.instance.loadGraphicObjects();
            }
        } else {
            IObjectManagerInternal.instance.loadGraphicObjects();
        }

        Private.sceneLoadInProgress = null;
        SerializerUtils.clearNonPersistentObjectCache();
        resolve(scene);
    }

    export function onTransitionAnimFinished(name: string) {
        const anim = getTransitionAnimComponent();
        if (name === "FadeOut") {
            scenes.pop();
            finalizeSceneLoad();
            anim.animationFinished.once(onTransitionAnimFinished);
            anim.playAnimation("FadeIn");
            scenes.push(defaultAssets.transitionScene);
        } else if (name === "FadeIn") {
            scenes.pop();
            transitionInProgress = false;
        }
    }
}

/**
 * @hidden
 */
export namespace ScenesInternal {
    export function list() {
        return Private.scenes;
    }

    export function updateTransition() {
        if (Private.transitionInProgress) {
            // waiting for onTransitionAnimFinished()
            return;
        }
        if (!Private.sceneLoadInProgress) {
            return;
        }
        const { scene } = Private.sceneLoadInProgress;
        if (!scene || !scene.isLoaded()) {
            return;
        }
        Debug.log(`Scene '${scene.templatePath}' loaded.`);
        if (process.env.CONFIG === "standalone") {
            if (Private.scenes.length > 0) {
                const anim = Private.getTransitionAnimComponent();
                anim.animationFinished.once(Private.onTransitionAnimFinished);
                anim.playAnimation("FadeOut");
                Private.transitionInProgress = true;
                Private.scenes.push(defaultAssets.transitionScene);
            } else {
                Private.finalizeSceneLoad();
            }
        } else {
            Private.finalizeSceneLoad();
        }
    }

    export function destroy() {
        Private.scenes.forEach(scene => IObjectManagerInternal.instance.deleteObject(scene));
        Private.scenes = [];
    }

    export function updatePreloading() {
        for (let i = 0; i < Private.preloadedScenesInProgress.length;) {
            const info = Private.preloadedScenesInProgress[i];
            if (info.scene.isLoaded()) {                
                Private.preloadedScenes.push(info.scene);
                Private.preloadedScenesInProgress.splice(i, 1);
                info.resolve();
            } else {
                ++i;
            }
        }
    }
}

export class Scenes {

    /**
     * Loads a scene asynchronously.
     * When loading is done, the scene
     * @param path - The scene path, for example 'Assets/Startup.Scene'
     * @param additive - If false, replaces all current scenes with this one. If true, add this to the current scenes.
     */
    static load(path: string, additive: boolean = false) {
        if (Private.sceneLoadInProgress) {
            console.warn(
                `Only one scene load is supported at a time. Loading '${Private.sceneLoadInProgress.path}', skipping '${path}'`
            );
            return Promise.reject();
        }

        const preloadIndex = Private.preloadedScenes.findIndex(s => s.templatePath === path);
        if (preloadIndex >= 0) {
            Private.preloadedScenes.splice(preloadIndex, 1);
            const scene = Private.preloadedScenes[preloadIndex];
            Private.sceneLoadInProgress = {
                scene: scene,
                path: path,
                additive: additive,
                resolve: () => {}
            };
            Private.finalizeSceneLoad();
            return Promise.resolve(scene);
        }

        return new Promise<Scene>((resolve, reject) => {
            Private.sceneLoadInProgress = {
                path: path,
                additive: additive,
                resolve: resolve
            };
            ObjectManagerInternal.loadObjectIgnoreCache(path)
                .then(([scene]) => {
                    (Private.sceneLoadInProgress as SceneLoadInfo).scene = scene as Scene;
                    if (process.env.CONFIG === "editor") {
                        if (ScenesInternal.list().length === 0) {
                            // we are in editor mode and this is the first scene being opened
                            // the editor needs the engine to be ready so it can update it,
                            // andk the engine only becomes ready at this point
                            // So must notify the editor immediatly. 
                            // Next transitions will work as the engine will be updated by the editor after this point.
                            Private.finalizeSceneLoad();
                        }
                    }
                })
                .catch(reject);
        });
    }

    static loadById(id: string) {
        const path = AssetIdDatabase.getPath(id);
        if (path) {
            return Scenes.load(path);
        } else {
            return Promise.reject();
        }
    }

    /**
     * Unloads a scene
     */
    static unload(scene: Scene) {        
        const sceneIndex = Private.scenes.indexOf(scene);
        if (sceneIndex >= 0) {
            scene.destroy();
            Private.scenes.splice(sceneIndex, 1);
        } else {
            console.warn(`Trying to unload an unregistered scene instance`);
        }
    }

    /**
     * Unloads a scene by path     
     */
    static unloadByPath(path: string) {
        const scene = Private.scenes.find(s => s.templatePath === path);
        if (scene) {
            Scenes.unload(scene);
        } else {
            console.warn(`Trying to unload an unknown scene '${path}'`);
        }
    }

    /**
     *  Creates an empty scene    
     */
    static create() {
        const scene = new Scene();
        Private.scenes.push(scene);
        return scene;
    }

    /**
     * Preloads a scene asynchronously.
     * After preloading is done, you must call Scenes.load() when you want the scene to become usable.
     * @param path - The scene path
     */
    static preLoad(path: string) {
        if (Private.preloadedScenesRequests.some(p => p === path)
            || Private.preloadedScenesInProgress.some(p => p.scene.templatePath === path)
            || Private.preloadedScenes.some(p => p.templatePath === path)) {
            console.warn(`Scene '${path}' is already pre-load(ed/ing). Skipping request.`);
            return Promise.reject();
        }
        Private.preloadedScenesRequests.push(path);
        return new Promise((resolve, reject) => {
            ObjectManagerInternal.loadObjectIgnoreCache(path)
                .then(([scene]) => {
                    Private.preloadedScenesInProgress.push({
                        scene: scene as Scene,
                        resolve
                    });
                    const index = Private.preloadedScenesRequests.indexOf(path);
                    console.assert(index >= 0);
                    Private.preloadedScenesRequests.splice(index, 1);
                })
                .catch(reject);
        });
    }

    /**
     * Destroys all current scenes
     */
    static clear() {
        ScenesInternal.destroy();
    }
}
