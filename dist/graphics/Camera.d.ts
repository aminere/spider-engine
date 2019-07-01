import { Projector } from "./Projector";
import { Matrix44 } from "../math/Matrix44";
import { Entity } from "../core/Entity";
import { Vector3 } from "../math/Vector3";
import { RenderTarget } from "./RenderTarget";
import { VisualGroup } from "./VisualGroup";
import { PostEffects } from "./postfx/PostEffects";
import { SerializedObject } from "../core/SerializableObject";
import { Ray } from "../math/Ray";
import { Frustum } from "./Frustum";
import { Component } from "../core/Component";
import { ObjectProps } from "../core/Types";
export declare enum CameraClear {
    Environment = 0,
    None = 1
}
/**
 * @hidden
 */
export declare class CameraClearMetadata {
    static literals: {
        Environment: number;
        None: number;
    };
}
export declare class Camera extends Component {
    readonly version: number;
    projector: Projector | undefined;
    readonly clearValue: CameraClear;
    readonly postEffects: PostEffects | undefined;
    renderTarget: RenderTarget | null;
    readonly priority: number;
    readonly sceneRenderTarget: RenderTarget;
    readonly frustum: Frustum | null;
    excludedGroups: VisualGroup[];
    includedGroups: VisualGroup[];
    private _projector;
    private _clearValue;
    private _priority;
    private _excludedGroups;
    private _includedGroups;
    private _renderTarget;
    private _postEffects;
    private _sceneRenderTarget?;
    private _viewMatrix;
    private _viewMatrixDirty;
    private _invalidFrustum;
    constructor(props?: ObjectProps<Camera>);
    setEntity(entity: Entity): void;
    destroy(): void;
    canRenderGroup(groupId?: string): boolean;
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
