import { Component } from "../../core/Component";
import * as Attributes from "../../core/Attributes";
import { IKChain } from "./IKChain";
import { Quaternion } from "../../math/Quaternion";
import { Vector3 } from "../../math/Vector3";
import { Matrix44 } from "../../math/Matrix44";
import { Basis } from "../../math/Basis";

const FIK = require("fullik");

namespace Private {
    export let basis = new Basis();
}

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
            const chains = this.entity.getComponents(IKChain);
            const fistBoneDirection = Vector3.fromPool();

            for (let i = 0; i < chains.length; ++i) {
                const chain = chains[i];
                chain.initialize();
                if (chain.nodes.length < 2 || !chain.target) {
                    continue;
                }

                const ikChain = new FIK.Chain3D();
                for (let j = 0; j < chain.nodes.length - 1; ++j) {
                    const boneStart = chain.nodes[j].entity.transform.worldPosition;
                    const boneEnd = chain.nodes[j + 1].entity.transform.worldPosition;
                    
                    ikChain.addBone(new FIK.Bone3D(
                        new FIK.V3(boneStart.x, boneStart.y, boneStart.z),
                        new FIK.V3(boneEnd.x, boneEnd.y, boneEnd.z)
                    ));

                    if (j === 0) {
                        fistBoneDirection.copy(boneEnd).substract(boneStart).normalize();
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
                const components = fistBoneDirection.asArray();
                const maxComponent = Math.max(...components.map(Math.abs));
                const normalizedComponents = components.map(c => Math.abs(c) === maxComponent ? Math.sign(c) : 0);
                fistBoneDirection.setFromArray(normalizedComponents);
                this._lookAtAdjustAxisUp = fistBoneDirection.y === 0;
                this._lookAtAdjustAngle = Math.acos(fistBoneDirection.dot(Vector3.forward));
                if (fistBoneDirection.x !== 0) {
                    this._lookAtAdjustAngle *= -Math.sign(fistBoneDirection.x);
                } else if (fistBoneDirection.y !== 0) {
                    this._lookAtAdjustAngle *= Math.sign(fistBoneDirection.y);
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
