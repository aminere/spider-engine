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
import { Components } from "../core/Components";
import { Entity } from "../core/Entity";
import { Transform } from "../core/Transform";

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

    function detectCollision(
        position: Vector3, 
        velocity: Vector3,
        radius: Vector3,
        include?: CollisionGroup[],
        exclude?: CollisionGroup[]
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
        const colliders = Components.ofType(Collider);
        const selfIntersectionPoint = Vector3.fromPool();
        const intersectionPoint = Vector3.fromPool();
        const velocityLength = velocity.length;

        for (const collider of colliders) {
            if (collider.group && !collider.group.isAllowed(include, exclude)) {
                continue;
            }
            for (const shape of collider.shapes) {
                if (!shape) {
                    continue;
                }
                const supported = shape.isA(BoxCollisionShape) 
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
                                intersectionPoint.copy(v1);
                            }

                            // P2
                            toSphere.copy(position).substract(v2);
                            b = 2.0 * velocity.dot(toSphere);
                            c = toSphere.lengthSq - 1.0;
                            lowestRoot = Private.getLowestRoot(a, b, c, collisionTime);
                            if (lowestRoot !== null) {
                                collisionTime = lowestRoot;
                                foundCollision = true;
                                intersectionPoint.copy(v2);
                            }

                            // P3
                            toSphere.copy(position).substract(v3);
                            b = 2.0 * velocity.dot(toSphere);
                            c = toSphere.lengthSq - 1.0;
                            lowestRoot = Private.getLowestRoot(a, b, c, collisionTime);
                            if (lowestRoot !== null) {
                                collisionTime = lowestRoot;
                                foundCollision = true;
                                intersectionPoint.copy(v3);
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
        }

        return collisionValid ? collision : null;
    }

    export function collisionDetectionAndResponse(
        position: Vector3,
        velocity: Vector3,
        radius: Vector3,
        positionOut: Vector3,
        include?: CollisionGroup[],
        exclude?: CollisionGroup[]
    ) {
        // Keep a small safe distance from geometry to account for lost floating point precision
        const skin = .01;

        // convert position & velocity to ellipsoid space
        const localPosition = Vector3.fromPool().copy(position).divideVector(radius);
        const localVelocity = Vector3.fromPool().copy(velocity).divideVector(radius);
        const toWorldSpace = (local: Vector3) => local.multiplyVector(radius);

        const dest = Vector3.fromPool().addVectors(localPosition, localVelocity);
        const firstPlane = Plane.fromPool();
        const secondPlane = Plane.fromPool();
        const normalizedVelocity = Vector3.fromPool();        
        
        for (let i = 0; i < 3; ++i) {

            const velocityLength = localVelocity.length;
            if (velocityLength === 0) {
                positionOut.copy(toWorldSpace(dest));
                return;
            }
            
            const col = detectCollision(localPosition, localVelocity, radius, include, exclude);
            if (!col) {
                positionOut.copy(toWorldSpace(dest));
                return;
            }

            normalizedVelocity.copy(localVelocity).divide(velocityLength);
            const shortDist = Math.max(col.toIntersection - skin, 0);
            localPosition.add(Vector3.fromPool().copy(normalizedVelocity).multiply(shortDist));
            
            if (i === 0) {
                const slidingPlaneOrigin = Vector3.fromPool().copy(col.intersectionPoint);
                const slidingPlaneNormal = Vector3.fromPool().copy(localPosition).substract(col.intersectionPoint).normalize();
                firstPlane.setFromPoint(slidingPlaneNormal, slidingPlaneOrigin);    
                const longRadius = 1 + skin;
                const d = firstPlane.getSignedDistance(dest);
                dest.substract(slidingPlaneNormal.multiply(d - longRadius));
                localVelocity.substractVectors(dest, localPosition);

            } else if (i === 1) {
                const slidingPlaneOrigin = Vector3.fromPool().copy(col.intersectionPoint);
                const slidingPlaneNormal = Vector3.fromPool().copy(localPosition).substract(col.intersectionPoint).normalize();
                secondPlane.setFromPoint(slidingPlaneNormal, slidingPlaneOrigin);  
                const crease = Vector3.fromPool().crossVectors(firstPlane.normal, secondPlane.normal).normalize();
                const dist = Vector3.fromPool().substractVectors(dest, localPosition).dot(crease);
                localVelocity.copy(crease).multiply(dist);
                dest.addVectors(localPosition, localVelocity);
            }
        }
        positionOut.copy(toWorldSpace(localPosition));
    }
}

export class CharacterCollider extends Component {

    gravity = new Vector3(0, -10, 0);
    radius = new Vector3(1, 1, 1);

    set velocity(velocity: Vector3) {
        this._velocity.copy(velocity);
    }

    private _velocity = new Vector3();

    setEntity(entity: Entity) {
        super.setEntity(entity);
        entity.getOrSetComponent(Transform);
    }

    update() {
        const positionOut = Vector3.fromPool();
        Private.collisionDetectionAndResponse(
            this.entity.transform.worldPosition,
            this._velocity,
            this.radius,
            positionOut
        );
        this.entity.transform.worldPosition = positionOut;
    }
}
