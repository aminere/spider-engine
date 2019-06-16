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
    export let preloadedScenesInProgress: string[] = [];
    export let preloadedScenes: string[] = [];

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
        if (!additive) {
            scenes.forEach(_scene => _scene.destroy());
            RendererInternal.clearDefaultPerspectiveCamera();
            TimeInternal.resetCurrentFrame();
            EngineHud.onSceneDestroyed();
            CollisionSystemInternal.clearCollisions();
            scenes.length = 0;
        }
        IObjectManagerInternal.instance.loadGraphicObjects();
        scenes.push(scene);
        if (isFirstScene) {
            if (process.env.CONFIG === "standalone") {
                EngineHud.create();
            }
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

        if (Private.preloadedScenes.some(p => p === path)) {
            const index = Private.preloadedScenes.indexOf(path);
            console.assert(index >= 0);
            Private.preloadedScenes.splice(index, 1);

            const scene = IObjectManagerInternal.instance.getObject(path);
            console.assert(scene);
            Private.sceneLoadInProgress = {
                scene: scene as Scene,
                path: path,
                additive: additive,
                resolve: () => {}
            };
            Private.finalizeSceneLoad();
            return Promise.resolve(scene as Scene);
        }

        return new Promise<Scene>((resolve, reject) => {
            Private.sceneLoadInProgress = {
                path: path,
                additive: additive,
                resolve: resolve
            };
            ObjectManagerInternal.loadObjectIgnoreCache(path)
                .then(tuple => {
                    (Private.sceneLoadInProgress as SceneLoadInfo).scene = tuple[0] as Scene;
                    if (process.env.CONFIG !== "standalone") {
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
        if (Private.preloadedScenesInProgress.some(p => p === path)) {
            console.warn(`Scene '${path}' is already being pre-loaded. Skipping request.`);
            return Promise.reject();
        }
        if (Private.preloadedScenes.some(p => p === path)) {
            console.warn(`Scene '${path}' is already pre-loaded. Skipping request.`);
            return Promise.reject();
        }
        Private.preloadedScenesInProgress.push(path);
        return new Promise((resolve, reject) => {            
            ObjectManagerInternal.loadObjectIgnoreCache(path)
                .then(() => {
                    Private.preloadedScenes.push(path);
                    const index = Private.preloadedScenesInProgress.indexOf(path);
                    console.assert(index >= 0);
                    Private.preloadedScenesInProgress.splice(index, 1);
                    resolve();
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
