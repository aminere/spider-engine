import { Component } from "../../core/Component";
import * as Attributes from "../../core/Attributes";
import { IKChain } from "./IKChain";
import { Quaternion } from "../../math/Quaternion";
import { Vector3 } from "../../math/Vector3";
import { Matrix44 } from "../../math/Matrix44";
import { Basis } from "../../math/Basis";

const FIK = require("fullik");

export class IKSolver extends Component {

    @Attributes.unserializable()
    // tslint:disable-next-line
    private _ikSolver: any;

    @Attributes.unserializable()
    private _chains!: IKChain[];

    @Attributes.unserializable()
    private _basis = new Basis();

    update() {
        if (!this._ikSolver) {

            // Make FIK object accessible to Fullik library code
            // TODO find a better way to handle this!
            Object.assign(window, { FIK });

            this._ikSolver = new FIK.Structure3D();
            const chains = this.entity.getComponents(IKChain);

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
                }
                this._ikSolver.add(
                    ikChain,
                    new Proxy(
                        chain.target,
                        {
                            get: (target, prop) => {
                                // TODO assert that prop is x, y, z
                                return target.transform.worldPosition[prop];
                            }
                        }
                    )
                );
            }
            this._chains = chains;
        }

        this._ikSolver.update();

        // Update transforms
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
                const node = chain.nodes[j];
                lookAtDir.copy(bone.end).substract(bone.start).normalize();                
                this._basis.setFromForward(lookAtDir);
                // TODO get initial angle between bone at T-pose and world forward
                lookAtAdjust.setFromAxisAngle(this._basis.up, 0); // -Math.PI / 2);
                lookAtRotation.lookAt(lookAtDir, this._basis.up).multiply(lookAtAdjust);

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
