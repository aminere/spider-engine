
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
import { Quaternion } from "../math/Quaternion";

class PhysicsShapeFactory {
    static create(shape: CollisionShape, transform: Transform) {
        const { scale } = transform;
        if (shape.isA(BoxCollisionShape)) {
            const box = shape as BoxCollisionShape;
            const cannonExtents = new Cannon.Vec3(box.extent.x * scale.x, box.extent.y * scale.y, box.extent.z * scale.z);
            return {
                shape: new Cannon.Box(cannonExtents),
                offset: box.center
            };
        } else if (shape.isA(SphereCollisionShape)) {
            const sphere = shape as SphereCollisionShape;
            return {
                shape: new Cannon.Sphere(sphere.radius * scale.x),
                offset: sphere.center
            };
        } else if (shape.isA(PlaneCollisionShape)) {
            return {
                shape: new Cannon.Plane(),
                offset: transform.worldPosition
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
    Static = Cannon.Body.STATIC,
    Dynamic = Cannon.Body.DYNAMIC,
    Kinematic = Cannon.Body.KINEMATIC
}

interface CollideEvent {
    body: Cannon.Body;
    target: Cannon.Body;
    contact: Cannon.ContactEquation;
}

namespace Private {    
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

    @Attributes.enumLiterals(RigidBodyType)
    private _type = RigidBodyType.Dynamic;

    @Attributes.unserializable()
    private _rigidBody!: Cannon.Body;

    @Attributes.unserializable()
    private _cannonPlaneRotationAdjustment = false;

    update(context: PhysicsContext) {
        const { transform } = this.entity;
        if (!this._rigidBody) {
            this._rigidBody = new Cannon.Body();
            this._rigidBody.mass = this._mass;
            this._rigidBody.type = this._type;
            const collider = this.entity.getComponent(Collider);
            if (collider) {
                for (const shape of collider.shapes) {
                    if (shape) {
                        const physicsShapeInfo = PhysicsShapeFactory.create(shape, this.entity.transform);
                        if (physicsShapeInfo) {
                            const { x, y, z } = physicsShapeInfo.offset;
                            this._rigidBody.addShape(physicsShapeInfo.shape, new Cannon.Vec3(x, y, z));

                            // This is a limitation of cannon.js
                            // Planes are assumed to have a (0, 0, 1) normal
                            // Since up direction in spider is (0, 1, 0),
                            // Need to apply a 90 degrees rotation around X axis to make planes behave as expected.
                            if (shape.isA(PlaneCollisionShape)) {
                                this._cannonPlaneRotationAdjustment = true;
                            }
                        }
                    }
                }
            }
            
            this.applyTransformToRigidBody(transform, this._rigidBody.position, this._rigidBody.quaternion);
            context.world.addBody(this._rigidBody);
            this._rigidBody.addEventListener("collide", this.onCollision);
        } else {
            if (this._type === RigidBodyType.Static) {
                this.applyTransformToRigidBody(transform, this._rigidBody.position, this._rigidBody.quaternion);
            } else {
                Private.applyRigidBodyToTransform(this._rigidBody.position, this._rigidBody.quaternion, transform);
            }
        }
    }

    destroy() {
        if (this._rigidBody) {
            this._rigidBody.removeEventListener("collide", this.onCollision);
            const physicsContext = this.entity.getAncestorOfType(PhysicsContext);
            if (physicsContext) {
                physicsContext.world.remove(this._rigidBody);
            }
        }
    }

    private onCollision(e: CollideEvent) {
    }

    private applyTransformToRigidBody(transform: Transform, position: Cannon.Vec3, quaternion: Cannon.Quaternion) {
        {
            const { x, y, z } = transform.position;
            position.set(x, y, z);
        }
        {
            let rotation = transform.rotation;
            if (this._cannonPlaneRotationAdjustment) {
                rotation = Quaternion.fromPool().copy(rotation).multiply(
                    Quaternion.fromPool().setFromAxisAngle(Vector3.right, -Math.PI / 2)
                );
            }
            const { x, y, z, w } = rotation;
            quaternion.set(x, y, z, w);
        }
    }
}
