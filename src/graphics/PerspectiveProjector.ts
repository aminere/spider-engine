
import * as Attributes from "../core/Attributes";

import { Projector } from "./Projector";
import { Transform } from "../core/Transform";
import { MathEx } from "../math/MathEx";
import { SerializedObject } from "../core/SerializableObject";
import { Matrix44 } from "../math/Matrix44";
import { Frustum } from "./Frustum";
import { EngineSettings } from "../core/EngineSettings";

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
    private _zFar = 800;

    @Attributes.unserializable()
    private _projectionMatrix = new Matrix44();

    getProjectionMatrix() { 
        return this._projectionMatrix; 
    }
    
    updateFrustum(transform: Transform, ratio: number) {
        const fovRadians = MathEx.toRadians(this._fov);
        this._projectionMatrix.makePerspectiveProjection(fovRadians, ratio, this._zNear, this._zFar);

        const fovBy2 = fovRadians / 2;
        const _update = (frustum: Frustum, near: number, far: number) => {
            const hNear = Math.tan(fovBy2) * near;
            const wNear = hNear * ratio;
            const hFar = Math.tan(fovBy2) * far;
            const wFar = hFar * ratio;
            frustum.update(wNear, hNear, wFar, hFar, near, far, transform);
        };

        // full frustum
        _update(this._frustum.full, this.zNear, this.zFar);
        
        // frustum splits
        let currentNear = this._zNear;
        const { maxShadowCascades, maxShadowDistance } = EngineSettings.instance;
        const actualShadowDistance = Math.min(maxShadowDistance, (this._zFar - this.zNear));
        const splitSize = actualShadowDistance / maxShadowCascades;
        for (let i = 0; i < maxShadowCascades; ++i) {
            _update(this._frustum.splits[i], currentNear, currentNear + splitSize);
            currentNear += splitSize;
        }
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
