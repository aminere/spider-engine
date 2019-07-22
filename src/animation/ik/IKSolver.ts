import { Component } from "../../core/Component";
import * as Attributes from "../../core/Attributes";
import { IKChain } from "./IKChain";
import { Quaternion } from "../../math/Quaternion";
import { Vector3 } from "../../math/Vector3";
import { Matrix44 } from "../../math/Matrix44";
import { Basis } from "../../math/Basis";
import { IKNode } from "./IKNode";
import { IKBallJoint } from "./IKConstraints";
import { MathEx } from "../../math/MathEx";

const FIK = require("fullik");

namespace Private {
    export let basis = new Basis();
}

@Attributes.exclusiveWith("IKNode")
export class IKSolver extends Component {

    @Attributes.unserializable()
    // tslint:disable-next-line
    private _ikSolver: any;

    @Attributes.unserializable()
    private _chains!: IKChain[];

    @Attributes.unserializable()
    private _lookAtAdjustAngle = 0;
    
    @Attributes.unserializable()
    private _lookAtAdjustAxisUp = true;

    update() {
        if (!this._ikSolver) {

            // Make FIK object accessible to Fullik library code
            // TODO find a better way to handle this!
            Object.assign(window, { FIK });

            this._ikSolver = new FIK.Structure3D();
            const chains: IKChain[] = [];
            this.entity.traverse(
                child => {
                    // Stop traversing if found solvers down stream
                    if (child.hasComponentByType(IKSolver) && child !== this.entity) {
                        return false;
                    }
                    const chain = child.getComponent(IKChain);
                    if (chain) {
                        chains.push(chain);
                    }
                    return true;
                },
                true
            );
            
            const rootBoneDirection = Vector3.fromPool();

            for (let i = 0; i < chains.length; ++i) {
                const chain = chains[i];

                const nodes: IKNode[] = [];
                chain.entity.traverse(
                    child => {
                        // Stop traversing if found solvers or chains down stream
                        if ((
                            child.hasComponentByType(IKSolver)
                            ||
                            child.hasComponentByType(IKChain)
                        )
                            && child !== chain.entity
                        ) {
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
        
                chain.nodes = nodes;
                if (chain.nodes.length < 2 || !chain.target) {
                    continue;
                }

                const ikChain = new FIK.Chain3D();
                for (let j = 0; j < chain.nodes.length - 1; ++j) {
                    const boneStart = chain.nodes[j].entity.transform.worldPosition;
                    const boneEnd = chain.nodes[j + 1].entity.transform.worldPosition;
                    const bone = new FIK.Bone3D(
                        new FIK.V3(boneStart.x, boneStart.y, boneStart.z),
                        new FIK.V3(boneEnd.x, boneEnd.y, boneEnd.z)
                    );
                    ikChain.addBone(bone);

                    const isRootBone = j === 0;
                    if (isRootBone) {
                        rootBoneDirection.copy(boneEnd).substract(boneStart).normalize();
                        const components = rootBoneDirection.asArray();
                        const maxComponent = Math.max(...components.map(Math.abs));
                        const normalizedComponents = components.map(c => Math.abs(c) === maxComponent ? Math.sign(c) : 0);
                        rootBoneDirection.setFromArray(normalizedComponents);
                    }

                    const node = chain.nodes[j];
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
                        chain.target,
                        {
                            get: (target, prop) => {
                                // TODO validate that prop is x, y, z
                                return target.transform.worldPosition[prop];
                            }
                        }
                    )
                );

                // Determine look at adjustment                
                this._lookAtAdjustAxisUp = rootBoneDirection.y === 0;
                this._lookAtAdjustAngle = Math.acos(rootBoneDirection.dot(Vector3.forward));
                if (rootBoneDirection.x !== 0) {
                    this._lookAtAdjustAngle *= -Math.sign(rootBoneDirection.x);
                } else if (rootBoneDirection.y !== 0) {
                    this._lookAtAdjustAngle *= Math.sign(rootBoneDirection.y);
                }
            }
            this._chains = chains;
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
        for (let i = 0; i < this._chains.length; ++i) {
            const chain = this._chains[i];
            const ikChain = this._ikSolver.chains[i];
            for (let j = 0; j < ikChain.numBones; ++j) {
                const bone = ikChain.bones[j];                
                lookAtDir.copy(bone.end).substract(bone.start).normalize();                
                Private.basis.setFromForward(lookAtDir);                
                lookAtRotation.lookAt(lookAtDir, Private.basis.up);
                if (this._lookAtAdjustAngle !== 0) {
                    lookAtAdjust.setFromAxisAngle(
                        this._lookAtAdjustAxisUp ? Private.basis.up : Private.basis.right, 
                        this._lookAtAdjustAngle
                    );
                    lookAtRotation.multiply(lookAtAdjust);
                }                

                const node = chain.nodes[j];
                if (node.entity.parent) {
                    invParentMatrix.copy(node.entity.parent.transform.worldMatrix).invert();

                    // update position 
                    node.entity.transform.position
                        .copy(bone.start)
                        .transform(invParentMatrix);

                    // update rotation                    
                    invParentMatrix
                        .multiply(rotationMatrix.setRotation(lookAtRotation))
                        .getRotation(node.entity.transform.rotation);

                } else {
                    node.entity.transform.position.copy(bone.start);
                    lookAtDir.copy(bone.end).substract(bone.start).normalize();
                    node.entity.transform.rotation.copy(lookAtRotation);
                }
            }
        }
    }
}
