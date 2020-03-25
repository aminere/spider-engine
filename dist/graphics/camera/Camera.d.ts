import { Projector } from "./Projector";
import { Matrix44 } from "../../math/Matrix44";
import { Entity } from "../../core/Entity";
import { Vector3 } from "../../math/Vector3";
import { RenderTarget } from "../texture/RenderTarget";
import { VisualGroup } from "../VisualGroup";
import { PostEffects } from "../postfx/PostEffects";
import { SerializedObject } from "../../core/SerializableObject";
import { Ray } from "../../math/Ray";
import { Component } from "../../core/Component";
import { ObjectProps } from "../../core/Types";
import { VisualFilter } from "../VisualFilter";
import { IFrustum } from "./IFrustum";
export declare enum CameraClear {
    Environment = 0,
    None = 1
}
export declare class Camera extends Component {
    get version(): number;
    set projector(projector: Projector);
    get projector(): Projector;
    get clearValue(): CameraClear;
    get postEffects(): PostEffects | undefined;
    get renderTarget(): RenderTarget | null;
    get priority(): number;
    get sceneRenderTarget(): RenderTarget;
    get frustum(): IFrustum;
    set renderTarget(renderTarget: RenderTarget | null);
    set filter(filter: VisualFilter);
    private _projector;
    private _clearValue;
    private _priority;
    private _filter;
    private _renderTarget;
    private _postEffects;
    private _sceneRenderTarget?;
    private _viewMatrix;
    private _viewMatrixDirty;
    private _invalidFrustum;
    constructor(props?: ObjectProps<Camera>);
    setEntity(entity: Entity): void;
    destroy(): void;
    canRenderGroup(group: VisualGroup | null): boolean;
    getProjectionMatrix(): Matrix44;
    getViewMatrix(): Matrix44;
    getWorldRay(screenX: number, screenY: number): Ray | null;
    getViewPosition(worldPosition: Vector3, viewPositionOut: Vector3): boolean;
    getScreenPosition(worldPosition: Vector3, screenPositionOut: Vector3): boolean;
    setupFrame(): void;
    setProperty(property: string, value: any): void;
    upgrade(json: SerializedObject, previousVersion: number): SerializedObject;
    invalidateFrustum(): void;
    private updateFrustum;
    private onRenderTargetChanged;
    private onTransformChanged;
    private onProjectorChanged;
    private onRenderTargetSizeChanged;
}
