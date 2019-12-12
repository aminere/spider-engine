
import { Matrix44 } from "../math/Matrix44";
import { SerializableObject } from "../core/SerializableObject";
import { Transform } from "../core/Transform";
import * as Attributes from "../core/Attributes";
import { Frustum } from "./Frustum";
import { VoidSyncEvent } from "ts-events";
import { IFrustum } from "./IFrustum";
import { EngineSettings } from "../core/EngineSettings";

export class Projector extends SerializableObject {
    
    get frustum() { 
        return this._frustum;
    }
    
    @Attributes.unserializable()
    changed = new VoidSyncEvent();

    zNear: number = 0.2;
    zFar: number = 1000.0;

    @Attributes.unserializable()
    protected _frustum: IFrustum = {
        full: new Frustum(),
        splits: Array.from(new Array(EngineSettings.instance.maxShadowCascades)).map(f => new Frustum())
    };

    getProjectionMatrix() { 
        return Matrix44.identity; 
    }

    updateFrustum(transform: Transform, widthToHeightRatio: number) {
    }
}
