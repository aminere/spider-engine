
import { RendererInternal } from "../graphics/Renderer";
import { TypeDefinition, FactoryInternal } from "../serialization/Factory";

import { Vector3 } from "../math/Vector3";
import { Matrix44 } from "../math/Matrix44";
import { Quaternion } from "../math/Quaternion";
import { Vector2 } from "../math/Vector2";
import { Vector4 } from "../math/Vector4";
import { Matrix33 } from "../math/Matrix33";
import { Plane } from "../math/Plane";
import { Triangle } from "../math/Triangle";

import { ObjectManagerInternal } from "./ObjectManager";
import { SerializerInternal } from "../serialization/Serializer";
import { WebGL } from "../graphics/WebGL";
import { IFileInternal } from "../io/File/IFile";
import { AssetIdDatabaseInternal } from "../assets/AssetIdDatabase";

import { Debug } from "../io/Debug";
import { GeometryProvider } from "../graphics/geometry/GeometryProvider";
import { Camera } from "../graphics/Camera";
import { IOUtils } from "../io/IOUtils";
import { WebUtils } from "../common/WebUtils";
import { EngineSettings } from "./EngineSettings";
import { DOMUtils } from "../common/DOMUtils";
import { Components } from "./Components";
import { AssetsInternal } from "../assets/Assets";
import { GamepadsInternal } from "../input/Gamepads";
import { UpdateInternal } from "./Update";
import { DefaultAssetsInternal } from "../assets/DefaultAssets";
import { TimeInternal } from "./Time";
import { ScenesInternal, Scenes } from "./Scenes";
import { EntityUtilsInternal } from "./EntityUtils";
import { SerializableObject } from "./SerializableObject";
import { Input, InputInternal } from "../input/Input";
import { FoldersInternal } from "../io/Folders";
import { SavedDataInternal } from "../io/SavedData";
import { IObjectManagerInternal } from "./IObjectManager";
import { EngineError } from "./EngineError";
import { BehaviorErrors } from "../behavior/BehaviorErrors";

export interface EngineConfig {
    container?: HTMLCanvasElement;
    startupScene?: string;
    startupUrl?: string;
    projectId?: string; // Need a unique ID for persistent saved data
    customTypes?: TypeDefinition<SerializableObject>[];
    initialTouchPosition?: Vector2;
    onSceneLoaded?: (path: string) => void;
    onDownloadProgress?: (amount: number, finished: boolean) => void;
}

namespace Private {
    export let targetCanvas: HTMLCanvasElement;
    export let canvasResized = false;
    export let engineConfig: EngineConfig;
    export let playRequestId: string | null = null;    
    export let engineActive = false;    
    export let loadingInProgress = false;
    export const keysDown = new Map<number, boolean>();

    export function onDownloadProgressChanged(amount: number) {
        if (engineConfig.onDownloadProgress) {
            engineConfig.onDownloadProgress(amount, false);
        }
    }

    export function createFileInterface(): Promise<void> {
        let useAssetsBundle = false;
        const fileCtor = function () {
            if (process.env.CONFIG === "editor") {
                if (process.env.PLATFORM === "web") {
                    return require("../io/File/FileIndexedDb").FileIndexedDb;
                } else if (process.env.PLATFORM === "electron") {
                    return require("../io/File/FileEditorElectron").FileEditorElectron;
                }
            } else if (process.env.CONFIG === "standalone") {
                if (process.env.PLATFORM === "web") {
                    const useInMemoryFileSystem = Boolean(Private.engineConfig.startupUrl);
                    if (useInMemoryFileSystem) {
                        return require("../io/File/FileInMemory").FileInMemory;
                    } else {
                        useAssetsBundle = true;
                        return require("../io/File/FileStandaloneWeb").FileStandaloneWeb;
                    }
                } else if (process.env.PLATFORM === "electron") {
                    return require("../io/File/FileStandaloneElectron").FileStandaloneElectron;
                }
            }
            return null;
        }();

        console.assert(fileCtor);
        if (process.env.CONFIG === "standalone"
            && process.env.PLATFORM === "web"
            && useAssetsBundle) {
            return import(/* webpackChunkName: "default-assets" */ "../assets/default-assets.json")
                .then(esmodule => esmodule as { [path: string]: {} })
                .then(({ default: bundle }) => {
                    const defaultAssets = Object.entries(bundle).reduce(
                        (prev, [path, data]) => {                            
                            return {
                                ...prev, 
                                ...{ [`Assets/DefaultAssets/${path}`]: JSON.stringify(data) } 
                            };
                        },
                        {}
                    );
                    IFileInternal.instance = new fileCtor(defaultAssets);
                });
        } else {
            IFileInternal.instance = new fileCtor();
            if (process.env.CONFIG === "editor" && process.env.PLATFORM === "web") {
                const dbName = `spider-${process.env.CONFIG}`;
                const dbVersion = 1;
                return require("../io/IndexedDb").IndexedDb.initialize(dbName, dbVersion);
            }
        }
        return Promise.resolve();
    }

    export function downloadPlayableProject(playUrl: string) {        
        return new Promise<void>((resolve, reject) => {
            console.assert(!playRequestId);
            playRequestId = WebUtils.request(
                "GET",
                playUrl,
                blob => {
                    if (engineConfig.onDownloadProgress) {
                        engineConfig.onDownloadProgress(100, true);
                    }
                    WebUtils.downloadProgressChanged.detach(Private.onDownloadProgressChanged);
                    IOUtils.importGameFromBlob(
                        blob,
                        () => resolve(),
                        reject
                    );
                },
                () => WebUtils.downloadProgressChanged.detach(Private.onDownloadProgressChanged),
                undefined,
                "blob"
            );
            WebUtils.downloadProgressChanged.attach(Private.onDownloadProgressChanged);
        });
    }
}

/**
 * @hidden
 */
export namespace EngineHandlersInternal {
    export function onWindowResized() {
        if (Private.targetCanvas) {
            RendererInternal.processCanvasDimensions(Private.targetCanvas);
            Private.canvasResized = true;
        }
    }

    export function onMouseDown(e: MouseEvent) {
        // TODO these need to be queued and sent in the update loop.
        const rc = Private.targetCanvas.getBoundingClientRect();
        InputInternal.onTouchDown(e.clientX - rc.left, e.clientY - rc.top, e.button);
        e.preventDefault();
    }

    export function onMouseWheel(e: WheelEvent) {
        const delta = DOMUtils.getWheelDelta(e.deltaY, e.deltaMode);
        InputInternal.onMouseWheel(delta);
        e.preventDefault();
    }

    export function onMouseMove(e: MouseEvent) {
        const rc = Private.targetCanvas.getBoundingClientRect();
        InputInternal.onTouchMove(e.clientX - rc.left, e.clientY - rc.top, e.button);
        e.preventDefault();
    }

    export function onMouseUp(e: MouseEvent) {
        const rc = Private.targetCanvas.getBoundingClientRect();
        InputInternal.onTouchUp(e.clientX - rc.left, e.clientY - rc.top, e.button);
        e.preventDefault();
    }

    export function onTouchStart(e: TouchEvent) {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; ++i) {
            const rc = Private.targetCanvas.getBoundingClientRect();
            const touch = e.changedTouches[i];
            InputInternal.onTouchDown(touch.clientX - rc.left, touch.clientY - rc.top, 0);
            break;
        }
    }

    export function onTouchEnd(e: TouchEvent) {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; ++i) {
            const rc = Private.targetCanvas.getBoundingClientRect();
            const touch = e.changedTouches[i];
            InputInternal.onTouchUp(touch.clientX - rc.left, touch.clientY - rc.top, 0);
            break;
        }
    }

    export function onTouchCancel(e: TouchEvent) {
        e.preventDefault();
        onTouchEnd(e);
    }

    export function onTouchMove(e: TouchEvent) {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; ++i) {
            const rc = Private.targetCanvas.getBoundingClientRect();
            const touch = e.changedTouches[i];
            InputInternal.onTouchMove(touch.clientX - rc.left, touch.clientY - rc.top, 0);
            break;
        }
    }

    export function onKeyDown(e: KeyboardEvent) {
        const keyChangedInfo = InputInternal.keyChangedInfo;
        if (Private.keysDown.has(e.keyCode)) {
            // Ignore repeat key down events
            return;
        }
        keyChangedInfo.pressed = true;
        keyChangedInfo.keyCode = e.keyCode;
        Private.keysDown.set(e.keyCode, true);
        Input.keyChanged.post(keyChangedInfo);
    }

    export function onKeyUp(e: KeyboardEvent) {
        const keyChangedInfo = InputInternal.keyChangedInfo;
        keyChangedInfo.pressed = false;
        keyChangedInfo.keyCode = e.keyCode;
        Private.keysDown.delete(e.keyCode);
        Input.keyChanged.post(keyChangedInfo);
    }
}

/**
 * @hidden
 */
export namespace EngineInternal {

    export const targetCanvas = () => Private.targetCanvas;

    export function initializeWithCanvas(canvas: HTMLCanvasElement) {
        const contextOptions = { 
            alpha: EngineSettings.instance.canvasAlpha 
        };
        const context = canvas.getContext("webgl", contextOptions) || canvas.getContext("experimental-webgl", contextOptions);
        if (!context) {
            return Promise.reject(EngineError.WebGLContextCreationFailed);
        }

        WebGL.create(context as WebGLRenderingContext);
        GamepadsInternal.initialize();

        if (process.env.CONFIG !== "editor") {
            // tslint:disable-next-line
            const isMobile = "isMobile" in window ? (window as any).isMobile.any : false;
            if (isMobile) {
                window.addEventListener("touchstart", EngineHandlersInternal.onTouchStart);
                window.addEventListener("touchend", EngineHandlersInternal.onTouchEnd);
                window.addEventListener("touchcancel", EngineHandlersInternal.onTouchCancel);
                window.addEventListener("touchmove", EngineHandlersInternal.onTouchMove);
            } else {
                window.addEventListener("mousemove", EngineHandlersInternal.onMouseMove);
                window.addEventListener("mouseup", EngineHandlersInternal.onMouseUp);
                window.addEventListener("mousedown", EngineHandlersInternal.onMouseDown);
                window.addEventListener("wheel", EngineHandlersInternal.onMouseWheel, { passive: false });
            }
        }
        window.addEventListener("resize", EngineHandlersInternal.onWindowResized);
        window.addEventListener("keyup", EngineHandlersInternal.onKeyUp);
        window.addEventListener("keydown", EngineHandlersInternal.onKeyDown);
        return Promise.resolve();
    }
    
    export function unload() {
        GeometryProvider.unload(WebGL.context);
        ScenesInternal.destroy();
        IObjectManagerInternal.instance.clearCache();
        BehaviorErrors.clear();
    }

    export function reload() {
        unload();
        return EngineSettings.load()
            .then(() => DefaultAssetsInternal.load())
            .then(() => {
                if (!WebGL.context) {
                    return EngineInternal.initializeWithCanvas(Private.targetCanvas);
                } else {
                    return Promise.resolve();
                }
            });
    }

    export function flushPools() {
        Vector2.pool.flush();
        Vector3.pool.flush();
        Vector4.pool.flush();
        Matrix44.pool.flush();
        Matrix33.pool.flush();
        Plane.pool.flush();
        Quaternion.pool.flush();
        Triangle.pool.flush();
    }

    export function render(
        cameras: Camera[],
        preRender?: (camera: Camera) => void,
        postRender?: (camera: Camera) => void,
        uiPostRender?: () => void
    ) {
        if (Private.canvasResized) {
            cameras.forEach(camera => camera.invalidateFrustum());
            Private.canvasResized = false;
        }

        for (const scene of ScenesInternal.list()) {
            RendererInternal.render(
                scene.environment, 
                cameras, 
                preRender, 
                postRender, 
                uiPostRender
            );
        }
    }

    export function updateFrame() {
        if (!Private.engineActive) {
            return;
        }

        Private.loadingInProgress = AssetsInternal.updateLoading();

        if (!DefaultAssetsInternal.isLoaded()) {
            Private.loadingInProgress = true;
            requestAnimationFrame(() => updateFrame());
            return;
        }

        ScenesInternal.updateTransition();
        TimeInternal.updateDeltaTime();
        EngineInternal.flushPools();

        const scenes = ScenesInternal.list();
        if (scenes.length === 0) {
            // tslint:disable-next-line
            WebGL.context.clear(WebGL.context.COLOR_BUFFER_BIT | WebGL.context.DEPTH_BUFFER_BIT);
            requestAnimationFrame(() => updateFrame());
            return;
        }

        if (!scenes.every(s => s.isLoaded())) {
            Private.loadingInProgress = true;
            requestAnimationFrame(() => updateFrame());
            return;
        }

        Private.loadingInProgress = false;
        UpdateInternal.update();

        const cameras = Components.ofType(Camera);
        cameras.sort((a, b) => a.priority - b.priority);
        render(cameras);

        requestAnimationFrame(() => updateFrame());
    }
}

export class Engine {
    /**
     * Create an engine instance
     * Only one instance is allowed per window. If you need multiple instances, use iframes.
     * @param config - the engine configuration
     */
    static create(config: EngineConfig) {
        Debug.log(`SpiderEngine creation - Platform: ${process.env.PLATFORM}, Config: ${process.env.CONFIG}, Env: ${process.env.NODE_ENV}`);
        Private.engineConfig = config;

        ObjectManagerInternal.create();
        FactoryInternal.create(config.customTypes);
        SerializerInternal.create();
        EntityUtilsInternal.create();

        if (config.container) {
            Private.targetCanvas = config.container;
            RendererInternal.create(Private.targetCanvas);
            InputInternal.create(function () {
                const { left, top, width, height } = Private.targetCanvas.getBoundingClientRect();
                return new Vector2(
                    config.initialTouchPosition ? (config.initialTouchPosition.x - left) : (width / 2),
                    config.initialTouchPosition ? (config.initialTouchPosition.y - top) : (height / 2)
                );
            }());
        }

        const tryInitializeWithCanvas = () => {
            if (Private.targetCanvas) {
                return Promise.resolve()
                    .then(() => {
                        if (process.env.CONFIG === "editor") {
                            return AssetIdDatabaseInternal.load();
                        } else {
                            return Promise.resolve();
                        }
                    })
                    .then(() => EngineSettings.load())
                    .then(() => EngineInternal.initializeWithCanvas(Private.targetCanvas));
            } else {
                // Headless engine, with no canvas
                // This is most likely the secondary editor that needs the object model to edit assets
                if (process.env.CONFIG === "editor") {
                    return AssetIdDatabaseInternal.load();
                } else {
                    return Promise.resolve();
                }                
            }
        };

        if (process.env.CONFIG === "editor") {            
            return Private.createFileInterface()
                .then(() => tryInitializeWithCanvas())
                .then(() => FoldersInternal.load())
                .then(() => AssetIdDatabaseInternal.loadExternalIds())
                .then(() => SavedDataInternal.preload())
                .then(() => {
                    Private.engineActive = true;
                })
                .catch(error => {
                    Private.engineActive = false;                    
                    return Promise.reject(error);
                });
        } else {
            return Private.createFileInterface()
                .then(() => {
                    if (config.startupUrl) {
                        return Private.downloadPlayableProject(config.startupUrl);
                    } else {
                        return Promise.resolve();
                    }
                })
                .then(() => tryInitializeWithCanvas())
                .then(() => SavedDataInternal.preload())
                .then(() => DefaultAssetsInternal.load())
                .then(() => {
                    if (Private.targetCanvas) {
                        Private.engineActive = true;
                        EngineInternal.updateFrame();
                        const startupScene = config.startupScene || EngineSettings.instance.startupScene;
                        if (startupScene) {
                            return Scenes.load(startupScene);
                        }
                    }
                    return Promise.resolve(null);
                })
                .then(scene => {
                    if (scene) {
                        if (config.onSceneLoaded) {
                            config.onSceneLoaded(scene.templatePath as string);
                        }
                    }
                })
                .catch(error => {
                    Private.engineActive = false;
                    return Promise.reject(error);
                });
        }
    }

    static destroy() {
        if (!Private.engineActive) {
            return;
        }

        Debug.log(`SpiderEngine destruction`);
        Private.engineActive = false;
        WebUtils.downloadProgressChanged.detach(Private.onDownloadProgressChanged);

        if (Private.playRequestId) {
            WebUtils.abortRequest(Private.playRequestId);
            Private.playRequestId = null;
        }

        if (Private.engineConfig.container) {
            GamepadsInternal.destroy();
            if (process.env.CONFIG !== "editor") {
                // tslint:disable-next-line
                const isMobile = "isMobile" in window ? (window as any).isMobile.any : false;
                if (isMobile) {
                    window.removeEventListener("touchstart", EngineHandlersInternal.onTouchStart);
                    window.removeEventListener("touchend", EngineHandlersInternal.onTouchEnd);
                    window.removeEventListener("touchcancel", EngineHandlersInternal.onTouchCancel);
                    window.removeEventListener("touchmove", EngineHandlersInternal.onTouchMove);
                } else {
                    window.removeEventListener("mousemove", EngineHandlersInternal.onMouseMove);
                    window.removeEventListener("mouseup", EngineHandlersInternal.onMouseUp);
                    window.removeEventListener("mousedown", EngineHandlersInternal.onMouseDown);
                    window.removeEventListener("wheel", EngineHandlersInternal.onMouseWheel);
                }
            }

            window.removeEventListener("resize", EngineHandlersInternal.onWindowResized);
            window.removeEventListener("keyup", EngineHandlersInternal.onKeyUp);
            window.removeEventListener("keydown", EngineHandlersInternal.onKeyDown);
            EngineInternal.unload();
        }        
    }

    static isLoadingInProgress() {
        return Private.loadingInProgress;
    }
}
