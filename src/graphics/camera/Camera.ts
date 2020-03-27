
import { Reference } from "../../serialization/Reference";
import { Projector } from "./Projector";
import { Matrix44 } from "../../math/Matrix44";
import { Entity } from "../../core/Entity";
import { Vector3 } from "../../math/Vector3";
import { AssetReference, AssetChangedEvent } from "../../serialization/AssetReference";
import { RenderTarget } from "../texture/RenderTarget";
import { VisualGroup } from "../VisualGroup";
import { MathEx } from "../../math/MathEx";
import { PerspectiveProjector } from "./PerspectiveProjector";
import { PostEffects } from "../postfx/PostEffects";
import { Size, SizeType } from "../../core/Size";
import * as Attributes from "../../core/Attributes";
import { SerializedObject } from "../../core/SerializableObject";
import { Ray } from "../../math/Ray";
import { Vector2 } from "../../math/Vector2";
import { Vector4 } from "../../math/Vector4";
import { OrthographicProjector } from "./OrthographicProjector";
import { Component } from "../../core/Component";
import { Interfaces } from "../../core/Interfaces";
import { Transform } from "../../core/Transform";
import { ObjectProps } from "../../core/Types";
import { VisualFilter } from "../VisualFilter";
import { IFrustum } from "./IFrustum";

export enum CameraClear {
    Environment,
    None
}

namespace Private {
    export const projectorProperty = "_projector";
}

@Attributes.helpUrl("https://docs.spiderengine.io/3d/camera.html")
export class Camera extends Component {    
    
    get version() { return 3; }

    set projector(projector: Projector) {
        let oldProjector = this._projector.instance;
        if (oldProjector) {
            oldProjector.changed.detach(this.onProjectorChanged);
        }
        this._projector.instance = projector;
        projector.changed.attach(this.onProjectorChanged);
        if (this.entity) {
            this.updateFrustum();
        }
    }
    get projector() { return this._projector.instance as Projector; }
    get clearValue() { return this._clearValue; }
    get postEffects() { return this._postEffects.instance; }
    get renderTarget() { return this._renderTarget.asset; }
    get priority() { return this._priority; }

    get sceneRenderTarget() {
        if (!this._sceneRenderTarget) {
            let actualSize = Vector2.fromPool().copy(Interfaces.renderer.screenSize);
            let renderTarget = this.renderTarget;
            if (renderTarget) {
                actualSize.x = renderTarget.getWidth();
                actualSize.y = renderTarget.getHeight();
            }
            let width = new Size(SizeType.Absolute, actualSize.x);
            let height = new Size(SizeType.Absolute, actualSize.y);
            this._sceneRenderTarget = new RenderTarget(width, height, false, false);
        }
        return this._sceneRenderTarget;
    }

    get frustum(): IFrustum { 
        const projector = this.projector;
        if (this._invalidFrustum) {
            this.updateFrustum();
        }
        return projector.frustum;
    }

    set renderTarget(renderTarget: RenderTarget | null) {
        this._renderTarget.asset = renderTarget;
    }    

    set filter(filter: VisualFilter) {
        this._filter.instance = filter;
    }

    @Attributes.nullable(false)
    private _projector = new Reference(Projector);

    @Attributes.enumLiterals(CameraClear)
    private _clearValue = CameraClear.Environment;

    private _priority = 0;
    private _filter = new Reference(VisualFilter);
    private _renderTarget = new AssetReference(RenderTarget);
    private _postEffects = new Reference(PostEffects);

    @Attributes.unserializable()
    private _sceneRenderTarget?: RenderTarget;

    @Attributes.unserializable()
    private _viewMatrix = new Matrix44();

    @Attributes.unserializable()
    private _viewMatrixDirty = true;
    
    @Attributes.unserializable()
    private _invalidFrustum = true;

    constructor(props?: ObjectProps<Camera>) {
        super();
        if (props) {
            this.setState(props);
        }
        this.onTransformChanged = this.onTransformChanged.bind(this);
        this.onProjectorChanged = this.onProjectorChanged.bind(this);     
        this.onRenderTargetChanged = this.onRenderTargetChanged.bind(this);
        this.onRenderTargetSizeChanged = this.onRenderTargetSizeChanged.bind(this);
        this._renderTarget.assetChanged.attach(this.onRenderTargetChanged);
        if (!this.projector) {
            this.projector = new PerspectiveProjector();
        }
    }    

    setEntity(entity: Entity) {
        super.setEntity(entity);
        entity.getOrSetComponent(Transform).changed.attach(this.onTransformChanged);

        const projector = this.projector;
        if (projector && projector.changed.listenerCount() === 0) {
            projector.changed.attach(this.onProjectorChanged);
        }

        this.updateFrustum();
    }  
    
    destroy() {
        if (this._filter.instance) {
            this._filter.instance.detach();
        }        
        this._renderTarget.detach();
        if (this._sceneRenderTarget) {
            this._sceneRenderTarget.destroy();
        }
        let postEffects = this.postEffects;
        if (postEffects) {
            postEffects.destroy();
        }

        let transform = this.entity.transform;
        if (transform) {
            transform.changed.detach(this.onTransformChanged);
        }

        super.destroy();
    }

    canRenderGroup(group: VisualGroup | null) {
        return this._filter.instance?.canRender(group) ?? true;        
    }

    getProjectionMatrix() {
        let projector = this.projector;
        if (projector) {
            if (this._invalidFrustum) {
                this.updateFrustum();
            }
            return projector.getProjectionMatrix();
        }
        return Matrix44.identity;
    }

    getViewMatrix() {
        if (this._viewMatrixDirty) {
            this._viewMatrix.copy(this.entity.transform.worldMatrix);
            this._viewMatrix.invert();
            this._viewMatrixDirty = true;
        }
        return this._viewMatrix;
    }

    getWorldRay(screenX: number, screenY: number) {
        let projector = this.projector;
        if (!projector) {
            return null;
        }

        let screenW: number;
        let screenH: number;
        let renderTarget = this.renderTarget;
        if (renderTarget && renderTarget.valid) {
            screenW = renderTarget.getWidth();
            screenH = renderTarget.getHeight();
        } else {
            const size = Interfaces.renderer.screenSize;
            screenW = size.x;
            screenH = size.y;
        }
        if (projector.isA(PerspectiveProjector)) {
            let perspective = projector as PerspectiveProjector;
            return Ray.dummy.setFromPerspectiveView(
                perspective.fov * MathEx.degreesToRadians,                
                this.entity.transform.worldMatrix,
                screenX, 
                screenY,
                screenW,
                screenH
            );
        } else if (projector.isA(OrthographicProjector)) {
            let orth = projector as OrthographicProjector;
            return Ray.dummy.setFromOrthographicView(
                orth.size,
                this.entity.transform.worldMatrix,
                screenX, 
                screenY,
                screenW,
                screenH
            );
        } else {
            return null;
        }        
    }

    // view position in normalized device space - [-1, 1] range
    getViewPosition(worldPosition: Vector3, viewPositionOut: Vector3) {        
        let projectionView = Matrix44.fromPool().copy(this.getProjectionMatrix()).multiply(this.getViewMatrix());
        let clipPosition = Vector4.fromPool().set(worldPosition.x, worldPosition.y, worldPosition.z, 1).transform(projectionView);
        if (clipPosition.w <= 0) {
            // position is outside the screen
            return false;
        }
        viewPositionOut.set(clipPosition.x / clipPosition.w, clipPosition.y / clipPosition.w, clipPosition.z / clipPosition.w);
        return true;
    }

    getScreenPosition(worldPosition: Vector3, screenPositionOut: Vector3) {
        if (this.getViewPosition(worldPosition, screenPositionOut)) {
            // convert to screen space
            const { screenSize } = Interfaces.renderer;
            screenPositionOut.x = screenSize.x * ((screenPositionOut.x + 1) * .5);
            screenPositionOut.y = screenSize.y * ((-screenPositionOut.y + 1) * .5);
            return true;
        }
        return false;
    }

    setupFrame() {
        this._viewMatrixDirty = true;        
    }    
    
    // tslint:disable-next-line
    setProperty(property: string, value: any) {
        if (property === Private.projectorProperty) {
            this.projector = (value as Reference<Projector>).instance as Projector;
        } else {
            super.setProperty(property, value);
        }
    }
    
    upgrade(json: SerializedObject, previousVersion: number) {
        if (previousVersion === 1) {
            let upgraded = {
                _projector: json.properties.projector,
                _clearValue: json.properties.clear,
                _excludedGroups: json.properties.excludedGroups,
                _includedGroups: json.properties.includedGroups,
                _renderTarget: json.properties.renderTarget,
                _priority: json.properties.priority
            };
            Object.assign(json.properties, upgraded);
            delete json.properties.projector;
            delete json.properties.clear;
            delete json.properties.excludedGroups;
            delete json.properties.includedGroups;
            delete json.properties.renderTarget;
            delete json.properties.priority;
        } else if (previousVersion === 2) {
            // tslint:disable-next-line
            const excludedIds = json.properties._excludedGroups.data.map((g: any) => g.id).filter(Boolean);
            // tslint:disable-next-line
            const includedIds = json.properties._includedGroups.data.map((g: any) => g.id).filter(Boolean);            
            if (excludedIds.length > 0 || includedIds.length > 0) {
                let filter = "ExclusionVisualFilter";
                let ids = excludedIds;
                let key = "_excluded";
                if (excludedIds.length === 0) {
                    filter = "InclusionVisualFilter";
                    ids = includedIds;
                    key = "_included";
                }
                Object.assign(json.properties, {
                    _filter: {
                        baseTypeName: "VisualFilter",
                        data: {
                            typeName: filter,
                            version: 1,
                            properties: {
                                [key]: {
                                    typeName: "VisualGroup",
                                    data: ids.map((i: string) => ({
                                        typeName: "VisualGroup",
                                        id: i
                                    }))
                                }
                            }
                        }
                    }
                });
            }
            delete json.properties._excludedGroups;
            delete json.properties._includedGroups;
        }
        return json;
    }

    invalidateFrustum() {
        this._invalidFrustum = true;
    }

    private updateFrustum() {
        const projector = this.projector;
        if (!projector) {
            return;
        }
        this._invalidFrustum = true;
        if (this._renderTarget.id || this._renderTarget.asset) {
            const renderTarget = this.renderTarget;
            if (renderTarget && renderTarget.valid) {
                const ratio = renderTarget.getWidth() / renderTarget.getHeight();
                projector.updateFrustum(this.entity.transform, ratio);
                this._invalidFrustum = false;
            }
        } else {
            const { screenSize: size } = Interfaces.renderer;
            const ratio = size.x / size.y;
            projector.updateFrustum(this.entity.transform, ratio);
            this._invalidFrustum = false;
        }
    }

    private onRenderTargetChanged(info: AssetChangedEvent) {
        if (info.oldAsset) {
            (info.oldAsset as RenderTarget).sizeChanged.detach(this.onRenderTargetSizeChanged);
        }
        if (info.newAsset) {
            (info.newAsset as RenderTarget).sizeChanged.attach(this.onRenderTargetSizeChanged);
        }
        this.invalidateFrustum();
    }

    private onTransformChanged() {
        this.invalidateFrustum();
    }

    private onProjectorChanged() {
        this.invalidateFrustum();
    }

    private onRenderTargetSizeChanged() {
        this.invalidateFrustum();
    }
}
