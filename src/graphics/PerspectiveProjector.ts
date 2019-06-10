
import * as Attributes from "../core/Attributes";

import { Projector } from "./Projector";
import { Transform } from "../core/Transform";
import { MathEx } from "../math/MathEx";
import { SerializedObject } from "../core/SerializableObject";
import { Matrix44 } from "../math/Matrix44";

export class PerspectiveProjector extends Projector {
    
    get version() { return 2; }

    get fov() { return this._fov; }
    get zNear() { return this._zNear; }
    get zFar() { return this._zFar; }
    
    set fov(fov: number) {
        this._fov = fov;
        this.changed.post();
    }
    set zNear(zNear: number) {
        this._zNear = zNear;
        this.changed.post();
    }
    set zFar(zFar: number) {
        this._zFar = zFar;
        this.changed.post();
    }

    private _fov = 60;
    private _zNear = .1;
    private _zFar = 1000;

    @Attributes.unserializable()
    private _projectionMatrix = new Matrix44();

    getProjectionMatrix() { 
        return this._projectionMatrix; 
    }
    
    updateFrustum(transform: Transform, ratio: number) {
        let fovRadians = MathEx.toRadians(this._fov);
        this._projectionMatrix.makePerspectiveProjection(fovRadians, ratio, this._zNear, this._zFar);

        let fovBy2 = fovRadians / 2;
        let Hnear = Math.tan(fovBy2) * this.zNear;
        let Wnear = Hnear * ratio;
        let Hfar = Math.tan(fovBy2) * this.zFar;
        let Wfar = Hfar * ratio;
        this._frustum.update(
            Wnear,
            Hnear,
            Wfar,
            Hfar,
            this.zNear,
            this.zFar,
            transform
        );        
    }        
    
    upgrade(json: SerializedObject, previousVersion: number) {
        if (previousVersion === 1) {
            Object.assign(json.properties, { 
                _zNear: json.properties.zNear,
                _zFar: json.properties.zFar,
                _fov: json.properties.fov
            });
            delete json.properties.zNear;
            delete json.properties.zFar;
            delete json.properties.fov;
        }
        return json;
    }
}
