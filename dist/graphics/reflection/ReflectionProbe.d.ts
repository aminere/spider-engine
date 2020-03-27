import { Component } from "../../core/Component";
import { VisualGroup } from "../VisualGroup";
import { Camera } from "../camera/Camera";
import { RenderTarget } from "../texture/RenderTarget";
export declare class ReflectionProbe extends Component {
    get renderTarget(): RenderTarget | null;
    private _resolution;
    private _radius;
    private _filter;
    private _captureMode;
    private _captureRig;
    private _renderTarget;
    canRenderGroup(group: VisualGroup | null): boolean;
    canCapture(): boolean | undefined;
    tick(): void;
    traverseCameras(handler: (camera: Camera) => void): void;
    getCameraIndex(camera: Camera): number;
    private getCaptureRig;
}
