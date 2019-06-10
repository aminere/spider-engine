
import { Vector3 } from "./Vector3";
import { Matrix44 } from "./Matrix44";
import { MathEx } from "./MathEx";
import { AABB } from "./AABB";
import { Plane, PlaneClassification } from "./Plane";
import { Basis } from "./Basis";

export class RayPlaneCollisionResult {
    intersection!: Vector3 | null;
    classification!: PlaneClassification;
}

export class RayAABBCollisionResult {
    intersection1 = new Vector3();
    intersection2 = new Vector3();
    normal1 = new Vector3();
    normal2 = new Vector3();
}

export class RaySphereCollisionResult extends RayAABBCollisionResult { }

namespace Private {
    export let dummy = new Vector3();
    export let dummy2 = new Vector3();
    export let rayAABBResult = new RayAABBCollisionResult();
    export let raySphereResult = new RaySphereCollisionResult();
    export let rayPlaneResult = new RayPlaneCollisionResult();
    export let basis = new Basis();    
}

export class Ray {

    static dummy = new Ray();

    get origin() { return this._origin; }
    get direction() { return this._direction; }

    get destination() {
        if (!this._destination) {
            this._destination = new Vector3()
                .copy(this._direction)
                .multiply(this._length)
                .add(this._origin);
        }
        return this._destination;
    }

    get length() {
        return this._length;
    }

    set origin(start: Vector3) {
        this._origin.copy(start);
        delete this._destination;
    }

    set direction(direction: Vector3) {
        this._direction.copy(direction);
        delete this._destination;
    }

    set length(length: number) {
        if (length !== this._length) {
            this._length = length;
            delete this._destination;
        }
    }

    private _origin: Vector3;
    private _direction: Vector3;
    private _destination!: Vector3;
    private _length: number;

    static fromPerspectiveView(
        fovRadians: number,
        inverseView: Matrix44, 
        viewX: number,
        viewY: number,
        viewW: number,
        viewH: number
    ) {
        return new Ray().setFromPerspectiveView(fovRadians, inverseView, viewX, viewY, viewW, viewH);
    }

    static fromOrthographicView(
        orthoSizeY: number,
        inverseView: Matrix44, 
        viewX: number,
        viewY: number,
        viewW: number,
        viewH: number
    ) {
        return new Ray().setFromOrthographicView(orthoSizeY, inverseView, viewX, viewY, viewW, viewH);
    }

    constructor(origin?: Vector3, direction?: Vector3, length?: number) {
        this._origin = origin || new Vector3();
        this._direction = direction || new Vector3().copy(Vector3.forward);
        this._length = length || 999999;
    }

    set(origin: Vector3, direction: Vector3, length?: number) {
        this._origin.copy(origin);
        this._direction.copy(direction);
        if (length !== undefined) {
            this._length = length;
        }
    }

    copy(other: Ray) {
        this._origin.copy(other.origin);
        this._direction.copy(other.direction);
        this._length = other.length;
        delete this._destination;
        return this;
    }

    transform(matrix: Matrix44) {
        this._origin.transform(matrix);
        this._direction.transformDirection(matrix);
        delete this._destination;
    }    

    setFromPerspectiveView(
        fovRadians: number,
        inverseView: Matrix44, 
        viewX: number,
        viewY: number,
        viewW: number,
        viewH: number
    ) {
        const screenRatio = viewW / viewH;
        const d = 1 / Math.tan(fovRadians / 2);
        let vx = (((2.0 * viewX) / viewW) - 1) / (d / screenRatio);
        let vy = -(((2.0 * viewY) / viewH) - 1) / (d);
        // Flip for LH projection
        let vz = -1;
        let m = inverseView.data;
        this.direction.x = vx * m[0] + vy * m[4] + vz * m[8];
        this.direction.y = vx * m[1] + vy * m[5] + vz * m[9];
        this.direction.z = vx * m[2] + vy * m[6] + vz * m[10];
        this.direction.normalize();
        this.origin.setFromMatrix(inverseView);
        return this;
    }

    setFromOrthographicView(
        orthoSizeY: number,
        inverseView: Matrix44,
        viewX: number,
        viewY: number,
        viewW: number,
        viewH: number
    ) {
        // convert from [0, screenH - 1] to [0, 1]
        const yNormalized = viewY / (viewH - 1);
        // convert from [0, 1] to [orthoSizeY, -orthoSizeY]
        const y = ((1 - yNormalized) * (2 * orthoSizeY)) - orthoSizeY;

        const orthoSizeX = (viewW * orthoSizeY) / viewH;
        // convert from [0, screenW - 1] to [0, 1]
        const xNormalized = viewX / (viewW - 1);
        // convert from [0, 1] to [-orthoSizeX, orthoSizeX]
        const x = (xNormalized * (2 * orthoSizeX)) - orthoSizeX;

        // determine origin and direction
        let { basis } = Private;
        basis.setFromMatrix(inverseView);
        this.origin
            .setFromMatrix(inverseView)
            .add(basis.right.multiply(x))
            .add(basis.up.multiply(y));

        // Flip for LH projection
        this.direction.copy(basis.forward).flip().normalize();
        return this;
    }

    castOnSphere(center: Vector3, radius: number) {
        // thanks to iq - http://www.iquilezles.org/www/articles/intersectors/intersectors.htm
        const { dummy, raySphereResult } = Private;
        const oc = dummy.substractVectors(this.origin, center);
        const b = oc.dot(this.direction);
        const c = oc.dot(oc) - radius * radius;
        let h = b * b - c;
        if (h < 0) {
           // no intersection
           return null;
        }
        h = Math.sqrt(h);
        const i1 = -b - h;
        const i2 = -b + h;
        let near = i1;
        let far = i2;
        if (i1 < 0) {
            if (i2 < 0) {
                // sphere is behind the ray
                return null;
            }
            near = i2;
            far = i1;
        }
        raySphereResult.intersection1.copy(this.direction).multiply(near).add(this.origin);
        raySphereResult.normal1.copy(raySphereResult.intersection1).substract(center).normalize();
        raySphereResult.intersection2.copy(this.direction).multiply(far).add(this.origin);
        raySphereResult.normal2.copy(raySphereResult.intersection2).substract(center).normalize();
        return raySphereResult;
    }

    castOnPlane(plane: Plane) {
        let { rayPlaneResult } = Private;
        let nominator = plane.normal.dot(this.origin) - plane.distFromOrigin;
        if (MathEx.isZero(nominator)) {
            rayPlaneResult.intersection = Vector3.dummy.copy(this.origin);
            rayPlaneResult.classification = PlaneClassification.Planar;
        } else {
            let denominator = plane.normal.dot(this.direction);
            if (MathEx.isZero(denominator)) {
                // ray direction is parallel to the plane
                rayPlaneResult.intersection = null;                
            } else {
                let toIntersection = -nominator / denominator;
                if (toIntersection < 0) {
                    // intersection is behind the ray origin
                    rayPlaneResult.intersection = null;
                } else {
                    rayPlaneResult.intersection = Vector3.dummy.copy(this.direction).multiply(toIntersection).add(this.origin);
                }                
            }
            rayPlaneResult.classification = nominator > 0 ? PlaneClassification.Front : PlaneClassification.Back;
        }
        return rayPlaneResult;
    }

    castOnAABB(aabb: AABB) {
        const { rayAABBResult, dummy, dummy2 } = Private;
        const t0 = Vector3.dummy.substractVectors(aabb.min, this.origin).divideVector(this.direction);
        const t1 = Vector3.dummy2.substractVectors(aabb.max, this.origin).divideVector(this.direction);
        const vmin = dummy.set(Math.min(t0.x, t1.x), Math.min(t0.y, t1.y), Math.min(t0.z, t1.z));
        const vmax = dummy2.set(Math.max(t0.x, t1.x), Math.max(t0.y, t1.y), Math.max(t0.z, t1.z));
        const tmin = vmin.max();
        const tmax = vmax.min();
        const intersects = tmax >= tmin;
        if (intersects) {
            let near = tmin;
            let far = tmax;
            if (tmin < 0) {
                if (tmax < 0) {
                    // box is behind the ray
                    return null;
                }
                near = tmax;
                far = tmin;
            }
            rayAABBResult.intersection1.copy(this.direction).multiply(near).add(this.origin);
            rayAABBResult.intersection2.copy(this.direction).multiply(far).add(this.origin);
            rayAABBResult.normal1.copy(this.getAABBNormal(aabb, rayAABBResult.intersection1));
            rayAABBResult.normal2.copy(this.getAABBNormal(aabb, rayAABBResult.intersection2));
            return rayAABBResult;
        } else {
            return null;
        }
    }

    private getAABBNormal(aabb: AABB, position: Vector3) {
        // determine the normal, TODO find a better way (ideally non-branching)
        const { x, y, z } = position;
        if (MathEx.isEqual(x, aabb.min.x)) {
            return Vector3.dummy.set(-1, 0, 0);
        } else if (MathEx.isEqual(x, aabb.max.x)) {
            return Vector3.dummy.set(1, 0, 0);
        } else if (MathEx.isEqual(y, aabb.min.y)) {
            return Vector3.dummy.set(0, -1, 0);
        } else if (MathEx.isEqual(y, aabb.max.y)) {
            return Vector3.dummy.set(0, 1, 0);
        } else if (MathEx.isEqual(z, aabb.min.z)) {
            return Vector3.dummy.set(0, 0, -1);
        } else if (MathEx.isEqual(z, aabb.max.z)) {
            return Vector3.dummy.set(0, 0, 1);
        } else {
            return Vector3.dummy.set(0, 1, 0);
        }
    }
}
