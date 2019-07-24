
import { Vector3 } from "../math/Vector3";
import { BoxCollisionShape } from "./BoxCollisionShape";
import { SphereCollisionShape } from "./SphereCollisionShape";
import { VertexBuffer } from "../graphics/VertexBuffer";
import { Transform } from "../core/Transform";

namespace Private {
    export namespace boxIntersectsWithSphere {
        export let boxMin = new Vector3();
        export let boxMax = new Vector3();
    }

    export namespace boxIntersectsWithSphereShape {
        export let _sphereWorldPos = new Vector3();        
    }

    export namespace boxIntersectsWithBox {
        export let box1Min = new Vector3();
        export let box1Max = new Vector3();
        export let box2Min = new Vector3();
        export let box2Max = new Vector3();
    }

    export namespace sphereIntersectsWithSphereShape {
        export let _sphere1WorldPos = new Vector3();
        export let _sphere2WorldPos = new Vector3();
    }

    export function getBoxShapeMin(box: BoxCollisionShape, boxWorldPos: Vector3, out: Vector3) {
        return out.set(
            box.center.x - box.extent.x + boxWorldPos.x,
            box.center.y - box.extent.y + boxWorldPos.y,
            box.center.z - box.extent.z + boxWorldPos.z,
        ).asArray();
    }

    export function getBoxShapeMax(box: BoxCollisionShape, boxWorldPos: Vector3, out: Vector3) {
        return out.set(
            box.center.x + box.extent.x + boxWorldPos.x,
            box.center.y + box.extent.y + boxWorldPos.y,
            box.center.z + box.extent.z + boxWorldPos.z,
        ).asArray();
    }

    export let boxMesh: VertexBuffer;
    export let sphereMesh: VertexBuffer;
}

export class CollisionUtils {    

    static boxIntersectsWithSphereShape(
        box: BoxCollisionShape, 
        boxTransform: Transform, 
        sphere: SphereCollisionShape, 
        sphereTransform: Transform
    ) {
        let { _sphereWorldPos } = Private.boxIntersectsWithSphereShape;
        let rotatedCenter = Vector3.dummy.copy(sphere.center).rotate(sphereTransform.worldRotation);
        _sphereWorldPos.addVectors(rotatedCenter, sphereTransform.worldPosition);
        return CollisionUtils.boxIntersectsWithSphere(box, boxTransform.worldPosition, _sphereWorldPos, sphere.radius);
    }

    static boxIntersectsWithSphere(box: BoxCollisionShape, boxWorldPos: Vector3, center: Vector3, radius: number) {
        let s = 0;
        let d = 0;
        let { boxMin, boxMax } = Private.boxIntersectsWithSphere;
        let boxMinArray = Private.getBoxShapeMin(box, boxWorldPos, boxMin);
        let boxMaxArray = Private.getBoxShapeMax(box, boxWorldPos, boxMax);
        let sphereCenterArray = center.asArray();
        for (let i = 0; i < 3; ++i) {
            if (sphereCenterArray[i] < boxMinArray[i]) {
                s = sphereCenterArray[i] - boxMinArray[i];
                d += s * s;
            } else if (sphereCenterArray[i] > boxMaxArray[i]) {
                s = sphereCenterArray[i] - boxMaxArray[i];
                d += s * s;
            }
        }
        return d <= (radius * radius);
    }

    static boxIntersectsWithBox(
        box1: BoxCollisionShape, 
        boxWorldPos1: Vector3, 
        box2: BoxCollisionShape, 
        boxWorldPos2: Vector3
    ) {
        let { box1Min, box1Max, box2Min, box2Max } = Private.boxIntersectsWithBox;
        let box1MinArray = Private.getBoxShapeMin(box1, boxWorldPos1, box1Min);
        let box1MaxArray = Private.getBoxShapeMax(box1, boxWorldPos1, box1Max);
        let box2MinArray = Private.getBoxShapeMin(box2, boxWorldPos2, box2Min);
        let box2MaxArray = Private.getBoxShapeMax(box2, boxWorldPos2, box2Max);
        for (let i = 0; i < 3; ++i) {
            if (box1MinArray[i] > box2MaxArray[i]) {
                return false;
            }
        }
        for (let i = 0; i < 3; ++i) {
            if (box2MinArray[i] > box1MaxArray[i]) {
                return false;
            }
        }
        return true;
    }

    static sphereIntersectsWithSphereShape(
        sphere1: SphereCollisionShape, 
        sphere1Transform: Transform, 
        sphere2: SphereCollisionShape, 
        sphere2Transform: Transform
    ) {
        const { _sphere1WorldPos, _sphere2WorldPos } = Private.sphereIntersectsWithSphereShape;
        const rotatedCenter1 = Vector3.dummy.copy(sphere1.center).rotate(sphere1Transform.worldRotation);
        const rotatedCenter2 = Vector3.dummy2.copy(sphere2.center).rotate(sphere2Transform.worldRotation);
        _sphere1WorldPos.addVectors(rotatedCenter1, sphere1Transform.worldPosition);
        _sphere2WorldPos.addVectors(rotatedCenter2, sphere2Transform.worldPosition);
        return this.sphereIntersectsWithSphere(_sphere1WorldPos, sphere1.radius, _sphere2WorldPos, sphere2.radius);
    }

    static sphereIntersectsWithSphere(sphere1Center: Vector3, sphere1Radius: number, sphere2Center: Vector3, sphere2Radius: number) {
        const distSquared = Vector3.distanceSq(sphere1Center, sphere2Center);
        const radii = sphere1Radius + sphere2Radius;
        return (distSquared < (radii * radii));
    }
}
