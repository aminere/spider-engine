
import { Vector3 } from "../math/Vector3";
import { PlaneClassification, Plane } from "../math/Plane";
import { BoxCollisionShape } from "./BoxCollisionShape";
import { SphereCollisionShape } from "./SphereCollisionShape";
import { Collider } from "./Collider";
import { VertexBuffer } from "../graphics/VertexBuffer";
import { Debug } from "../io/Debug";
import { MathEx } from "../math/MathEx";
import { MeshCollisionShape } from "./MeshCollisionShape";
import { CollisionGroup } from "./CollisionGroup";
import { Triangle } from "../math/Triangle";
import { defaultAssets } from "../assets/DefaultAssets";
import { Transform } from "../core/Transform";

/**
 * @hidden
 */
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

    export function getLowestRoot(a: number, b: number, c: number, maxR: number) {
        // Check if a solution exists
        let determinant = b * b - 4 * a * c;
        // If determinant is negative it means no solutions.
        if (determinant < 0) {
            return null;
        }
        // calculate the two roots: (if determinant == 0 then
        // x1==x2 but let’s disregard that slight optimization)
        let sqrtD = Math.sqrt(determinant);
        let r1 = (-b - sqrtD) / (2 * a);
        let r2 = (-b + sqrtD) / (2 * a);
        // Sort so x1 <= x2
        if (r1 > r2) {
            let temp = r2;
            r2 = r1;
            r1 = temp;
        }
        // Get lowest root:
        if (r1 > 0 && r1 < maxR) {
            return r1;
        }
        // It is possible that we want x2 - this can happen
        // if x1 < 0
        if (r2 > 0 && r2 < maxR) {
            return r2;
        }
        return null;
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

/**
 * @hidden
 */
export class CollisionUtils {

    static get boxMesh() {
        if (!Private.boxMesh) {
            Private.boxMesh = defaultAssets.primitives.box.vertexBuffer;
        }
        return Private.boxMesh;
    }

    static get sphereMesh() {
        if (!Private.sphereMesh) {
            Private.sphereMesh = defaultAssets.primitives.sphere.vertexBuffer;
        }
        return Private.sphereMesh;
    }

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
        for (var i = 0; i < 3; ++i) {
            if (box1MinArray[i] > box2MaxArray[i]) {
                return false;
            }
        }
        for (i = 0; i < 3; ++i) {
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
        let { _sphere1WorldPos, _sphere2WorldPos } = Private.sphereIntersectsWithSphereShape;
        let rotatedCenter1 = Vector3.dummy.copy(sphere1.center).rotate(sphere1Transform.worldRotation);
        let rotatedCenter2 = Vector3.dummy2.copy(sphere2.center).rotate(sphere2Transform.worldRotation);
        _sphere1WorldPos.addVectors(rotatedCenter1, sphere1Transform.worldPosition);
        _sphere2WorldPos.addVectors(rotatedCenter2, sphere2Transform.worldPosition);
        return this.sphereIntersectsWithSphere(_sphere1WorldPos, sphere1.radius, _sphere2WorldPos, sphere2.radius);
    }

    static sphereIntersectsWithSphere(sphere1Center: Vector3, sphere1Radius: number, sphere2Center: Vector3, sphere2Radius: number) {
        let distSquared = Vector3.distanceSq(sphere1Center, sphere2Center);
        let radii = sphere1Radius + sphere2Radius;
        return (distSquared < (radii * radii));
    }    

    static moveSphere(
        _position: Vector3,
        _radius: number,
        _velocity: Vector3,
        _colliders: Collider[],
        positionOut: Vector3,
        velocityOut: Vector3,
        contactNormal?: Vector3,
        include?: CollisionGroup[],
        exclude?: CollisionGroup[]
    ) {
        const boxVertices = CollisionUtils.boxMesh.attributes.position as number[];
        const sphereVertices = CollisionUtils.sphereMesh.attributes.position as number[];
        const v1 = Vector3.fromPool();
        const v2 = Vector3.fromPool();
        const v3 = Vector3.fromPool();
        const triangle = Triangle.fromPool();
        const plane = Plane.fromPool();
        const sphereIntersectionPoint = Vector3.fromPool();
        const colliderIntersectionPoint = Vector3.fromPool();
        const closestSphereIntersectionPoint = Vector3.fromPool();
        const closestColliderIntersectionPoint = Vector3.fromPool();
        const contactPlane = Plane.fromPool();
        let maxRecursions = 3;

        const moveSphereRecursive = (
            position: Vector3,
            radius: number,
            velocity: Vector3,
            colliders: Collider[],
            newPosition: Vector3,
            newVelocity: Vector3
        ) => {
            const velocityLength = velocity.length;
            if (velocityLength === 0) {
                return false;
            }
            let collision = false;
            let toClosestIntersection = 999999;
            let velocityNormalized = Vector3.fromPool().copy(velocity).multiply(1 / velocityLength);
            // let invVelocityNormalized = Vector3.fromPool().copy(velocityNormalized).flip();
            for (const collider of colliders) {
                if (collider.group && !collider.group.isAllowed(include, exclude)) {
                    continue;
                }
                for (let shape of collider.shapes) {
                    if (!shape) {
                        continue;
                    }
                    let supported = shape.isA(BoxCollisionShape) 
                    || shape.isA(SphereCollisionShape) 
                    || shape.isA(MeshCollisionShape);
                    if (supported) {
                        let box: BoxCollisionShape | null = null;
                        let sphere: SphereCollisionShape | null = null;
                        let vertices: number[];
                        if (shape.isA(BoxCollisionShape)) {
                            box = shape as BoxCollisionShape;
                            vertices = boxVertices;
                        } else if (shape.isA(SphereCollisionShape)) {                        
                            sphere = shape as SphereCollisionShape;
                            vertices = sphereVertices;
                        } else {
                            let mesh = (shape as MeshCollisionShape).mesh.asset;
                            if (!mesh) {
                                continue;
                            }
                            if (mesh.vertexBuffer.primitiveType !== "TRIANGLES") {
                                continue;
                            }
                            if (mesh.vertexBuffer.indices) {
                                continue;
                            }
                            vertices = mesh.vertexBuffer.attributes.position as number[];
                        }

                        let triangleCount = (vertices.length / 3) / 3;
                        const { worldMatrix } = collider.entity.transform;
                        for (let i = 0; i < triangleCount; ++i) {
                            let index = i * 9;
                            if (box) {
                                v1.set(
                                    (vertices[index] * box.extent.x) + box.center.x,
                                    (vertices[index + 1] * box.extent.y) + box.center.y,
                                    (vertices[index + 2] * box.extent.z) + box.center.z)
                                    .transform(worldMatrix)
                                    .multiply(1 / radius);

                                v2.set(
                                    (vertices[index + 3] * box.extent.x) + box.center.x,
                                    (vertices[index + 4] * box.extent.y) + box.center.y,
                                    (vertices[index + 5] * box.extent.z) + box.center.z)
                                    .transform(worldMatrix)
                                    .multiply(1 / radius);

                                v3.set(
                                    (vertices[index + 6] * box.extent.x) + box.center.x,
                                    (vertices[index + 7] * box.extent.y) + box.center.y,
                                    (vertices[index + 8] * box.extent.z) + box.center.z)
                                    .transform(worldMatrix)
                                    .multiply(1 / radius);
                            } else if (sphere) {
                                v1.set(
                                    (vertices[index] * sphere.radius) + sphere.center.x,
                                    (vertices[index + 1] * sphere.radius) + sphere.center.y,
                                    (vertices[index + 2] * sphere.radius) + sphere.center.z)
                                    .transform(worldMatrix)
                                    .multiply(1 / radius);

                                v2.set(
                                    (vertices[index + 3] * sphere.radius) + sphere.center.x,
                                    (vertices[index + 4] * sphere.radius) + sphere.center.y,
                                    (vertices[index + 5] * sphere.radius) + sphere.center.z)
                                    .transform(worldMatrix)
                                    .multiply(1 / radius);

                                v3.set(
                                    (vertices[index + 6] * sphere.radius) + sphere.center.x,
                                    (vertices[index + 7] * sphere.radius) + sphere.center.y,
                                    (vertices[index + 8] * sphere.radius) + sphere.center.z)
                                    .transform(worldMatrix)
                                    .multiply(1 / radius);
                            } else {
                                v1.set(vertices[index], vertices[index + 1], vertices[index + 2])
                                    .transform(worldMatrix)
                                    .multiply(1 / radius);

                                v2.set(vertices[index + 3], vertices[index + 4], vertices[index + 5])
                                    .transform(worldMatrix)
                                    .multiply(1 / radius);

                                v3.set(vertices[index + 6], vertices[index + 7], vertices[index + 8])
                                    .transform(worldMatrix)
                                    .multiply(1 / radius);
                            }

                            plane.setFromPoints(v1, v2, v3);
                            let classification = plane.classifyPoint(position);

                            // skip planes facing away from the sphere 
                            // TODO is this necessary??
                            if (classification !== PlaneClassification.Front) {
                                continue;
                            }

                            // skip if moving away from plane
                            let dot = plane.normal.dot(velocityNormalized);
                            if (dot >= 0) {
                                continue;
                            }

                            let nDotVelocity = plane.normal.dot(velocity);
                            let t0 = -1;
                            let t1 = -1;
                            let distToPlane = plane.getSignedDistance(position);
                            let embeddedInPlane = false;

                            if (nDotVelocity !== 0) {
                                t0 = (1 - distToPlane) / nDotVelocity;
                                t1 = (-1 - distToPlane) / nDotVelocity;

                                if (t0 > t1) {
                                    let temp = t1;
                                    t1 = t0;
                                    t0 = temp;
                                }

                                if (t0 > 1 || t1 < 0) {
                                    // no collision can occur for the duration of motion
                                    continue;
                                }

                                // clamp to [0, 1]
                                t0 = MathEx.clamp(t0, 0, 1);
                                t1 = MathEx.clamp(t1, 0, 1);

                            } else {
                                if (Math.abs(distToPlane) < 1) {
                                    // plane is embedded with the plane and will be colliding with it at all times
                                    t0 = 0;
                                    t1 = 1;
                                    embeddedInPlane = true;
                                } else {
                                    continue;
                                }
                            }

                            let foundCollision = false;
                            let collisionTime = 1;
                            if (!embeddedInPlane) {
                                sphereIntersectionPoint.copy(plane.normal).flip().add(position);
                                colliderIntersectionPoint.copy(velocity).multiply(t0).add(sphereIntersectionPoint);
                                triangle.set(v1, v2, v3);
                                if (triangle.contains(colliderIntersectionPoint)) {
                                    foundCollision = true;
                                    collisionTime = t0;
                                }
                            }

                            if (!foundCollision) {
                                // Sweep against edges and vertices
                                let velocitySquaredLength = velocity.lengthSq;
                                let a, b, c;
                                let toSphere = Vector3.fromPool();

                                // For each vertex or edge a quadratic equation have to
                                // be solved. We parameterize this equation as
                                // a*t^2 + b*t + c = 0 and below we calculate the
                                // parameters a,b and c for each test.
                                // Check against points:
                                a = velocitySquaredLength;
                                // P1                      
                                toSphere.copy(position).substract(v1);
                                b = 2 * velocity.dot(toSphere);
                                c = toSphere.lengthSq - 1.0;
                                let lowestRoot = Private.getLowestRoot(a, b, c, collisionTime);
                                if (lowestRoot !== null) {
                                    collisionTime = lowestRoot;
                                    foundCollision = true;
                                    colliderIntersectionPoint.copy(v1);
                                }

                                // P2
                                toSphere.copy(position).substract(v2);
                                b = 2.0 * velocity.dot(toSphere);
                                c = toSphere.lengthSq - 1.0;
                                lowestRoot = Private.getLowestRoot(a, b, c, collisionTime);
                                if (lowestRoot !== null) {
                                    collisionTime = lowestRoot;
                                    foundCollision = true;
                                    colliderIntersectionPoint.copy(v2);
                                }

                                // P3
                                toSphere.copy(position).substract(v3);
                                b = 2.0 * velocity.dot(toSphere);
                                c = toSphere.lengthSq - 1.0;
                                lowestRoot = Private.getLowestRoot(a, b, c, collisionTime);
                                if (lowestRoot !== null) {
                                    collisionTime = lowestRoot;
                                    foundCollision = true;
                                    colliderIntersectionPoint.copy(v3);
                                }

                                // Check agains edges:
                                // p1 -> p2:                                
                                let edge = Vector3.fromPool().copy(v2).substract(v1);
                                let baseToVertex = Vector3.fromPool().copy(v1).substract(position);
                                let edgeSquaredLength = edge.lengthSq;
                                let edgeDotVelocity = edge.dot(velocity);
                                let edgeDotBaseToVertex = edge.dot(baseToVertex);
                                // Calculate parameters for equation
                                a = edgeSquaredLength * -velocitySquaredLength + edgeDotVelocity * edgeDotVelocity;
                                b = edgeSquaredLength * (2 * velocity.dot(baseToVertex)) - 2.0 * edgeDotVelocity * edgeDotBaseToVertex;
                                c = edgeSquaredLength * (1 - baseToVertex.lengthSq) + edgeDotBaseToVertex * edgeDotBaseToVertex;
                                // Does the swept sphere collide against infinite edge?
                                lowestRoot = Private.getLowestRoot(a, b, c, collisionTime);
                                if (lowestRoot !== null) {
                                    // Check if intersection is within line segment:
                                    let f = (edgeDotVelocity * lowestRoot - edgeDotBaseToVertex) / edgeSquaredLength;
                                    if (f >= 0.0 && f <= 1.0) {
                                        // intersection took place within segment.
                                        collisionTime = lowestRoot;
                                        foundCollision = true;
                                        colliderIntersectionPoint.copy(edge).multiply(f).add(v1);
                                    }
                                }

                                // p2 -> p3:
                                edge.copy(v3).substract(v2);
                                baseToVertex.copy(v2).substract(position);
                                edgeSquaredLength = edge.lengthSq;
                                edgeDotVelocity = edge.dot(velocity);
                                edgeDotBaseToVertex = edge.dot(baseToVertex);
                                a = edgeSquaredLength * -velocitySquaredLength + edgeDotVelocity * edgeDotVelocity;
                                b = edgeSquaredLength * (2 * velocity.dot(baseToVertex)) - 2.0 * edgeDotVelocity * edgeDotBaseToVertex;
                                c = edgeSquaredLength * (1 - baseToVertex.lengthSq) + edgeDotBaseToVertex * edgeDotBaseToVertex;
                                lowestRoot = Private.getLowestRoot(a, b, c, collisionTime);
                                if (lowestRoot !== null) {
                                    let f = (edgeDotVelocity * lowestRoot - edgeDotBaseToVertex) / edgeSquaredLength;
                                    if (f >= 0.0 && f <= 1.0) {
                                        collisionTime = lowestRoot;
                                        foundCollision = true;
                                        colliderIntersectionPoint.copy(edge).multiply(f).add(v2);
                                    }
                                }

                                // p3 -> p1:
                                edge.copy(v1).substract(v3);
                                baseToVertex.copy(v3).substract(position);
                                edgeSquaredLength = edge.lengthSq;
                                edgeDotVelocity = edge.dot(velocity);
                                edgeDotBaseToVertex = edge.dot(baseToVertex);
                                a = edgeSquaredLength * -velocitySquaredLength + edgeDotVelocity * edgeDotVelocity;
                                b = edgeSquaredLength * (2 * velocity.dot(baseToVertex)) - 2.0 * edgeDotVelocity * edgeDotBaseToVertex;
                                c = edgeSquaredLength * (1 - baseToVertex.lengthSq) + edgeDotBaseToVertex * edgeDotBaseToVertex;
                                lowestRoot = Private.getLowestRoot(a, b, c, collisionTime);
                                if (lowestRoot !== null) {
                                    let f = (edgeDotVelocity * lowestRoot - edgeDotBaseToVertex) / edgeSquaredLength;
                                    if (f >= 0.0 && f <= 1.0) {
                                        collisionTime = lowestRoot;
                                        foundCollision = true;
                                        colliderIntersectionPoint.copy(edge).multiply(f).add(v3);
                                    }
                                }
                            }

                            // Set result:
                            if (foundCollision === true) {
                                // distance to collision: ’t’ is time of collision
                                let distToCollision = collisionTime * velocityLength;
                                // Does this triangle qualify for the closest hit?
                                // it does if it’s the first hit or the closest
                                if (distToCollision < toClosestIntersection) {
                                    // Collision information nessesary for sliding
                                    closestSphereIntersectionPoint.copy(sphereIntersectionPoint);
                                    closestColliderIntersectionPoint.copy(colliderIntersectionPoint);
                                    toClosestIntersection = distToCollision;
                                    contactPlane.copy(plane);
                                    collision = true;
                                }
                            }                            
                        }
                    }
                }
            }

            if (collision) {
                let destinationPoint = Vector3.fromPool().addVectors(position, velocity);
                let _newPosition = Vector3.fromPool().copy(position);

                // move close to collision but not quite
                const skin = .1;
                if (toClosestIntersection >= skin) {
                    let v = Vector3.fromPool().copy(velocityNormalized).multiply(toClosestIntersection - skin);
                    _newPosition.addVectors(position, v);
                    // Adjust polygon intersection point (so sliding
                    // plane will be unaffected by the fact that we
                    // move slightly less than collision tells us)
                    v.copy(velocityNormalized).multiply(skin);
                    closestColliderIntersectionPoint.substract(v);
                }

                let slidingPlaneOrigin = Vector3.fromPool().copy(closestColliderIntersectionPoint);
                let slidingPlaneNormal = Vector3.fromPool().copy(_newPosition).substract(closestColliderIntersectionPoint).normalize();
                contactPlane.setFromPoint(slidingPlaneNormal, slidingPlaneOrigin);
                let dist = contactPlane.getSignedDistance(destinationPoint);
                let newDestinationPoint = Vector3.fromPool().copy(slidingPlaneNormal).multiply(-dist).add(destinationPoint);
                let _newVelocity = Vector3.fromPool().copy(newDestinationPoint).substract(closestColliderIntersectionPoint);
                // // determine sliding direction
                // let perpendicularVelocity = Vector3.fromPool().copy(velocity).projectOnVector(slidingPlaneNormal);
                // let _newVelocity = Vector3.fromPool().copy(velocity).substract(perpendicularVelocity);
                // newVelocity.copy(_newVelocity);
                newVelocity.copy(_newVelocity);
                newPosition.copy(_newPosition);
                if (contactNormal) {
                    contactNormal.copy(slidingPlaneNormal);
                }

                --maxRecursions;
                if (maxRecursions < 0) {
                    if (process.env.NODE_ENV === "development") {
                        Debug.logWarning("Max collision recursions hit");
                    }
                    return true;
                }

                // velocity too small, stop recursing
                if (newVelocity.length < .001) {
                    return true;
                }

                moveSphereRecursive(_newPosition, radius, _newVelocity, colliders, newPosition, newVelocity);
                return true;
            } else {
                return false;
            }            
        };
        
        // convert position & velocity to ellipsoid space
        let localVelocity = Vector3.fromPool().copy(_velocity).multiply(1 / _radius);
        let localPosition = Vector3.fromPool().copy(_position).multiply(1 / _radius);
        let _collision = moveSphereRecursive(localPosition, _radius, localVelocity, _colliders, positionOut, velocityOut);
        if (_collision) {
            // convert position & velocity back to world space
            positionOut.multiply(_radius);
            velocityOut.multiply(_radius);
        } else {
            positionOut.copy(_position);
            velocityOut.copy(_velocity);
        }
        return _collision;
        // return moveSphereRecursive(_position, _radius, _velocity, _colliders, positionOut, velocityOut);
    }
}
