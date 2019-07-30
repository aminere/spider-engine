
import * as Attributes from "../../core/Attributes";
import { Quaternion } from "../../math/Quaternion";
import { Vector3 } from "../../math/Vector3";
import { Matrix44 } from "../../math/Matrix44";
import { Basis } from "../../math/Basis";
import { IKNode } from "./IKNode";
import { IKBallJoint } from "./IKConstraints";
import { MathEx } from "../../math/MathEx";
import { IKSolver } from "./IKSolver";
import { Transform } from "../../core/Transform";
import { IKSolverBase } from "./IKSolverBase";
import { Entity } from "../../core/Entity";

const FIK = require("fullik");

namespace Private {
    export let basis = new Basis();

    // tslint:disable-next-line
    export function onRootTransformChanged(root: Transform, ikChain: any) { // FIK.Chain3D
        const { x, y, z } = root.worldPosition;
        ikChain.setBaseLocation(new FIK.V3(x, y, z));
    }
}

export class IKGenericSolver extends IKSolverBase {

    @Attributes.unserializable()
    // tslint:disable-next-line
    private _ikSolver: any;

    @Attributes.unserializable()
    private _nodes!: IKNode[];

    @Attributes.unserializable()
    private _lookAtAdjustAngle = 0;

    @Attributes.unserializable()
    private _lookAtAdjustAxisUp = true;

    @Attributes.unserializable()
    private _entity: Entity | null = null;

    update() {
        const entity = this.getEntity();
        const effector = this.getEffector();
        if (!entity || !effector) {
            return;
        }

        if (!this._ikSolver) {

            // Make FIK object accessible to Fullik library code
            // TODO find a better way to handle this!
            Object.assign(window, { FIK });

            this._ikSolver = new FIK.Structure3D();
            const nodes: IKNode[] = [];
            entity.traverse(
                child => {
                    // Stop traversing if found solvers down stream
                    if (child.hasComponentByType(IKSolver) && child !== entity) {
                        return false;
                    }

                    const node = child.getComponent(IKNode);
                    if (node) {
                        nodes.push(node);
                    }
                    return true;
                },
                true
            );

            this._nodes = nodes;
            const rootBoneDirection = Vector3.fromPool();

            if (nodes.length > 1) {
                const ikChain = new FIK.Chain3D();

                this._entity = entity;
                entity.transform.changed.attach(() => Private.onRootTransformChanged(nodes[0].entity.transform, ikChain));

                for (let j = 0; j < nodes.length - 1; ++j) {                    
                    const boneStart = nodes[j].entity.transform.worldPosition;
                    const boneEnd = nodes[j + 1].entity.transform.worldPosition;
                    const bone = new FIK.Bone3D(
                        new FIK.V3(boneStart.x, boneStart.y, boneStart.z),
                        new FIK.V3(boneEnd.x, boneEnd.y, boneEnd.z)
                    );
                    ikChain.addBone(bone);

                    const isRootBone = j === 0;
                    if (isRootBone) {
                        rootBoneDirection
                            .substractVectors(boneEnd, boneStart)
                            // Remove influence of root rotation because it will be applied anyway by the scene graph
                            // After the bone lookAts are resolved
                            .rotate(entity.transform.worldRotation.getInverse(Quaternion.fromPool()))
                            .normalize();
                        const components = rootBoneDirection.asArray();
                        const maxComponent = Math.max(...components.map(Math.abs));
                        const normalizedComponents = components.map(c => Math.abs(c) === maxComponent ? Math.sign(c) : 0);
                        rootBoneDirection.setFromArray(normalizedComponents);
                    }

                    const node = nodes[j];
                    const constraint = node.constraint.instance;
                    if (constraint) {
                        if (constraint.isA(IKBallJoint)) {
                            const ballJoint = constraint as IKBallJoint;
                            const rangeDegrees = MathEx.toDegrees(ballJoint.rotationRange);
                            if (isRootBone) {
                                ikChain.setRotorBaseboneConstraint(
                                    "local",
                                    new FIK.V3(rootBoneDirection.x, rootBoneDirection.y, rootBoneDirection.z),
                                    rangeDegrees
                                );
                            } else {
                                bone.joint.setAsBallJoint(rangeDegrees);
                            }
                        }
                    }
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

                // Determine look at adjustment
                // Quaternion.lookAt() assumes the geometry is aligned along the forward (Z axis)
                // If it's not the case, introduce a rotation adjustment to make sure
                // Resolved lookAt rotations give the intended result
                this._lookAtAdjustAxisUp = rootBoneDirection.y === 0;
                this._lookAtAdjustAngle = Math.acos(rootBoneDirection.dot(Vector3.forward));
                if (rootBoneDirection.x !== 0) {
                    this._lookAtAdjustAngle *= -Math.sign(rootBoneDirection.x);
                } else if (rootBoneDirection.y !== 0) {
                    this._lookAtAdjustAngle *= Math.sign(rootBoneDirection.y);
                }
            }
        }

        // TODO only do this if target moved
        this._ikSolver.update();

        // Update transforms
        // TODO only do this if IK was just solved        
        const lookAtDir = Vector3.fromPool();
        const lookAtRotation = Quaternion.fromPool();
        const lookAtAdjust = Quaternion.fromPool();
        const rotationMatrix = Matrix44.fromPool();
        const invParentMatrix = Matrix44.fromPool();
        const chain = this._ikSolver.chains[0];
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
            if (this._lookAtAdjustAngle !== 0) {
                lookAtAdjust.setFromAxisAngle(
                    this._lookAtAdjustAxisUp ? Private.basis.up : Private.basis.right,
                    this._lookAtAdjustAngle
                );
                lookAtRotation.multiply(lookAtAdjust);
            }

            const node = this._nodes[j];
            const parentTransform = node.entity.parent ? node.entity.parent.transform : null;
            if (parentTransform) {
                invParentMatrix.copy(parentTransform.worldMatrix).invert();

                // update position 
                const position = Vector3.fromPool()
                    .set(bone.start.x, bone.start.y, bone.start.z)
                    .transform(invParentMatrix);
                node.entity.transform.position.lerp(position, effector.influence);

                // update rotation                    
                const rotation = invParentMatrix
                    .multiply(rotationMatrix.setRotation(lookAtRotation))
                    .getRotation(Quaternion.fromPool());
                node.entity.transform.rotation.slerp(rotation, effector.influence);

            } else {
                node.entity.transform.position.set(bone.start.x, bone.start.y, bone.start.z);
                lookAtDir.set(
                    bone.end.x - bone.start.x,
                    bone.end.y - bone.start.y,
                    bone.end.z - bone.start.z
                )
                    .normalize();
                node.entity.transform.rotation.copy(lookAtRotation);
            }
        }
        entity.transform.eventsEnabled = true;
    }

    destroy() {
        if (this._entity) {
            this._entity.transform.changed.detach();
        }
    }
}
