import { Ray } from "../math/Ray";
import { CollisionGroup } from "../collision/CollisionGroup";
import { Collider } from "../collision/Collider";
import { Components } from "../core/Components";
import { SphereCollisionShape } from "../collision/SphereCollisionShape";
import { Vector3 } from "../math/Vector3";
import { BoxCollisionShape } from "../collision/BoxCollisionShape";
import { VisualCollisionShape } from "../collision/VisualCollisionShape";
import { VertexBuffer } from "../graphics/VertexBuffer";
import { MeshCollisionShape } from "../collision/MeshCollisionShape";
import { PlaneClassification, Plane } from "../math/Plane";
import { AABB } from "../math/AABB";
import { RaycastResult } from "../collision/RaycastResult";
import { Matrix44 } from "../math/Matrix44";
import { Triangle } from "../math/Triangle";
import { CollisionFilter } from "../collision/CollisionFilter";

namespace Private {
    export let aabb = new AABB();
    export let result = new RaycastResult();
    export let localRay = new Ray();
    export let invWorld = new Matrix44();
    export let rotatedCenter = new Vector3();
    export let v1 = new Vector3();
    export let v2 = new Vector3();
    export let v3 = new Vector3();
    export let plane = new Plane();
    export let triangle = new Triangle();
}

export class Physics {
    static rayCast(ray: Ray, filter?: CollisionFilter) {
        let colliders = Components.ofType(Collider);
        let collision = false;
        let toClosestIntersection = 999999;
        let { 
            aabb, 
            result,
            localRay,
            invWorld,
            rotatedCenter,
            v1,
            v2,
            v3,
            plane,
            triangle            
        } = Private;

        for (let collider of colliders) {
            if (filter && !filter.canCollideWith(collider.group)) {
                continue;
            }
            let shape = collider.shapes[0];
            let transform = collider.entity.transform;
            if (shape) {
                if (shape.isA(SphereCollisionShape)) {
                    let sphere = shape as SphereCollisionShape;
                    invWorld.copy(transform.worldMatrix).translate(sphere.center).invert();
                    localRay.copy(ray).transform(invWorld);
                    let sphereCollision = localRay.castOnSphere(Vector3.zero, sphere.radius);
                    if (sphereCollision) {
                        let worldIntersection = sphereCollision.intersection1.transform(transform.worldMatrix);
                        let toIntersection = Vector3.distance(worldIntersection, ray.origin);
                        if (toIntersection < toClosestIntersection) {
                            toClosestIntersection = toIntersection;
                            result.position.copy(worldIntersection);
                            result.normal.copy(sphereCollision.normal1.rotate(transform.worldRotation));
                            result.collider = collider;
                            result.shape = shape;
                            collision = true;
                        }
                    }
                } else if (shape.isA(BoxCollisionShape)) {
                    let box = shape as BoxCollisionShape;
                    // Take transform rotation into account
                    // Todo take transform scale into account                    
                    rotatedCenter.copy(box.center).rotate(transform.worldRotation);
                    aabb.min.set(
                        rotatedCenter.x - box.extent.x, 
                        rotatedCenter.y - box.extent.y, 
                        rotatedCenter.z - box.extent.z
                    );
                    aabb.max.set(
                        rotatedCenter.x + box.extent.x, 
                        rotatedCenter.y + box.extent.y, 
                        rotatedCenter.z + box.extent.z
                    );
                    invWorld.getInverse(transform.worldMatrix);
                    localRay.copy(ray).transform(invWorld);
                    let boxCollision = localRay.castOnAABB(aabb);
                    if (boxCollision) {
                        let worldIntersection = boxCollision.intersection1.transform(transform.worldMatrix);
                        let toIntersection = Vector3.distance(worldIntersection, ray.origin);
                        if (toIntersection < toClosestIntersection) {
                            toClosestIntersection = toIntersection;
                            result.position.copy(worldIntersection);
                            result.normal.copy(boxCollision.normal1.rotate(transform.worldRotation));
                            result.collider = collider;
                            result.shape = shape;
                            collision = true;
                        }
                    }
                } else if (shape.isA(VisualCollisionShape) || shape.isA(MeshCollisionShape)) {
                    let vertexBuffer: VertexBuffer | null = null;
                    if (shape.isA(VisualCollisionShape)) {
                        const visual = (shape as VisualCollisionShape).visual;
                        const geometry = visual ? visual.geometry : undefined;
                        vertexBuffer = geometry ? geometry.getVertexBuffer() : null;
                    } else {
                        const mesh = (shape as MeshCollisionShape).mesh.asset;
                        vertexBuffer = mesh ? mesh.vertexBuffer : null;
                    }
                    if (vertexBuffer) {
                        if (vertexBuffer.primitiveType !== "TRIANGLES" || vertexBuffer.indices) {
                            continue;
                        }
                        const positions = vertexBuffer.attributes.position as number[];
                        const triangleCount = (positions.length / 3) / 3;
                        for (let i = 0; i < triangleCount; ++i) {
                            const index = i * 9;
                            v1.set(positions[index], positions[index + 1], positions[index + 2]).transform(transform.worldMatrix);
                            v2.set(positions[index + 3], positions[index + 4], positions[index + 5]).transform(transform.worldMatrix);
                            v3.set(positions[index + 6], positions[index + 7], positions[index + 8]).transform(transform.worldMatrix);
                            plane.setFromPoints(v1, v2, v3);
                            const rayPlaneResult = ray.castOnPlane(plane);
                            if (rayPlaneResult.intersection) {
                                if (rayPlaneResult.classification === PlaneClassification.Front) {
                                    triangle.set(v1, v2, v3);
                                    if (triangle.contains(rayPlaneResult.intersection)) {
                                        let toIntersection = Vector3.distance(rayPlaneResult.intersection, ray.origin);
                                        if (toIntersection < toClosestIntersection) {
                                            toClosestIntersection = toIntersection;
                                            result.position.copy(rayPlaneResult.intersection);
                                            result.normal.copy(plane.normal);
                                            result.collider = collider;
                                            result.shape = shape;
                                            collision = true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return collision ? result : null;
    }
}
