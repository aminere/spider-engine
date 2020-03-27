import { Component } from "../../core/Component";
import { Reference } from "../../serialization/Reference";
import * as Attributes from "../../core/Attributes";
import { Entity } from "../../core/Entity";
import { Entities } from "../../core/Entities";
import { defaultAssets } from "../../assets/DefaultAssets";
import { VisualFilter } from "../VisualFilter";
import { VisualGroup } from "../VisualGroup";
import { Camera } from "../camera/Camera";
import { PerspectiveProjector } from "../camera/PerspectiveProjector";
import { RenderTarget } from "../texture/RenderTarget";
import { Size, SizeType } from "../../core/Size";
import { CaptureMode, CaptureOnce, CaptureByFrequency } from "./CaptureMode";

export class ReflectionProbe extends Component {

    get renderTarget() { return this._renderTarget; }

    private _resolution = 512;
    private _radius = 100;
    private _filter = new Reference(VisualFilter);

    @Attributes.nullable(false)
    private _captureMode = new Reference(CaptureMode, new CaptureByFrequency());

    @Attributes.unserializable()
    private _captureRig: Entity | null = null;

    @Attributes.unserializable()
    private _renderTarget: RenderTarget | null = null;

    public canRenderGroup(group: VisualGroup | null) {
        return this._filter.instance?.canRender(group) ?? true;        
    }
    
    public canCapture() {
        return this._captureMode.instance?.canCapture();
    }        

    public tick() {
        this._captureMode.instance?.tick();
    }

    public traverseCameras(handler: (camera: Camera) => void) {
        this.getCaptureRig().children.forEach(c => {
            handler(c.getComponent(Camera) as Camera);
        });
    }

    public getCameraIndex(camera: Camera) {
        return this.getCaptureRig().children.findIndex(e => e.getComponent(Camera) === camera);
    }

    private getCaptureRig() {
        if (this._captureRig) {
            return this._captureRig;
        }

        this._captureRig = Entities.create({ prefab: defaultAssets.cubemapCaptureRig }) as Entity;
        this._captureRig.transient = true;
        
        const size = new Size(SizeType.Absolute, this._resolution);
        this._renderTarget = new RenderTarget(
            size,
            size,
            undefined,
            false,
            undefined,
            true
        );

        this._captureRig.children.forEach(c => {
            const camera = c.getComponent(Camera) as Camera;
            (camera.projector as PerspectiveProjector).zFar = this._radius;
            camera.renderTarget = this._renderTarget;
        });
        this.entity.addChild(this._captureRig);
        return this._captureRig;
    }
}
