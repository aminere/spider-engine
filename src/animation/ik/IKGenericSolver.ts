
import * as Attributes from "../../core/Attributes";
import { Quaternion } from "../../math/Quaternion";
import { Vector3 } from "../../math/Vector3";
import { Matrix44 } from "../../math/Matrix44";
import { Basis } from "../../math/Basis";
import { IKNode } from "./IKNode";
import { MathEx } from "../../math/MathEx";
import { IKSolver } from "./IKSolver";
import { IKSolverBase } from "./IKSolverBase";
import { Entity } from "../../core/Entity";
import { SerializableObject } from "../../core/SerializableObject";

const FIK = require("@aminere/fullik");

namespace Private {
    export let basis = new Basis();
    export const dummy = new FIK.V3();
}

export enum Axis {
    X,
    Y,
    Z
}

export class BaseRotation extends SerializableObject {
    @Attributes.enumLiterals(Axis)
    axis = Axis.Y;
    angle = -90;
}

export class IKGenericSolver extends IKSolverBase {

    baseRotation = new BaseRotation();

    @Attributes.unserializable()
    // tslint:disable-next-line
    private _ikSolver: any;

    @Attributes.unserializable()
    private _nodes!: IKNode[];

    @Attributes.unserializable()
    private _entity: Entity | null = null;

    @Attributes.unserializable()
    private _chainTransformChanged = false;

    @Attributes.unserializable()
    private _effectorTransformChanged = false;

    update() {
        const entity = this.getEntity();
        const effector = this.getEffector();
        if (!entity || !effector) {
            return;
        }

        if (!this._ikSolver) {
            const nodes: IKNode[] = [];
            entity.traverse(
                child => {
                    // Stop traversing if found solvers down stream
                    if (child.hasComponent(IKSolver) && child !== entity) {
                        return false;
                    }

                    const node = child.getComponent(IKNode);
                    if (node && node.active) {
                        nodes.push(node);
                    }
                    return true;
                },
                true
            );

            if (nodes.length < 1) {
                return;
            }

            // Make FIK object accessible to Fullik library code
            // TODO find a better way to handle this!
            Object.assign(window, { FIK });
            this._ikSolver = new FIK.Structure3D();
            this._nodes = nodes;
            this._entity = entity;
            this._chainTransformChanged = true;

            const ikChain = new FIK.Chain3D();
            for (let j = 0; j < nodes.length - 1; ++j) {
                const boneStart = nodes[j].entity.transform.worldPosition;
                const boneEnd = nodes[j + 1].entity.transform.worldPosition;
                const bone = new FIK.Bone3D(
                    new FIK.V3(boneStart.x, boneStart.y, boneStart.z),
                    new FIK.V3(boneEnd.x, boneEnd.y, boneEnd.z)
                );
                ikChain.addBone(bone);
            }

            this._ikSolver.add(
                ikChain,
                new Proxy(
                    effector,
                    {
                        get: (target, prop) => {
                            // TODO validate that prop is x, y, z
                            return target.entity.transform.worldPosition[prop];
                        }
                    }
                )
            );

            // Connect to change callbacks
            entity.transform.changed.attach(() => {
                this._chainTransformChanged = true;
            });
            effector.entity.transform.changed.attach(() => {
                this._effectorTransformChanged = true;
            });

        } else {
            if (this._chainTransformChanged) {
                const ikChain = this._ikSolver.chains[0];
                const rootPos = this._nodes[0].entity.transform.worldPosition;
                ikChain.setBaseLocation(Private.dummy.set(rootPos.x, rootPos.y, rootPos.z));
                for (let i = 0; i < this._nodes.length - 1; ++i) {
                    const boneStart = this._nodes[i].entity.transform.worldPosition;
                    const boneEnd = this._nodes[i + 1].entity.transform.worldPosition;
                    ikChain.bones[i].start.set(boneStart.x, boneStart.y, boneStart.z);
                    ikChain.bones[i].end.set(boneEnd.x, boneEnd.y, boneEnd.z);
                }
                ikChain.updateChainLength();
                ikChain.resetTarget();
            }
        }

        if (!this._chainTransformChanged && !this._effectorTransformChanged) {
            return;
        }

        this._ikSolver.update();

        // Update transforms
        const chain = this._ikSolver.chains[0];
        const lookAtDir = Vector3.fromPool();
        const lookAtRotation = Quaternion.fromPool();
        const lookAtAdjust = Quaternion.fromPool();
        const rotationMatrix = Matrix44.fromPool();
        const invParentMatrix = Matrix44.fromPool();

        entity.transform.eventsEnabled = false;
        for (let j = 0; j < chain.numBones; ++j) {
            const bone = chain.bones[j];
            lookAtDir
                .set(
                    bone.end.x - bone.start.x,
                    bone.end.y - bone.start.y,
                    bone.end.z - bone.start.z
                )
                .normalize();
            Private.basis.setFromForward(lookAtDir);
            lookAtRotation.lookAt(lookAtDir, Private.basis.up);
            if (this.baseRotation.angle !== 0) {
                lookAtAdjust.setFromAxisAngle(
                    (() => {
                        if (this.baseRotation.axis === Axis.Y) {
                            return Private.basis.up;
                        } else if (this.baseRotation.axis === Axis.X) {
                            return Private.basis.right;
                        }
                        return Private.basis.forward;
                    })(),
                    MathEx.toRadians(this.baseRotation.angle)
                );
                lookAtRotation.multiply(lookAtAdjust);
            }

            const node = this._nodes[j];
            const parentTransform = node.entity.parent ? node.entity.parent.transform : null;
            if (parentTransform) {
                invParentMatrix.copy(parentTransform.worldMatrix).invert();

                // update rotation
                const rotation = invParentMatrix
                    .multiply(rotationMatrix.setRotation(lookAtRotation))
                    .getRotation(Quaternion.fromPool());
                node.entity.transform.rotation.slerp(rotation, effector.influence);

            } else {
                node.entity.transform.rotation.slerp(lookAtRotation, effector.influence);
            }
        }
        entity.transform.eventsEnabled = true;
        this._chainTransformChanged = false;
        this._effectorTransformChanged = false;
    }

    destroy() {
        if (this._entity) {
            this._entity.transform.changed.detach();
        }
        const effector = this.getEffector();
        if (effector) {
            effector.entity.transform.changed.detach();
        }
    }
}
