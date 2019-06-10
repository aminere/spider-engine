
import * as Cannon from "cannon";
import * as Attributes from "../core/Attributes";
import { PhysicsContext } from "./PhysicsContext";
import { Collider } from "../collision/Collider";
import { CollisionShape } from "../collision/CollisionShape";
import { BoxCollisionShape } from "../collision/BoxCollisionShape";
import { SphereCollisionShape } from "../collision/SphereCollisionShape";
import { MeshCollisionShape } from "../collision/MeshCollisionShape";
import { Vector3 } from "../math/Vector3";
import { PlaneCollisionShape } from "../collision/PlaneCollisionShape";
import { Transform } from "../core/Transform";
import { Component } from "../core/Component";

/**
 * @hidden
 */
class PhysicsShapeFactory {
    static create(shape: CollisionShape, scale: Vector3) {
        if (shape.isA(BoxCollisionShape)) {
            let box = shape as BoxCollisionShape;
            let cannonExtents = new Cannon.Vec3(box.extent.x * scale.x, box.extent.y * scale.y, box.extent.z * scale.z);
            return {
                shape: new Cannon.Box(cannonExtents),
                offset: box.center
            };
        } else if (shape.isA(SphereCollisionShape)) {
            let sphere = shape as SphereCollisionShape;
            return {
                shape: new Cannon.Sphere(sphere.radius * scale.x),
                offset: sphere.center
            };
        } else if (shape.isA(PlaneCollisionShape)) {
            let planeShape = (shape as PlaneCollisionShape);
            const { plane } = planeShape;
            let cannonPlane = new Cannon.Plane();
            cannonPlane.worldNormal.set(plane.normal.x, plane.normal.y, plane.normal.z);
            cannonPlane.boundingSphereRadius = scale.x * 999999; // TODO is this radius OK for a plane?
            return {
                shape: cannonPlane,
                offset: new Vector3().copy(plane.normal).multiply(plane.distFromOrigin)
            };
        // } else if (shape.isA(MeshCollisionShape)) {
        //     let mesh = (shape as MeshCollisionShape).mesh.asset;
        //     if (mesh) {
        //         let positions = mesh.vertexBuffer.getData("position");
        //         let indices: number[] = [];
        //         indices.length = positions.length / 3;
        //         for (let i = 0; i < indices.length; ++i) {
        //             indices[i] = i;
        //         }
        //         return {
        //             shape: new Cannon.Trimesh(positions, indices),
        //             offset: Vector3.zero
        //         };
        //     }
        }
        return null;
    }
}

export enum RigidBodyType {
    Static,
    Dynamic,
    Kinematic
}

/**
 * @hidden
 */
export class RigidBodyTypeMetadata {
    static literals = {
        Static: Cannon.Body.STATIC,
        Dynamic: Cannon.Body.DYNAMIC,
        Kinematic: Cannon.Body.KINEMATIC
    };
}

interface CollideEvent {
    body: Cannon.Body;
    target: Cannon.Body;
    contact: Cannon.ContactEquation;
}

namespace Private {
    export function applyTransformToRigidBody(transform: Transform, position: Cannon.Vec3, rotation: Cannon.Quaternion) {
        {
            const { x, y, z } = transform.position;
            position.set(x, y, z);
        }
        {
            const { x, y, z, w } = transform.rotation;
            rotation.set(x, y, z, w);
        }
    }

    export function applyRigidBodyToTransform(position: Cannon.Vec3, rotation: Cannon.Quaternion, transform: Transform) {
        {
            const { x, y, z } = position;
            transform.position.set(x, y, z);
        }
        {
            const { x, y, z, w } = rotation;
            transform.rotation.set(x, y, z, w);
        }
    }
}

export class RigidBody extends Component {

    set mass(mass: number) {
        if (mass <= 0) {
            mass = 0;
            this._type = RigidBodyType.Static;
        } else {
            if (this._type === RigidBodyType.Static) {
                this._type = RigidBodyType.Dynamic;
            }
        }
        this._mass = mass;
        if (this._rigidBody) {
            this._rigidBody.mass = mass;
            this._rigidBody.type = this._type;
        }
    }
    get mass() { return this._mass; }

    // Mostly needed for access from game code
    get body() { return this._rigidBody; }

    set type(type: number) {
        this._type = type;
        if (type === RigidBodyType.Static) {
            this._mass = 0;
        } else {
            if (this._mass <= 0) {
                this._mass = 1;
            }
        }
        if (this._rigidBody) {
            this._rigidBody.mass = this._mass;
            this._rigidBody.type = this._type;
        }
    }

    private _mass = 1;
    private _type = RigidBodyType.Dynamic;

    @Attributes.unserializable()
    private _rigidBody!: Cannon.Body;

    update(context: PhysicsContext) {
        if (!this._rigidBody) {
            this._rigidBody = new Cannon.Body();
            this._rigidBody.mass = this._mass;
            this._rigidBody.type = this._type;
            Private.applyTransformToRigidBody(this.entity.transform, this._rigidBody.position, this._rigidBody.quaternion);
            let collider = this.entity.getComponent(Collider);
            if (collider) {
                for (let shape of collider.shapes) {
                    if (shape) {
                        let physicsShapeInfo = PhysicsShapeFactory.create(shape, this.entity.transform.scale);
                        if (physicsShapeInfo) {
                            const { x, y, z } = physicsShapeInfo.offset;
                            this._rigidBody.addShape(physicsShapeInfo.shape, new Cannon.Vec3(x, y, z));
                        }
                    }
                }
            }
            context.world.addBody(this._rigidBody);
            this._rigidBody.addEventListener("collide", this.onCollision);
        } else {
            if (this._type === RigidBodyType.Static) {
                Private.applyTransformToRigidBody(this.entity.transform, this._rigidBody.position, this._rigidBody.quaternion);
            } else {
                Private.applyRigidBodyToTransform(this._rigidBody.position, this._rigidBody.quaternion, this.entity.transform);
            }
        }
    }

    destroy() {
        if (this._rigidBody) {
            this._rigidBody.removeEventListener("collide", this.onCollision);
            let physicsContext = this.entity.getAncestorOfType(PhysicsContext);
            if (physicsContext) {
                physicsContext.world.remove(this._rigidBody);
            }
        }
    }

    private onCollision(e: CollideEvent) {
    }   
}
