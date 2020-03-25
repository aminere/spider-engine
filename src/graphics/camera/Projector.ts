
import { Matrix44 } from "../../math/Matrix44";
import { SerializableObject } from "../../core/SerializableObject";
import { Transform } from "../../core/Transform";
import * as Attributes from "../../core/Attributes";
import { Frustum } from "./Frustum";
import { VoidSyncEvent } from "ts-events";
import { IFrustum } from "./IFrustum";
import { graphicSettings } from "../GraphicSettings";

export class Projector extends SerializableObject {
    
    get frustum() { return this._frustum; }
    
    @Attributes.unserializable()
    changed = new VoidSyncEvent();

    get zNear() { return this._zNear; }
    get zFar() { return this._zFar; }
    
    set zNear(zNear: number) {
        this._zNear = zNear;
        this.changed.post();
    }
    set zFar(zFar: number) {
        this._zFar = zFar;
        this.changed.post();
    }

    protected _zNear = .1;
    protected _zFar = 800;

    @Attributes.unserializable()
    protected _frustum: IFrustum = {
        full: new Frustum(),
        splits: Array.from(new Array(graphicSettings.maxShadowCascades)).map(() => new Frustum())
    };

    getProjectionMatrix() { 
        return Matrix44.identity; 
    }

    updateFrustum(transform: Transform, widthToHeightRatio: number) {
    }
}
