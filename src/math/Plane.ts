
import { Vector3 } from "./Vector3";
import { ObjectPool } from "../core/ObjectPool";

export enum PlaneClassification {
    Front,
    Back,
    Planar
}

export class Plane {    

    static pool = new ObjectPool(Plane, 64);

    normal = new Vector3().copy(Vector3.up);
    distFromOrigin = 0;

    static fromPool() {
        return Plane.pool.get();
    }

    constructor(normal?: Vector3, distFromOrigin?: number) {
        this.normal = normal || new Vector3().copy(Vector3.up);
        this.distFromOrigin = distFromOrigin || 0;
    }

    set(normal: Vector3, distFromOrigin: number) {
        this.normal.copy(normal);
        this.distFromOrigin = distFromOrigin;
        return this;
    }

    setFromPoint(normal: Vector3, point: Vector3) {
        this.normal.copy(normal);
        this.distFromOrigin = point.dot(normal);
        return this;
    }

    setFromPoints(v1: Vector3, v2: Vector3, v3: Vector3) {
        let v1MinusV2 = Vector3.dummy;
        v1MinusV2.substractVectors(v1, v2);
        this.normal.copy(v3).substract(v1).cross(v1MinusV2).normalize();
        return this.setFromPoint(this.normal, v1);
    }

    copy(other: Plane) {
        this.normal.copy(other.normal);
        this.distFromOrigin = other.distFromOrigin;
    }   

    classifyPoint(v: Vector3) {        
        let nominator = this.normal.dot(v) - this.distFromOrigin;
        if (nominator > 0.000001) {
            return PlaneClassification.Front;
        } else if (nominator < -0.000001) {
            return PlaneClassification.Back;
        } else {
            return PlaneClassification.Planar;
        }   
    }

    // returns the signed distance from a point to this plane
    getSignedDistance(v: Vector3) {
        return v.dot(this.normal) - this.distFromOrigin;
    }
}