import { Component } from "../core/Component";
import { Vector3 } from "../math/Vector3";
import { Collider } from "./Collider";
import { CollisionGroup } from "./CollisionGroup";
import { Triangle } from "../math/Triangle";
import { Plane, PlaneClassification } from "../math/Plane";
import { BoxCollisionShape } from "./BoxCollisionShape";
import { SphereCollisionShape } from "./SphereCollisionShape";
import { MeshCollisionShape } from "./MeshCollisionShape";
import { MathEx } from "../math/MathEx";
import { defaultAssets } from "../assets/DefaultAssets";
import { VertexBuffer } from "../graphics/VertexBuffer";
import { AssetReference } from "../serialization/AssetReference";
import { Time } from "../core/Time";

import * as Attributes from "../core/Attributes";
import { Reference } from "../serialization/Reference";
import { CollisionFilter } from "./CollisionFilter";

interface Collision {
    selfIntersectionPoint: Vector3;
    intersectionPoint: Vector3;
    toIntersection: number;
}

namespace Private {

    let boxMesh: VertexBuffer;
    let sphereMesh: VertexBuffer;

    let collision: Collision = {
        selfIntersectionPoint: new Vector3(),
        intersectionPoint: new Vector3(),
        toIntersection: 0
    };

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

    function getBoxMesh() {
        if (!boxMesh) {
            boxMesh = defaultAssets.primitives.box.vertexBuffer;
        }
        return boxMesh;
    }

    function getSphereMesh() {
        if (!sphereMesh) {
            sphereMesh = defaultAssets.primitives.sphere.vertexBuffer;
        }
        return sphereMesh;
    }

    // Collision Detection
    // Thanks to Kasper Fauerby - http://www.peroxide.dk/papers/collision/collision.pdf
    function detectCollision(
        position: Vector3,
        velocity: Vector3,
        radius: Vector3,
        colliders: Collider[]
    ) {
        let collisionValid = false;
        collision.toIntersection = 999999;

        const boxVertices = getBoxMesh().attributes.position as number[];
        const sphereVertices = getSphereMesh().attributes.position as number[];
        const v1 = Vector3.fromPool();
        const v2 = Vector3.fromPool();
        const v3 = Vector3.fromPool();
        const triangle = Triangle.fromPool();
        const plane = Plane.fromPool();
        const toSelf = Vector3.fromPool();
        const selfIntersectionPoint = Vector3.fromPool();
        const intersectionPoint = Vector3.fromPool();
        const edge = Vector3.fromPool();
        const baseToVertex = Vector3.fromPool();
        const velocityLength = velocity.length;

        for (const collider of colliders) {
            for (const shape of collider.shapes) {
                if (!shape) {
                    continue;
                }

                let box: BoxCollisionShape | null = null;
                let sphere: SphereCollisionShape | null = null;
                let vertices: number[];

                if (shape.isA(BoxCollisionShape)) {
                    box = shape as BoxCollisionShape;
                    vertices = boxVertices;

                } else if (shape.isA(SphereCollisionShape)) {
                    sphere = shape as SphereCollisionShape;
                    vertices = sphereVertices;

                } else if (shape.isA(MeshCollisionShape)) {
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

                } else {
                    // TODO warning unsupported collision shape
                    continue;
                }

                const triangleCount = (vertices.length / 3) / 3;
                const { worldMatrix } = collider.entity.transform;
                for (let i = 0; i < triangleCount; ++i) {
                    const index = i * 9;
                    if (box) {
                        v1.set(
                            (vertices[index] * box.extent.x) + box.center.x,
                            (vertices[index + 1] * box.extent.y) + box.center.y,
                            (vertices[index + 2] * box.extent.z) + box.center.z)
                            .transform(worldMatrix)
                            .divideVector(radius);

                        v2.set(
                            (vertices[index + 3] * box.extent.x) + box.center.x,
                            (vertices[index + 4] * box.extent.y) + box.center.y,
                            (vertices[index + 5] * box.extent.z) + box.center.z)
                            .transform(worldMatrix)
                            .divideVector(radius);

                        v3.set(
                            (vertices[index + 6] * box.extent.x) + box.center.x,
                            (vertices[index + 7] * box.extent.y) + box.center.y,
                            (vertices[index + 8] * box.extent.z) + box.center.z)
                            .transform(worldMatrix)
                            .divideVector(radius);
                    } else if (sphere) {
                        v1.set(
                            (vertices[index] * sphere.radius) + sphere.center.x,
                            (vertices[index + 1] * sphere.radius) + sphere.center.y,
                            (vertices[index + 2] * sphere.radius) + sphere.center.z)
                            .transform(worldMatrix)
                            .divideVector(radius);

                        v2.set(
                            (vertices[index + 3] * sphere.radius) + sphere.center.x,
                            (vertices[index + 4] * sphere.radius) + sphere.center.y,
                            (vertices[index + 5] * sphere.radius) + sphere.center.z)
                            .transform(worldMatrix)
                            .divideVector(radius);

                        v3.set(
                            (vertices[index + 6] * sphere.radius) + sphere.center.x,
                            (vertices[index + 7] * sphere.radius) + sphere.center.y,
                            (vertices[index + 8] * sphere.radius) + sphere.center.z)
                            .transform(worldMatrix)
                            .divideVector(radius);
                    } else {
                        v1.set(vertices[index], vertices[index + 1], vertices[index + 2])
                            .transform(worldMatrix)
                            .divideVector(radius);

                        v2.set(vertices[index + 3], vertices[index + 4], vertices[index + 5])
                            .transform(worldMatrix)
                            .divideVector(radius);

                        v3.set(vertices[index + 6], vertices[index + 7], vertices[index + 8])
                            .transform(worldMatrix)
                            .divideVector(radius);
                    }

                    plane.setFromPoints(v1, v2, v3);
                    const classification = plane.classifyPoint(position);

                    // skip planes facing away from the sphere 
                    // TODO is this necessary??
                    if (classification !== PlaneClassification.Front) {
                        continue;
                    }

                    // skip if moving away from plane
                    const nDotVelocity = plane.normal.dot(velocity);
                    if (nDotVelocity > 0) {
                        continue;
                    }

                    let t0 = -1;
                    let t1 = -1;
                    const distToPlane = plane.getSignedDistance(position);
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
                            // collider is embedded with the plane and will be colliding with it at all times
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
                        selfIntersectionPoint.copy(plane.normal).flip().add(position);
                        intersectionPoint.copy(velocity).multiply(t0).add(selfIntersectionPoint);
                        triangle.set(v1, v2, v3);
                        if (triangle.contains(intersectionPoint)) {
                            foundCollision = true;
                            collisionTime = t0;
                        }
                    }

                    if (!foundCollision) {
                        // Sweep against edges and vertices
                        let velocitySquaredLength = velocity.lengthSq;
                        let a, b, c;

                        // For each vertex or edge a quadratic equation have to
                        // be solved. We parameterize this equation as
                        // a*t^2 + b*t + c = 0 and below we calculate the
                        // parameters a,b and c for each test.
                        // Check against points:
                        a = velocitySquaredLength;
                        // P1                      
                        toSelf.copy(position).substract(v1);
                        b = 2 * velocity.dot(toSelf);
                        c = toSelf.lengthSq - 1.0;
                        let lowestRoot = Private.getLowestRoot(a, b, c, collisionTime);
                        if (lowestRoot !== null) {
                            collisionTime = lowestRoot;
                            foundCollision = true;
                            intersectionPoint.copy(v1);
                        }

                        // P2
                        toSelf.copy(position).substract(v2);
                        b = 2.0 * velocity.dot(toSelf);
                        c = toSelf.lengthSq - 1.0;
                        lowestRoot = Private.getLowestRoot(a, b, c, collisionTime);
                        if (lowestRoot !== null) {
                            collisionTime = lowestRoot;
                            foundCollision = true;
                            intersectionPoint.copy(v2);
                        }

                        // P3
                        toSelf.copy(position).substract(v3);
                        b = 2.0 * velocity.dot(toSelf);
                        c = toSelf.lengthSq - 1.0;
                        lowestRoot = Private.getLowestRoot(a, b, c, collisionTime);
                        if (lowestRoot !== null) {
                            collisionTime = lowestRoot;
                            foundCollision = true;
                            intersectionPoint.copy(v3);
                        }

                        // Check agains edges:
                        // p1 -> p2:
                        edge.substractVectors(v2, v1);
                        baseToVertex.substractVectors(v1, position);
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
                                intersectionPoint.copy(edge).multiply(f).add(v1);
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
                                intersectionPoint.copy(edge).multiply(f).add(v2);
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
                                intersectionPoint.copy(edge).multiply(f).add(v3);
                            }
                        }
                    }

                    if (foundCollision) {
                        const toIntersection = collisionTime * velocityLength;
                        // Keep closest hit only
                        if (toIntersection < collision.toIntersection) {
                            collision.selfIntersectionPoint.copy(selfIntersectionPoint);
                            collision.intersectionPoint.copy(intersectionPoint);
                            collision.toIntersection = toIntersection;
                            collisionValid = true;
                        }
                    }
                }
            }
        }

        return collisionValid ? collision : null;
    }

    // Collision Response
    // Thanks to Jeff Linahan - https://arxiv.org/ftp/arxiv/papers/1211/1211.0059.pdf
    export function collisionDetectionAndResponse(
        position: Vector3,
        velocity: Vector3,
        radius: Vector3,
        colliders: Collider[],
        positionOut: Vector3
    ) {
        // Keep a small safe distance from geometry to account for lost floating point precision
        const skin = .001;

        // convert position & velocity to ellipsoid space
        const localPosition = Vector3.fromPool().copy(position).divideVector(radius);
        const localVelocity = Vector3.fromPool().copy(velocity).divideVector(radius);
        const toWorldSpace = (local: Vector3) => local.multiplyVector(radius);

        const dest = Vector3.fromPool().addVectors(localPosition, localVelocity);
        const firstPlane = Plane.fromPool();
        const secondPlane = Plane.fromPool();
        const normalizedVelocity = Vector3.fromPool();
        const slidingPlaneOrigin = Vector3.fromPool();
        const slidingPlaneNormal = Vector3.fromPool();
        const crease = Vector3.fromPool();
        const toDestination = Vector3.fromPool();

        for (let i = 0; i < 3; ++i) {

            const velocityLength = localVelocity.length;
            if (MathEx.isZero(velocityLength)) {
                positionOut.copy(toWorldSpace(dest));
                return;
            }

            const col = detectCollision(localPosition, localVelocity, radius, colliders);
            if (!col) {
                positionOut.copy(toWorldSpace(dest));
                return;
            }

            normalizedVelocity.copy(localVelocity).divide(velocityLength);
            const shortDist = Math.max(col.toIntersection - skin, 0);
            localPosition.add(normalizedVelocity.multiply(shortDist));

            if (i === 0) {
                slidingPlaneOrigin.copy(col.intersectionPoint);
                slidingPlaneNormal.copy(localPosition).substract(col.intersectionPoint).normalize();
                firstPlane.setFromPoint(slidingPlaneNormal, slidingPlaneOrigin);
                const longRadius = 1 + skin;
                const d = firstPlane.getSignedDistance(dest);
                dest.substract(slidingPlaneNormal.multiply(d - longRadius));
                localVelocity.substractVectors(dest, localPosition);

            } else if (i === 1) {
                slidingPlaneOrigin.copy(col.intersectionPoint);
                slidingPlaneNormal.copy(localPosition).substract(col.intersectionPoint).normalize();
                secondPlane.setFromPoint(slidingPlaneNormal, slidingPlaneOrigin);
                crease.crossVectors(firstPlane.normal, secondPlane.normal).normalize();
                const dist = toDestination.substractVectors(dest, localPosition).dot(crease);
                localVelocity.copy(crease).multiply(dist);
                dest.addVectors(localPosition, localVelocity);
            }
        }
        
        positionOut.copy(toWorldSpace(localPosition));
    }
}

export class CharacterCollider extends Component {

    gravity = -10;
    radius = new Vector3(1, 1, 1);

    set desiredVelocity(velocity: Vector3) { this._desiredVelocity.copy(velocity); }
    get velocity() { return this._velocity; }

    get group() { return this._group.asset; }

    private _group = new AssetReference(CollisionGroup);
    private _filter = new Reference(CollisionFilter);

    @Attributes.unserializable()
    private _velocity = new Vector3();
    @Attributes.unserializable()
    private _desiredVelocity = new Vector3();

    update(colliders: Collider[]) {

        // TODO apply filter on colliders

        // Characters typically have their origin at their feet
        // Move the collider upwards so it spans the whole character and is not embedded in the ground
        const offset = Vector3.fromPool().set(0, this.radius.y, 0);
        const position = Vector3.fromPool().copy(this.entity.transform.worldPosition).add(offset);
        const positionOut = Vector3.fromPool();

        this._velocity.set(
            this._desiredVelocity.x,
            this._desiredVelocity.y || this._velocity.y,
            this._desiredVelocity.z
        );

        this._velocity.y += this.gravity * Time.deltaTime;
        const velocity = Vector3.fromPool().copy(this._velocity).multiply(Time.deltaTime);

        Private.collisionDetectionAndResponse(
            position,
            velocity,
            this.radius,
            colliders,
            positionOut
        );

        this._velocity.substractVectors(positionOut, position).divide(Time.deltaTime);
        this.entity.transform.worldPosition = positionOut.substract(offset);
    }
}
