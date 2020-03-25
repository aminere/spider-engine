import { TypeDefinition } from "../serialization/Factory";
import { Vector2 } from "../math/Vector2";
import { IFile } from "../io/File/IFile";
import { Camera } from "../graphics/camera/Camera";
import { SerializableObject } from "./SerializableObject";
import { Component } from "./Component";
export interface IEngineConfig {
    container?: HTMLCanvasElement;
    startupScene?: string;
    startupUrl?: string;
    projectId?: string;
    customTypes?: TypeDefinition<SerializableObject>[];
    initialTouchPosition?: Vector2;
    customFileIO?: IFile;
    preRender?: (camera: Camera) => void;
    postRender?: (camera: Camera) => void;
    uiPostRender?: () => void;
    onSceneLoaded?: (path: string) => void;
    onDownloadProgress?: (amount: number, finished: boolean) => void;
}
/**
 * @hidden
 */
export declare namespace EngineHandlersInternal {
    function onWindowResized(): void;
    function onMouseDown(e: MouseEvent): void;
    function onMouseWheel(e: WheelEvent): void;
    function onMouseMove(e: MouseEvent): void;
    function onMouseUp(e: MouseEvent): void;
    function onTouchStart(e: TouchEvent): void;
    function onTouchEnd(e: TouchEvent): void;
    function onTouchCancel(e: TouchEvent): void;
    function onTouchMove(e: TouchEvent): void;
    function onKeyDown(e: KeyboardEvent): void;
    function onKeyUp(e: KeyboardEvent): void;
}
/**
 * @hidden
 */
export declare namespace EngineInternal {
    const targetCanvas: () => HTMLCanvasElement;
    function initializeWithCanvas(canvas: HTMLCanvasElement): Promise<void>;
    function unload(): void;
    function reload(): Promise<void>;
    function flushPools(): void;
    function render(cameras: Camera[], renderables: {
        [typeName: string]: Component[];
    }, preRender?: (camera: Camera) => void, postRender?: (camera: Camera) => void, uiPostRender?: () => void): void;
    function updateFrame(): void;
}
export declare class Engine {
    /**
     * Create an engine instance
     * Only one instance is allowed per window. If you need multiple instances, use iframes.
     * @param config - the engine configuration
     */
    static create(config: IEngineConfig): Promise<void>;
    static destroy(): void;
    static isLoadingInProgress(): boolean;
}
