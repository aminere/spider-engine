import { Component } from "../core/Component";
import { SerializableObject } from "../core/SerializableObject";
import { VisualGroup } from "./VisualGroup";
import { Camera } from "./camera/Camera";
import { RenderTarget } from "./texture/RenderTarget";
export declare class CaptureMode extends SerializableObject {
}
export declare class CaptureOnce extends CaptureMode {
    captured: boolean;
}
export declare class CaptureByFrequency extends CaptureMode {
    frequency: number;
    timer: number;
}
export declare class ReflectionProbe extends Component {
    get renderTarget(): RenderTarget | null;
    private _resolution;
    private _radius;
    private _filter;
    private _captureMode;
    private _captureRig;
    private _renderTarget;
    canRenderGroup(group: VisualGroup | null): boolean;
    canCapture(): boolean;
    tick(): void;
    traverseCameras(handler: (camera: Camera) => void): void;
    getCameraIndex(camera: Camera): number;
    private getCaptureRig;
}
