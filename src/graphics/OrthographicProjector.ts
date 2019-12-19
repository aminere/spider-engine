
import * as Attributes from "../core/Attributes";
import { Projector } from "./Projector";
import { Transform } from "../core/Transform";
import { SerializedObject } from "../core/SerializableObject";
import { Matrix44 } from "../math/Matrix44";
import { GraphicSettings } from "./GraphicSettings";

export class OrthographicProjector extends Projector {    
    
    get version() { return 2; }
    
    get zNear() { return this._zNear; }
    get zFar() { return this._zFar; }
    get size() { return this._size; }

    set zNear(zNear: number) {
        this._zNear = zNear;
        this.changed.post();
    }
    set zFar(zFar: number) {
        this._zFar = zFar;
        this.changed.post();
    }
    set size(size: number) {
        this._size = size;
        this.changed.post();
    }

    private _zNear = .1;
    private _zFar = 1000;    
    private _size = 5;

    @Attributes.unserializable()
    private _projectionMatrix = new Matrix44();

    getProjectionMatrix() { 
        return this._projectionMatrix; 
    }

    updateFrustum(transform: Transform, ratio: number) {
        const dx = this._size * ratio;
        const dy = this._size;
        this._projectionMatrix.makeOrthoProjection(-dx, dx, dy, -dy, this._zNear, this._zFar);

        const w = this._size * ratio;
        const h = this._size;        
        
        // full frustum
        this._frustum.full.update(w, h, w, h, this._zNear, this._zFar, transform);

        // frustum splits
        const { shadowCascadeEdges } = GraphicSettings;
        this._frustum.splits[0].update(w, h, w, h, this._zNear, this._zNear + shadowCascadeEdges[0], transform);
        this._frustum.splits[1].update(w, h, w, h, this._zNear + shadowCascadeEdges[0], this._zNear + shadowCascadeEdges[1], transform);
        this._frustum.splits[2].update(w, h, w, h, this._zNear + shadowCascadeEdges[1], this._zNear + shadowCascadeEdges[2], transform);
        
    }
    
    upgrade(json: SerializedObject, previousVersion: number) {
        if (previousVersion === 1) {
            Object.assign(json.properties, { 
                _zNear: json.properties.zNear,
                _zFar: json.properties.zFar,
                _size: json.properties.size
            });
            delete json.properties.zNear;
            delete json.properties.zFar;
            delete json.properties.size;
        }
        return json;
    }
}
