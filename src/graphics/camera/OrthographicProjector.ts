
import * as Attributes from "../../core/Attributes";
import { Projector } from "./Projector";
import { Transform } from "../../core/Transform";
import { SerializedObject } from "../../core/SerializableObject";
import { Matrix44 } from "../../math/Matrix44";
import { graphicSettings } from "../GraphicSettings";

export class OrthographicProjector extends Projector {    
    
    get version() { return 2; }
    
    get size() { return this._size; }

    set size(size: number) {
        this._size = size;
        this.changed.post();
    }

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
        graphicSettings.shadowCascadeEdges.forEach((edge, index) => {
            this._frustum.splits[index].update(
                w, 
                h, 
                w, 
                h, 
                this._zNear + (index > 0 ? graphicSettings.shadowCascadeEdges[index - 1] : 0), 
                this._zNear + edge, 
                transform
            );
        });
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
